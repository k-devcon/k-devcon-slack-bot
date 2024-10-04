import dotenv from "dotenv";
dotenv.config();

import { db } from "../utils/firebase.js";
import { getYYMMDD } from "../utils/formatter.js";

import pkg from "@slack/bolt";

const { App } = pkg;
const app = new App({
  token: process.env.ARCHIVE_BOT_TOKEN,
  appToken: process.env.ARCHIVE_APP_TOKEN,
  socketMode: true,
});

app.event("message", async ({ event }) => {
  db.ref(`events/${getYYMMDD()}`).push().set(event);
});

export { app };
