import NotionUtil from "./notion-util.js";

export default class CollectionUtil{

    static getNotionDistinct(list, target){
        if(!Array.isArray(list)) return [];
        const res = new Map();

        list.forEach(item =>{
            const key = NotionUtil.getNotionPagePropertyName(item, target);
            if (key && !res.has(key)) { res.set(key, item); }
        });

        return Array.from(res.values());
    }
}