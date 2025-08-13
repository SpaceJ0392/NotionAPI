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
          { property: '상태', select: { equals: '변동' } },
          { property: '확인', checkbox: { equals: false } },
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


(async () => {
  try {
    console.log("🚀 스크립트를 시작합니다.");
    
    const pages = await getPages(); // 함수를 호출하고 결과를 변수에 저장
    
    console.log(`\n✅ 총 ${pages.length}개의 어제 날짜 페이지를 성공적으로 찾았습니다.`);

    // 찾은 페이지들의 제목을 출력하는 예시
    if (pages.length > 0) {
      console.log("\n[찾은 페이지 목록]");
      pages.forEach(page => {
        const title = page.properties.일정?.title[0]?.plain_text || '제목 없음';
        console.log(`- ${title} (ID: ${page.id})`);
        //console.log(JSON.stringify(page, null, 2));
      });
    }

  } catch (error) {
    console.error("❗️ 스크립트 실행 중 오류가 발생했습니다:", error);
  }
})();