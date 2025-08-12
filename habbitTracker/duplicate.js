require('dotenv').config();
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.DATABASE_ID;


const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

async function getPages() {
  let initialResults = [];
  let cursor;

  // 1단계 (API 필터): 성능을 위해 최근 3일치 데이터만 요청
  const threeDaysAgo = dayjs().tz('Asia/Seoul').subtract(2, 'day').startOf('day').toISOString();

  console.log(`[1/2] 성능 최적화를 위해 최근 3일치('고정' 상태) 데이터만 가져옵니다...`);

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter: {
        and: [
          { property: '상태', select: { equals: '고정' } },
          { property: '날짜', date: { on_or_after: threeDaysAgo } },
        ]
      },
    });
    initialResults = initialResults.concat(response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  console.log(`[2/2] 가져온 ${initialResults.length}개 중 어제 날짜 페이지만 정확히 필터링합니다...`);
  
  // 2단계 (코드 필터): 가져온 데이터 중 정확히 어제 날짜만 골라냄
  const yesterdayStart = dayjs().tz('Asia/Seoul').subtract(1, 'day').startOf('day');
  const yesterdayEnd = dayjs().tz('Asia/Seoul').subtract(1, 'day').endOf('day');

  const yesterdayPages = initialResults.filter(page => {
    const pageDateStr = page.properties.날짜.date?.start;
    if (!pageDateStr) return false;
    
    const pageDate = dayjs(pageDateStr); 
    return pageDate.isBetween(yesterdayStart, yesterdayEnd, null, '[]');
  });

  return yesterdayPages;
}

// 이하 다른 함수들은 이전과 동일합니다.

function getTitleText(titleProp) {
  return titleProp?.title?.[0]?.plain_text || '(제목 없음)';
}

function updateDate(dateProp){
  if(dateProp === null) return null;
  const todayKST = dayjs().tz('Asia/Seoul');
  if(String(dateProp).includes('T')){
    const originalDate = dayjs(dateProp);
    return todayKST.hour(originalDate.hour()).minute(originalDate.minute()).second(originalDate.second()).format();
  }
  return todayKST.format('YYYY-MM-DD');
}

function buildNewProperties(original) {
  const props = original.properties;
  const newProps = {};

  newProps['일정'] = { title: [{ text: { content: getTitleText(props['일정']) } }] };
  
  if (props['날짜']?.date?.start) {
    newProps['날짜'] = {
      date: {
        start: updateDate(props['날짜'].date.start),
        end: updateDate(props['날짜'].date.end),
      },
    };
  }

  if (props['상태']?.select?.name) {
    newProps['상태'] = { select: { name: props['상태'].select.name } };
  }

  const habitType = props['습관 구분']?.select?.name;
  if (habitType) {
    newProps['습관 구분'] = { select: { name: habitType } };
    newProps['확인'] = { checkbox: habitType === 'Bad' };
  } else {
    newProps['확인'] = { checkbox: false };
  }

  return newProps;
}

async function duplicateAllPages() {
  const pages = await getPages();
  console.log(`\n[최종 결과] 복제할 페이지 ${pages.length}개를 확정했습니다.`);

  for (const page of pages) {
    const newProps = buildNewProperties(page);
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: newProps,
    });
    console.log(`복제 완료: ${getTitleText(page.properties.일정)}`);
  }
}

module.exports = duplicateAllPages;