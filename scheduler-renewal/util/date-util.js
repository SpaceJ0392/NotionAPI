export default class DateUtil{

    static beforeNDays(targetDays){
        const date = new Date();
        date.setDate(date.getDate() - targetDays)
        return date.toISOString().split('T')[0];
    }

    static getTodayDate(){
        return new Date().toISOString().split('T')[0];
    }

    static getTodayWeekday() {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return weekdays[new Date().getDay()]; // 오늘 요일 반환
}
}