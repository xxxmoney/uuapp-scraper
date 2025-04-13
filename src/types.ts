import { z } from "zod";
import {EnvSchema} from "./schemas.ts";

export type Env = z.infer<typeof EnvSchema>;
