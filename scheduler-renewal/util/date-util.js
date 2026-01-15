import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// 플러그인 설정 (클래스 밖에서 한 번만 실행하면 됩니다)
dayjs.extend(utc);
dayjs.extend(timezone);


export default class DateUtil {

    static #TIME_ZONE = "Asia/Seoul";  // 기본 타임존을 서울로 설정

    static beforeNDays(targetDays) {
        return dayjs().tz(this.#TIME_ZONE).subtract(targetDays, "day").format('YYYY-MM-DD');
    }

    static getTodayDate() {
        return dayjs().tz(this.#TIME_ZONE).format('YYYY-MM-DD');
    }

    static getTodayWeekday() {
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        const dayIndex = dayjs().tz(this.#TIME_ZONE).day();
        return weekdays[dayIndex]; // 오늘 요일 반환
    }
}