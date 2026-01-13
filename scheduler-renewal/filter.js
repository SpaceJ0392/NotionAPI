import DateUtil from "./util/date-util.js";
import * as constraint from "./notion-const.js";
import NotionUtil from "./util/notion-util.js";

export class TaskFilter{

    static isRunToday(list) {
        const todayWeekDay = DateUtil.getTodayWeekday();
        const repeatDays = NotionUtil.getNotionPageProperty(list, constraint.TABLE_COLUMNS.DAYS) || [];

        return repeatDays.length === 0 || repeatDays.includes(todayWeekDay); //요일이 []면 매일 실행.
    }
}