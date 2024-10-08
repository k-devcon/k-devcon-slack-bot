import dotenv from "dotenv";
dotenv.config();

import { hook as GeekNewsHook } from "./geeknews.js";
GeekNewsHook.sendHook(process.env.TEST_HOOK_URL);
// GeekNewsHook.sendHook(process.env.GEEK_NEWS_HOOK_URL);
