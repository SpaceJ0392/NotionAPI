const insertHabitPages = require('./habit');
const isHoliday = require('./utils/holidayChecker');
const insertSchedulePages = require('./schedule');

// 매일 자정 (00:00)에 실행
(async () => {

  const logTime = require('dayjs')().tz('Asia/Seoul')
  console.log(`[${logTime.format('YYYY-MM-DD HH:mm:ss')}] 🕛 자동 복제 시작`);

  // 당일이 공휴일인지 확인.
  let flag = isHoliday(logTime);

  try {
    //작업1. 습관 업데이트
    console.log('\n1. 습관 업데이트 시작...');
    await insertHabitPages(flag);
    console.log('✅ 업데이트 완료.');

    // 작업2. 일정 업데이트.
    console.log('\n2. 일정 업데이트 시작...');
    await insertSchedulePages(); // <-- 새로운 함수를 await로 호출


    console.log('\n모든 작업이 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('\n작업 중 오류가 발생했습니다:', error);
  }
})();
