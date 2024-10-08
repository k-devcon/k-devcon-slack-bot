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

  async sendEphmeral(channel, text, userId) {
    const response = await this.send(
      "https://slack.com/api/chat.postEphemeral",
      {
        channel: channel,
        text: text,
        user: userId,
      },
      {
        Authorization: `Bearer ${this.#token}`,
      }
    );
    return response;
  }

  async updateMessage(channel, text, ts) {
    const response = await this.send(
      "https://slack.com/api/chat.update",
      {
        channel: channel,
        text: text,
        ts: ts,
      },
      {
        Authorization: `Bearer ${this.#token}`,
      }
    );
    return response;
  }

  async updateBlockMessage(channel, blocks, ts) {
    const response = await this.send(
      "https://slack.com/api/chat.update",
      {
        channel: channel,
        blocks: blocks,
        ts: ts,
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

  async getProfile(userId) {
    const response = await axios.get(
      `https://slack.com/api/users.profile.get?user=${userId}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Authorization: `Bearer ${this.#token}`,
        }
      });
    return response;
  }


}

export { SlackClient };
