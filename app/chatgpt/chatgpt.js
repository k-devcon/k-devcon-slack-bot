import dotenv from "dotenv";
import pkg from "@slack/bolt";
import { Configuration, OpenAIApi } from "openai";

const { App } = pkg;
dotenv.config();

const app = new App({
  token: process.env.CHATGPT_BOT_TOKEN,
  appToken: process.env.CHATGPT_APP_TOKEN,
  socketMode: true
});

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

app.event('app_mention', async ({ event, context, client, say }) => {
  try {
    if (!["C053A6UL221", "C053JGL7M1Q"].includes(event.channel)) {
      await say({ text: "질문 채널에서만 사용 가능합니다.", thread_ts: thread_ts });
      return;
    }

    const messages = [{ role: "system", content: "You are a helpful assistant who responds succinctly" }];

    if (event.thread_ts) {
      const replies = await client.conversations.replies({
        channel: event.channel,
        ts: event.thread_ts
      })

      messages.push(...replies.messages.map(message => {
        return {
          role: message.bot_id ? 'assistant' : 'user',
          content: message.text.replace(/<@U0548CQEWPJ>/gi, '')
        }
      }));
    } else {
      messages.push({
        role: 'user',
        content: event.text.replace(/<@U0548CQEWPJ>/gi, '')
      });
    }

    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: messages,
    });
    const content = response.data.choices[0].message.content;

    const thread_ts = event.thread_ts ? event.thread_ts : event.ts
    await say({ text: content, thread_ts: thread_ts });
  }
  catch (error) {
    console.error(error);
  }
});

export { app }
