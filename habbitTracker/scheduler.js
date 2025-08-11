const duplicateAllPages = require('./duplicate');

// 매일 자정 (00:00)에 실행
(async () => {
  const logTime = require('dayjs')()
                  .tz('Asia/Seoul')
                  .format('YYYY-MM-DD HH:mm:ss');

  console.log(`[${logTime}] 🕛 자동 복제 시작`);
  duplicateAllPages().catch(console.error);
})();

