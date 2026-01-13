import 'dotenv/config';
import { Client } from '@notionhq/client';

const NOTION = new Client({ auth: process.env.NOTION_API_KEY });
const DATASOURCE_ID = process.env.DATASOURCE_ID;

export { NOTION, DATASOURCE_ID }