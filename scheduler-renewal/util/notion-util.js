export default class NotionUtil{
    
    static getNotionPageProperty(target, propertyName){
        const prop = target.properties[propertyName];
        if(!prop) return null;

        switch(prop.type){
            case 'title' : return prop.title[0]?.plain_text;
            case 'status' : return prop.status.name;
            case 'select': return prop.select?.name;
            case 'date': return prop.date?.start;
            case 'multi_select' : return prop.multi_select.map(option => option.name);
            case 'formula' : return prop.formula.string;
            default: return null;
        }
    }
}