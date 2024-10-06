import dotenv from "dotenv";
dotenv.config();

import { Configuration, OpenAIApi } from "openai";
import { isChatGPTAllowedChannel } from "../../utils/slack/channel-toggle.js";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const module = {
  answer: async function answer(event, client, say) {
    try {
      const messages = [
        {
          role: "system",
          content: "You are a helpful assistant who responds succinctly",
        },
      ];

      if (event.thread_ts) {
        const replies = await client.conversations.replies({
          channel: event.channel,
          ts: event.thread_ts,
        });

        messages.push(
          ...replies.messages.map((message) => {
            return {
              role: message.bot_id ? "assistant" : "user",
              content: message.text.replace(/<@U0548CQEWPJ>/gi, ""),
            };
          })
        );
      } else {
        messages.push({
          role: "user",
          content: event.text.replace(/<@U0548CQEWPJ>/gi, ""),
        });
      }

      const response = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: messages,
      });
      const content = response.data.choices[0].message.content;

      const thread_ts = event.thread_ts ? event.thread_ts : event.ts;
      await say({ text: content, thread_ts: thread_ts });
    } catch (error) {
      console.error(error);
    }
  },
  isChatGPTAllowedChannel: function (event) {
    return isChatGPTAllowedChannel(event);
  },
};

export { module };
