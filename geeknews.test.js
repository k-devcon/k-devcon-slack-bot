import dotenv from "dotenv";
dotenv.config();

import { GeekNewsRSS } from "./geeknews.js"
import { sendMessage } from "./slack.js";

sendMessage(process.env.GEEK_NEWS_BOT_TOKEN, "C053JGL7M1Q", await GeekNewsRSS())