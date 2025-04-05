import { promises as fs } from 'node:fs';
import { config }  from 'dotenv';
import {OUTPUT_FILE} from "./constants.js";
import {Processor} from "./processor.js";
import {EnvSchema} from "./schemas.js";

// Load configuration from .env
const envConfig = config();
if (envConfig.error) {
    throw new Error(`Failed to load configuration: ${envConfig.error}`);
}

// Parse with schema
const parsedEnvConfig = EnvSchema.parse(process.env);

console.log(`Parsed configuration: ${JSON.stringify(parsedEnvConfig)}`);

const processor = new Processor(parsedEnvConfig);
const contents = await processor.process();

// Save the contents to a file
await fs.writeFile(OUTPUT_FILE, contents.join('\n\n'), 'utf-8');
