import { promises as fs } from 'node:fs';
import { config }  from 'dotenv';
import {OUTPUT_FILE_PATH} from "./src/constants.js";
import {Processor} from "./src/processor.js";
import {EnvSchema} from "./src/schemas.js";

// Load configuration from .env
const envConfig = config();
if (envConfig.error) {
    throw new Error(`Failed to load configuration: ${envConfig.error}`);
}

console.log(`Loaded configuration: ${JSON.stringify(envConfig.parsed)}`);

// Parse with schema
const parsedEnvConfig = EnvSchema.parse(envConfig.parsed);

console.log(`Parsed configuration: ${JSON.stringify(parsedEnvConfig)}`);

const processor = new Processor(parsedEnvConfig);
const contents = await processor.process();

// Save the contents to a file
await fs.writeFile(OUTPUT_FILE_PATH, contents.join('\n\n'), 'utf-8');
