require('dotenv').config();
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;


const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const getYesterdayKST = () => {
  const yesterdayKST = dayjs().tz('Asia/Seoul').subtract(1, 'day');
  const start = yesterdayKST.startOf('day').toISOString();
  const end = yesterdayKST.endOf('day').toISOString();
  return { start, end };
}

// 모든 페이지 불러오기
async function getPages() {
  let results = [];
  let cursor;
  const yesterdayRange = getYesterdayKST();

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter:{
        and: [
            {
              property: '날짜',
              date: {
                on_or_after: yesterdayRange.start,
                on_or_before: yesterdayRange.end,
              },
            },
            {
              property: '상태', // Notion 속성 이름
              select: {
                equals: '고정',
              },
            }
          ],
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

function updateDate(dateProp){
  if(dateProp === null) return null;

  if(dateProp.includes('T')){
    const date = dayjs(dateProp);
    return dayjs().hour(date.hour()).minute(date.minute()).second(date.second());
  }

  return dayjs().format('YYYY-MM-DD');
}

// 새 페이지 생성용 프로퍼티 구성
function buildNewProperties(original) {
  const todayStart = updateDate(original.날짜.date.start);
  const todayEnd = updateDate(original.날짜.date.end);
  const status = original.상태.select?.name;
  const isHabit = original['습관 구분'].select?.name;
  const confirm = isHabit === 'Bad' ? true : false;

  return {
    '일정': {
      title: [
        {
          text: {
            content: getTitleText(original.일정)
          }
        }
      ]
    },
    '날짜': {
      date: {
        start: todayStart,
        end: todayEnd
      }
    },
    '상태': {
      select: {
        name: status
      }
    },
    '확인': {
      checkbox: confirm
    },
    '습관 구분': {
      select:{
        name: isHabit
      } 
    }
  };
}

async function duplicateAllPages() {
  const pages = await getPages();
  console.log(`총 ${pages.length}개 페이지를 복제합니다.`);

  for (const page of pages) {
    const newProps = buildNewProperties(page.properties);

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: newProps,
    });

    console.log(`복제 완료: ${getTitleText(page.properties.일정)}`);
  }
}

module.exports = duplicateAllPages;