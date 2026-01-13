import DateUtil from './util/date-util.js';
import CollectionUtil from './util/collection-util.js';
import { TaskFilter } from './filter.js';
import * as constraint from "./notion-const.js";
import NotionUtil from './util/notion-util.js';

export class RepeatService {

    #notion;
    constructor(notionClient) {
        this.#notion = notionClient;
    }

    async startRepeat({ lookBack = 1 } = {}) {
        try {
            console.log("반복일정 정보 가져오기...");
            const results = await this.#getBeforeNDaysOfRepeatPages(lookBack);
            console.log(results.length, " 개의 데이터 가져오기 완료!");

            console.log("페이지 복제...")
            await this.#duplicateRepeatPages(results);
        } catch (error) {
            console.error("❌ 에러 발생:", error);
        }

        console.log("페이지 복제 완료!");
    }


    async #getBeforeNDaysOfRepeatPages(beforeDays) {
        console.log("반복 데이터 추출...");
        let repeatRes = [];
        let cursor = undefined;

        do {
            const response = await this.#notion.NOTION.dataSources.query({
                data_source_id: this.#notion.DATASOURCE_ID,
                start_cursor: cursor,
                filter: {
                    and: [
                        { property: constraint.TABLE_COLUMNS.REPEAT, select: { equals: "반복" } },
                        { property: constraint.TABLE_COLUMNS.DATE, date: { on_or_after: DateUtil.beforeNDays(beforeDays) } }
                    ]
                }
            });
            repeatRes.push(...response.results);
            cursor = response.has_more ? response.next_cursor : null;
        } while (cursor);

        //중복되는 데이터 처리
        return CollectionUtil.getNotionDistinct(repeatRes, constraint.TABLE_COLUMNS.TITLE);
    }


    async #duplicateRepeatPages(repeatList) {
        const targets = repeatList.filter(TaskFilter.isRunToday);

        if (targets.length === 0) {
            console.log("😴 오늘은 생성할 반복 일정이 없습니다.");
            return;
        }

        const results = await Promise.all(
            targets.map(async (page) => {
                try {
                    return await this.#notion.NOTION.pages.create({
                        parent: {
                            type: "data_source_id",
                            data_source_id: this.#notion.DATASOURCE_ID
                        },
                        properties: NotionUtil.mapWithOverride(page, constraint.TABLE_COLUMNS,
                            {
                                [constraint.TABLE_COLUMNS.DATE]: DateUtil.getTodayDate(),
                                [constraint.TABLE_COLUMNS.STATUS]: constraint.INIT_STATUS
                            }), //기존 내용 가져오기(list) 및 기간과 상태값 변경.
                        children: await this.#getPageBlocks(page) //페이지 내부 데이터 가져오기.
                    });
                } catch (error) {
                    console.error(`❌ 복제 실패: ${error.message}`);
                }
            })
        );
    }


    async #getPageBlocks(page) {
        let results = [];
        let cursor = undefined;

        do {
            const response = await this.#notion.NOTION.blocks.children.list({ block_id: page.id, start_cursor: cursor });
            results.push(...response.results);
            cursor = response.has_more ? response.next_cursor : null;
        } while (cursor)

        return NotionUtil.cleanBlocks(results);
    }
}
