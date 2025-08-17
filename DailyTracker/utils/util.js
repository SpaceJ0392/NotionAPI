require('dotenv').config();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const todayKST = dayjs().tz('Asia/Seoul');
const yesterdayStartKST = dayjs().tz('Asia/Seoul').subtract(1, 'day').startOf('day').toISOString();
const yesterdayEndKST = dayjs().tz('Asia/Seoul').subtract(1, 'day').endOf('day').toISOString();

function updateDate(dateProp){

  if(dateProp !== null && String(dateProp).includes('T')){
    const originalDate = dayjs(dateProp);
    return todayKST.hour(originalDate.hour()).minute(originalDate.minute()).second(originalDate.second()).format();
  }

  return todayKST.format('YYYY-MM-DD');
}

function getTitle(titleProp) {
  return titleProp.title[0]?.text.content || 'No title';
}

module.exports = {
  todayKST,
  yesterdayStartKST,
  yesterdayEndKST,
  updateDate,
  getTitle
};