const duplicateAllPages = require('./duplicate');

// 매일 자정 (00:00)에 실행
(async () => {
  console.log(`[${new Date().toLocaleString()}] 🕛 자동 복제 시작`);
  duplicateAllPages().catch(console.error);
})();

