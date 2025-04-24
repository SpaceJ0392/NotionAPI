require('dotenv').config();
const { Client } = require('@notionhq/client');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;

dayjs.extend(utc);
dayjs.extend(timezone);

const getYesterdayKST = () => {
  return dayjs().tz('Asia/Seoul').subtract(1, 'day').format('YYYY-MM-DD');
};

// 모든 페이지 불러오기
async function getAllPages() {
  let results = [];
  let cursor;
  const ymd = getYesterdayKST(); // 'YYYY-MM-DD'

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter:{
        property: '날짜',
        date: {
          equals: ymd // 어제 날짜와 일치하는 항목만
        }
      }
    });

    results = results.concat(response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return results;
}

// 제목 파싱 함수
function getTitleText(titleProp) {
  return titleProp?.title?.map(t => t.plain_text).join('') || '(제목 없음)';
}

// 새 페이지 생성용 프로퍼티 구성
function buildNewProperties(original) {
  const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD');
  const status = original.상태.select?.name;
  const confirm = status === 'Bad' ? true : false;

  return {
    '습관': {
      title: [
        {
          text: {
            content: getTitleText(original.습관)
          }
        }
      ]
    },
    '날짜': {
      date: {
        start: today
      }
    },
    '상태': {
      select: {
        name: status
      }
    },
    '확인': {
      checkbox: confirm
    }
  };
}

async function duplicateAllPages() {
  const pages = await getAllPages();
  console.log(`총 ${pages.length}개 페이지를 복제합니다.`);

  for (const page of pages) {
    const newProps = buildNewProperties(page.properties);

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: newProps,
    });

    console.log(`복제 완료: ${getTitleText(page.properties.습관)}`);
  }
}

module.exports = duplicateAllPages;