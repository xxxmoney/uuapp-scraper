import {EnvSchema} from "./schemas.ts";
import {config} from "dotenv";
import {Env} from "./types.ts";

export async function parseConfig(): Promise<Env> {
    // Load configuration from .env
    const envConfig = config();
    if (envConfig.error) {
        throw new Error(`Failed to load configuration: ${envConfig.error}`);
    }

    console.log(`Loaded configuration: ${JSON.stringify(envConfig.parsed)}`);

    // Parse with schema
    const parsedEnvConfig = EnvSchema.parse(envConfig.parsed);

    console.log(`Parsed configuration: ${JSON.stringify(parsedEnvConfig)}`);

    return parsedEnvConfig;
}

