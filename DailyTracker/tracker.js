require('dotenv').config();
const habit = require('./habit');
const isHoliday = require('./utils/holidayChecker');
const insertSchedulePages = require('./schedule');

// 매일 자정 (00:00)에 실행
(async () => {

  const logTime = require('dayjs')().tz('Asia/Seoul')
  console.log(`[${logTime.format('YYYY-MM-DD HH:mm:ss')}] 🕛 자동 복제 시작`);

  // 당일이 공휴일인지 확인.
  let [flag, todayDay] = await isHoliday(logTime);
  flag ? console.log(`${logTime.format('YYYY-MM-DD')} 오늘은 휴일입니다.`) : console.log(`${logTime.format('YYYY-MM-DD')} 오늘은 평일입니다.`);

  
  try {

    console.log('\n1. 어제자 나쁜 습관 In progress => Done 업데이트');
    await habit.updateBadHabitPagesYesterday();
    console.log('어제자 나쁜 습관 업데이트 완료')

    console.log('\n2. 어제자 하지 못한 습관 Fail 업데이트');
    await habit.updateFailHabitPagesYesterday();
    console.log('업데이트 완료')

    //작업1. 습관 업데이트
    console.log('\n3. 습관 업데이트 시작...');
    await habit.insertHabitPages(flag, todayDay);
    
    // 작업2. 일정 업데이트.
    console.log('\n4. 일정 업데이트 시작...');
    await insertSchedulePages(); 
    
    console.log('✅ 업데이트 완료.');
  } catch (error) {
    console.error('\n작업 중 오류가 발생했습니다:', error);
  }
})();
