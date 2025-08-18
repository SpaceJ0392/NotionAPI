require('dotenv').config();
const { Client } = require('@notionhq/client');
const utils = require('./utils/util')

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;

async function getSchedulePages() {
  let results = [];
  let cursor;

  console.log(`일정 데이터 가져오는 중...`);
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter: {
        and: [
          { property: 'Status', select: { equals: 'Schedule' } },
          { property: 'Date', date: { on_or_after: utils.yesterdayStartKST } },
          { property: 'Date', date: { on_or_before: utils.yesterdayEndKST } },
          { or:[
              { property: 'Checked', status: { equals: 'in progress'  } },
              { property: 'Checked', status: { equals: 'Not started'  } }
          ] }
        ]
      },
    });
    results = results.concat(response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);
  
  return results;
}

async function insertSchedulePages() {
    const schedulePages = await getSchedulePages();
    console.log(`\n복제할 페이지 ${schedulePages.length}개.`);
  
    
    for (const schedulePage of schedulePages) {
      const scheduleProp = schedulePage.properties;
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Checked': { status: scheduleProp.Checked.status },
          'Status' : { select: scheduleProp.Status.select },
          'Date' : { date: { start: utils.updateDate(scheduleProp.Date.date?.start) }},
          'Name' : { title: [ { text: {content : utils.getTitle(scheduleProp.Name)}} ] },
          'Type' : { select: scheduleProp.Type.select },
          'DayType' : { multi_select: scheduleProp.DayType?.multi_select }
        }
      });
  
      console.log(`복제 완료: ${utils.getTitle(schedulePage.properties.Name)}`);
    }  
}

// (async () => {
//   try {
    
//     //await insertSchedulePages();
//     const pages = await getSchedulePages();
//     console.log(`\n✅ 총 ${pages.length}개`);
//     //console.log(JSON.stringify(pages, null, 2));

//   } catch (error) {
//     console.error(error);
//   }
// })();

module.exports = insertSchedulePages;