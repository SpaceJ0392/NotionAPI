require('dotenv').config();
const utils = require('./utils/util.js');

const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;
const datasourceId = process.env.DATASOURCE_ID;

async function getDailyPages(flag) {
  let results = [];
  let cursor;
  let dayType = flag ? 'Holiday' : 'WeekDay';
  console.log(`습관 데이터 가져오는 중...`);

  do {
    const response = await notion.dataSources.query({
      data_source_id: datasourceId,
      start_cursor: cursor,
      filter: {
        and: [
          { property: 'Status', select: { equals: utils.DAILY } },
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

async function insertDailyPages(flag, todayDay) {
  const dailyPages = await getDailyPages(flag);

  for (const dailyPage of dailyPages) {
    const prop = dailyPage.properties;

    //요일 체크
    const weekDayOnDayType = prop.DayType.multi_select
                             .map(item => item.name).filter(name => name !== 'WeekDay' && name !== 'Holiday');
    if (weekDayOnDayType.length > 0 && !weekDayOnDayType.includes(utils.dayTypeDict[todayDay])){
      continue;
    }

    await notion.pages.create({
      parent: { 
        type: "data_source_id",
        data_source_id: datasourceId
      },
      properties: {
        'Checked': { status: prop.Checked.status },
        'Status' : { select: prop.Status.select },
        'Date' : { date: { start: utils.updateDate(prop.Date.date?.start) }},
        'Name' : { title: [ { text: {content : utils.getTitle(prop.Name)}} ] },
        'Type' : { select: prop.Type.select },
        'DayType' : { multi_select: prop.DayType.multi_select }
      }
    });

    console.log(`복제 완료: ${utils.getTitle(dailyPage.properties.Name)}`);
  }   
}

async function getDailyPagesYesterday(target, st) {
  let results = [];
  let cursor;
  console.log(`어제자 데이터 가져오는 중...`);

  do {
    const response = await notion.dataSources.query({
      data_source_id: datasourceId,
      start_cursor: cursor,
      filter: {
        and: [
          { property: 'Status', select: { equals: utils.DAILY } },
          { property: 'Date', date: { on_or_after: utils.yesterdayStartKST } },
          { property: 'Date', date: { on_or_before: utils.yesterdayEndKST } },
          { property: 'Type', select: { equals: target } },
          { property: 'Checked', status: { does_not_equal: st } }
        ],
      },
    });
    results = results.concat(response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return results;
}


//target -> Bad or Good
async function updateDailyPagesYesterday(target, st) {
    const pages = await getDailyPagesYesterday(target, 'Done');
    
    for(const page of pages){ 
      await notion.pages.update({
          page_id: page.id,
          properties: { 'Checked': { status: { name: st } } }
      });
      console.log(`어제자 습관 업데이트 : ${utils.getTitle(page.properties.Name)}`); 
    }
}

/* -- test code -- */
// (async () => {
//   try {
//     // const pages = await getHabitPages();
//     // console.log(pages.length);

//     await insertHabitPages(false);
//   } catch (error) {
//     console.error(error);
//   }
// })();

module.exports = {
  insertDailyPages,
  updateDailyPagesYesterday
};