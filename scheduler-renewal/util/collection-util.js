import NotionUtil from "./notion-util.js";
import * as constraint from "../notion-const.js";

export default class CollectionUtil {

    static getNotionDistinct(list, target, orderBy = constraint.TABLE_COLUMNS.DATE) {
        if (!Array.isArray(list)) return [];
        const res = new Map();

        list.forEach(item => {
            const key = NotionUtil.getNotionPagePropertyName(item, target);
            const currentDate = new Date( NotionUtil.getNotionPagePropertyName(item, orderBy));

            if (!res.has(key)) { res.set(key, item); }
            else {
                const existingItem = res.get(key);
                const existingDate = new Date(NotionUtil.getNotionPagePropertyName(existingItem, orderBy));

                if (currentDate > existingDate) {
                    res.set(key, item);
                }
            }
        });

        return Array.from(res.values());
    }
}