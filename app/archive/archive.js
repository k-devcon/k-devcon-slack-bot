import cron from "node-cron"

import dotenv from "dotenv";
dotenv.config();

import { pool } from "../../database/pool.js";

import pkg from "@slack/bolt";

const { App } = pkg;
const app = new App({
  token: process.env.ARCHIVE_BOT_TOKEN,
  appToken: process.env.ARCHIVE_APP_TOKEN,
  socketMode: true,
});

app.event('message', async ({ event, context, client, say }) => {
  await pool.query('insert into slack_message_events(data) values($1)', [event])
});

cron.schedule("* 0 * * *", async () => {
  await pool.query('select 1')
})

export { app }
