const cron = require('node-cron');
const duplicateAllPages = require('./duplicate');

// 매일 자정 (00:00)에 실행
cron.schedule('0 0 * * *', () => {
  console.log(`[${new Date().toLocaleString()}] 🕛 자동 복제 시작`);
  duplicateAllPages().catch(console.error);
});

// 프로세스를 계속 살려두기 위한 로그
console.log('🟢 스케줄러 실행 중... (Ctrl+C로 종료)');
