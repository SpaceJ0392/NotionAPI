export default class NotionUtil{
    
    static getNotionPagePropertyName(target, propertyName){
        const prop = target.properties[propertyName];
        if(!prop) return null;

        switch(prop.type){
            case 'title' : return prop.title[0]?.plain_text;
            case 'status' : return prop.status.name;
            case 'select': return prop.select?.name;
            case 'date': return prop.date?.start;
            case 'multi_select' : return prop.multi_select.map(option => option.name);
            default: return null;
        }
    }

    static mapWithOverride(target, columnList, overrides = {}){
        const mappedRes = {};

        Object.entries(columnList).forEach(([key, columnName]) =>{
            const prop = target.properties[columnName];
            if (!prop || ['formula', 'rollup'].includes(prop.type)) return;
            
            if (overrides.hasOwnProperty(columnName)) {
                mappedRes[columnName] = this.#convertToWriteFormat(prop.type, overrides[columnName]);
                return;
            }

            // 2. 그 외에는 원본 값을 그대로 변환하여 사용
            mappedRes[columnName] = this.#convertToWriteFormat(prop.type, prop);
        });

        return mappedRes;
    }

    static #convertToWriteFormat(type, value) {
        // 이미 노션 객체 형태인 경우(overrides에서 직접 만든 경우) 바로 반환
        if (typeof value === 'object' && value !== null && value.type) return value;

        switch (type) {
            case 'title': return { title: [{ text: { content: value || "제목없음" } }] };
            case 'select': return { select: value ? { name: value.name || value } : null };
            case 'status': return { status: value? { name: value.name || value } : null };
            case 'multi_select': 
                const tags = Array.isArray(value) ? value : [];
                return { multi_select: tags.map(t => ({ name: t.name || t })) };
            case 'date': return { date: { start: value.start || value } };
            case 'number': return { number: Number(value) || 0 };
            default: return null;
        }
    }

    static cleanBlocks(blocks) {
        return blocks.map(block => {
            const { type } = block;
            
            // 핵심: type과 그 type에 해당하는 데이터 객체만 남깁니다.
            return {
                object: "block",
                type: type,
                [type]: block[type] 
            };
        });
    }
}