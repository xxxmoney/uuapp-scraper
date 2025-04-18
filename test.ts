import {Processor} from "./src/processor";
import {parseConfig} from "./src/configParser";

const url = 'https://uuapp.plus4u.net/uu-bookkit-maing01/78462435-cd613bc038e8492d8b5dc469e62285bd/book/page?code=62595886';

const config = await parseConfig();
await using processor = await Processor.build(config);

const result = await processor.processUrl(url);

console.log(`Result: \n ${result}`);

