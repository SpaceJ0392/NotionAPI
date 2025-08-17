require('dotenv').config();
const { Client } = require('@notionhq/client');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');
const utils = require('./utils/util')

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

async function getSchedulePages() {
  let results = [];
  let cursor;

  const yesterdayStartKST = dayjs().tz('Asia/Seoul').subtract(1, 'day').startOf('day').toISOString();
  const yesterdayEndKST = dayjs().tz('Asia/Seoul').subtract(1, 'day').endOf('day').toISOString();

  console.log(`일정 데이터 가져오는 중...`);
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter: {
        and: [
          { property: 'Status', select: { equals: 'Schedule' } },
          { property: 'Checked', status: { equals: 'in progress'  } },
          { property: 'Checked', status: { equals: 'Not started'  } },
          { property: 'Date', date: { on_or_after: yesterdayStartKST } },
          { property: 'Date', date: { on_or_before: yesterdayEndKST } },
        ]
      },
    });
    results = results.concat(response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);
  
  return results;
}

async function insertSchedulePages() {
  
}

(async () => {
  try {
    
    const pages = await getSchedulePages();
    console.log(`\n✅ 총 ${pages.length}개`);

    // 찾은 페이지들의 제목을 출력하는 예시
    if (pages.length > 0) {
      console.log("\n[찾은 페이지 목록]");
      pages.forEach(page => { console.log(`- ${utils.getTitle(page.properties.Name)}`);});
    }

  } catch (error) {
    console.error(error);
  }
})();

//module.exports = insertSchedulePages;