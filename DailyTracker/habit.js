require('dotenv').config();
const utils = require('./utils/util.js');

const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;


async function getHabitPages(flag) {
  let results = [];
  let cursor;
  let dayType = flag ? 'Holiday' : 'WeekDay';
  console.log(`습관 데이터 가져오는 중...`);

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter: {
        and: [
          { property: 'Status', select: { equals: 'Habit' } },
          { property: 'Date', date: { is_empty: true } },
          { property: 'DayType', multi_select: { contains: dayType } }
        ]
      },
    });
    results = results.concat(response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return results;
}


async function insertHabitPages(flag) {
  const habitPages = await getHabitPages(flag);
  console.log(`\n복제할 페이지 ${habitPages.length}개.`);

  
  for (const habitPage of habitPages) {
    const habitProp = habitPage.properties;
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Checked': { status: habitProp.Checked.status },
        'Status' : { select: habitProp.Status.select },
        'Date' : { date: { start: utils.updateDate(habitProp.Date.date?.start) }},
        'Name' : { title: [ { text: {content : utils.getTitle(habitProp.Name)}} ] },
        'Type' : { select: habitProp.Type.select },
        'DayType' : { multi_select: habitProp.DayType.multi_select }
      }
    });

    console.log(`복제 완료: ${utils.getTitle(habitPage.properties.Name)}`);
  }   
}

async function getBadHabitPagesYesterday() {
  let results = [];
  let cursor;
  console.log(`어제자 나쁜 습관 데이터 가져오는 중...`);

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter: {
        and: [
          { property: 'Status', select: { equals: 'Habit' } },
          { property: 'Date', date: { on_or_after: utils.yesterdayStartKST } },
          { property: 'Date', date: { on_or_before: utils.yesterdayEndKST } },
          { property: 'Type', select: { equals: 'Bad' } },
          { property: 'Checked', status: { does_not_equal: 'Done'} }
        ],
      },
    });
    results = results.concat(response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return results;
}

async function updateBadHabitPagesYesterday() {
    const pages = await getBadHabitPagesYesterday();
    
    for(const page of pages){ 
      await notion.pages.update({
          page_id: page.id,
          properties: { 'Checked': { status: { name: 'Done'} } }
      });
      console.log(`어제자 나쁜 습관 업데이트 : ${utils.getTitle(page.properties.Name)}`); 
    }
}

/* -- test code -- */
// (async () => {
//   try {
//     const pages = await getBadHabitPagesYesterday();
//     console.log(JSON.stringify(pages, null, 2));

//     //await insertHabitPages(false);
//   } catch (error) {
//     console.error(error);
//   }
// })();

module.exports = {
  insertHabitPages,
  updateBadHabitPagesYesterday
};