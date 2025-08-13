const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

function updateDate(dateProp){
  if(dateProp === null) return null;
  const todayKST = dayjs().tz('Asia/Seoul');
  if(String(dateProp).includes('T')){
    const originalDate = dayjs(dateProp);
    return todayKST.hour(originalDate.hour()).minute(originalDate.minute()).second(originalDate.second()).format();
  }
  return todayKST.format('YYYY-MM-DD');
}

function getTitleText(titleProp) {
  return titleProp?.title?.[0]?.plain_text || '(제목 없음)';
}

module.exports = {
  updateDate,
  getTitleText
};