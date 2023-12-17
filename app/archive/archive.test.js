import dotenv from "dotenv";
dotenv.config();

import { app as ArchiveBot } from "./archive.js"

ArchiveBot.start();
