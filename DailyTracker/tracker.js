const duplicateHabbitPages = require('./duplicate');
//const duplicateProcrastinatePages = require('./procrastinate');

// 매일 자정 (00:00)에 실행
(async () => {

  const logTime = require('dayjs')()
                  .tz('Asia/Seoul')
                  .format('YYYY-MM-DD HH:mm:ss');

  console.log(`[${logTime}] 🕛 자동 복제 시작`);

  try {
    //작업1. 습관 페이지 (매일 고정적인 데이터 업데이트)
    console.log('\n2. 습관 페이지 업데이트를 시작합니다...');
    await duplicateHabbitPages();
    console.log('✅ 성공적으로 완료되었습니다.');

    // 작업2. 미뤄진 일정 추가.
    //console.log('\n2. 미뤄진 일정 업데이트를 시작합니다...');
    //await duplicateProcrastinatePages(); // <-- 새로운 함수를 await로 호출


    console.log('\n모든 작업이 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('\n작업 중 오류가 발생했습니다:', error);
  }
})();
