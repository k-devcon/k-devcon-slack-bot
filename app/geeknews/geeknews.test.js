import dotenv from "dotenv";
dotenv.config();

import { app as GeekNewsBot } from "./geeknews.js";
// GeekNewsBot.sendHook(process.env.TEST_HOOK_URL);
GeekNewsBot.start();
