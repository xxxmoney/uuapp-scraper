import {Processor} from "./src/processor";
import {parseConfig} from "./src/configParser";

const url = '';

const config = await parseConfig();
await using processor = await Processor.build(config);

const result = await processor.processUrl(url);

console.log(`Result: \n ${result}`);

