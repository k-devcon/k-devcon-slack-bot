import dotenv from "dotenv";
dotenv.config();

import { hook as GeekNewsHook } from "./geeknews.js";
// GeekNewsBot.sendHook(process.env.TEST_HOOK_URL);
GeekNewsHook.start();
