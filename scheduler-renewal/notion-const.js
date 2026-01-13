import 'dotenv/config';
import { Client } from '@notionhq/client';

const NOTION = new Client({ auth: process.env.NOTION_API_KEY });
const DATASOURCE_ID = process.env.DATASOURCE_ID;

const TABLE_COLUMNS  =  {
    TITLE : "목표명",
    STATUS : "상태",
    DATE : "기간",
    TIME_LEFT : "남은일자",
    PRIORITY : "우선순위",
    REPEAT : "반복",
    DAYS : "요일"
}

export { NOTION, DATASOURCE_ID, TABLE_COLUMNS };