import * as notion from './notion-config.js';
import { RepeatService } from './repeat-service.js';

const repeat = new RepeatService(notion);
await repeat.startRepeat({ lookBack: 10 });
