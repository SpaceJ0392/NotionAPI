const duplicateAllPages = require('./duplicate');

// 매일 자정 (00:00)에 실행
(async () => {

  const logTime = require('dayjs')()
                  .tz('Asia/Seoul')
                  .format('YYYY-MM-DD HH:mm:ss');

  console.log(`[${logTime}] 🕛 자동 복제 시작`);

  try {
    await duplicateAllPages();
    console.log('\n모든 작업이 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('\n작업 중 오류가 발생했습니다:', error);
  }
})();
