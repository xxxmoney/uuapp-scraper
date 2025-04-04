import { promises as fs } from 'node:fs';
import {OUTPUT_FILE} from "./constants.js";
import {Processor} from "./processor.js";

const contentsPageUrl = 'https://uuapp.plus4u.net/uu-bookkit-maing01/e884539c8511447a977c7ff070e7f2cf/book/page?code=79013026';
const contents = await Processor.process(contentsPageUrl);

// Save the contents to a file
await fs.writeFile(OUTPUT_FILE, contents.join('\n\n'), 'utf-8');
