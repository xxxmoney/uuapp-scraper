import { promises as fs } from 'node:fs';
import {OUTPUT_FILE_PATH} from "./src/constants.js";
import {Processor} from "./src/processor.js";
import {parseConfig} from "./src/configParser";

const config = await parseConfig();
await using processor = await Processor.build(config);
const contents = await processor.process();

// Save the contents to a file
await fs.writeFile(OUTPUT_FILE_PATH, contents.join('\n\n'), 'utf-8');
