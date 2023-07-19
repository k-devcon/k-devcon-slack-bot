import axios from "axios";

async function sendMessage(token, channel, text) {
  return await axios.post("https://slack.com/api/chat.postMessage", {
    channel: channel,
    text: text
  }, {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Authorization": `Bearer ${token}`
    }
  })
}

export { sendMessage }