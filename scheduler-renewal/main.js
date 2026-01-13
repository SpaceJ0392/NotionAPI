import * as notion from './notion-const.js';
import { RepeatService } from './repeat.js';

const repeat = new RepeatService(notion);
await repeat.startRepeat({ lookBack: 10 });