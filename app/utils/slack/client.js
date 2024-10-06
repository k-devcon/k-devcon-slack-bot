import axios from "axios";

// https://api.slack.com/methods/chat.postMessage
// https://api.slack.com/methods/chat.postEphemeral send message "only visible to you"

class SlackClient {
  #token;

  constructor(token) {
    this.#token = token;
  }

  async sendMessage(channel, text) {
    const response = await this.send(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channel,
        text: text,
      },
      {
        Authorization: `Bearer ${this.#token}`,
      }
    );
    return response;
  }

  async sendBlockMessage(channel, blocks) {
    const response = await this.send(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channel,
        blocks: blocks,
      },
      {
        Authorization: `Bearer ${this.#token}`,
      }
    );
    return response;
  }

  async sendEphmeral(channel, text) {
    const response = await this.send(
      "https://slack.com/api/chat.postEphemeral",
      {
        channel: channel,
        text: text,
      },
      {
        Authorization: `Bearer ${this.#token}`,
      }
    );
    return response;
  }

  async updateMessage(channel, text) {
    const response = await this.send(
      "https://slack.com/api/chat.update",
      {
        channel: channel,
        text: text,
      },
      {
        Authorization: `Bearer ${this.#token}`,
      }
    );
    return response;
  }

  async sendHook(hookURL, text) {
    const response = await this.send(hookURL, {
      text: text,
    });
    return response;
  }

  async send(url, body, headers) {
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...headers,
      },
    });
    return response;
  }
}

export { SlackClient };
