import { randomIntFromInterval } from "./random-util.js";

function sendHeartbeat(app) {
  setTimeout(async () => {
    const result = await app.client.conversations.list({
      token: process.env.BOT_TOKEN,
      limit: 1
    });
    console.log(result);

    sendHeartbeat();
  }, randomIntFromInterval(5, 25) * 60 * 1000);
}

export { sendHeartbeat }
