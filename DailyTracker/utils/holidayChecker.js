require('dotenv').config();
const utils = require('./util');

const DateAPIKey = process.env.DATE_API_KEY;
const holidayCache = {}; // 휴일을 담아 놓는 캐시

async function isHoliday(date){
  
  const targetDay = date.day();
  if(targetDay === 0 || targetDay === 6) //0: SUN, 6: SAT
    return [true, targetDay];
  

  // **임시 처리 -> 공휴일 API 복구 중 (정부 데이터 센터 화재 문제로 보임.)**
  // const targetYear = date.year();
  // const targetMonth = date.month() + 1;
  // if(!holidayCache[`${targetYear}-${targetMonth}`]){
  //   holidayCache[`${targetYear}-${targetMonth}`] = await getHolidaysForMonth(targetYear, targetMonth);
  // }
  // const formattedDate = date.format('YYYY-MM-DD');
  // return [holidayCache[`${targetYear}-${targetMonth}`].has(formattedDate), targetDay];

  return [false, targetDay];
}

async function getHolidaysForMonth(year, month) {
    const holidays = new Set();
  
    // 해당 월의 공휴일 정보를 가져옵니다.
    const monthStr = String(month).padStart(2, '0');
    const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?solYear=${year}&solMonth=${monthStr}&serviceKey=${DateAPIKey}&_type=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      
      // 데이터가 정상적으로 왔는지 확인
      if (data.response.header.resultCode === '00' && data.response.body.items) {
        const items = data.response.body.items.item;
        
        // 공휴일이 여러 개(배열)인 경우와 하나(객체)인 경우를 모두 처리
        if (Array.isArray(items)) {
            items.forEach(item => {
            const dateStr = String(item.locdate); // "20251225"
            const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
            holidays.add(formattedDate);
            });
        } else if (items) {
            const dateStr = String(items.locdate);
            const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
            holidays.add(formattedDate);
        }
      }
    } catch (error) {
      console.error(`${year}년 ${monthStr}월 공휴일 정보 조회 실패:`, error);
    }
  
  return holidays;
}


/* --- test code ---*/
// (async (params) => {
//   console.log(await isHoliday(utils.todayKST));
// })();

module.exports = isHoliday;