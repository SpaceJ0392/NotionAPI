require('dotenv').config();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');
const utils = require('./utils/util.js');

const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);


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


/* -- test code -- */
// (async () => {
//   try {
//     await insertHabitPages(false);
//   } catch (error) {
//     console.error(error);
//   }
// })();

module.exports = insertHabitPages;