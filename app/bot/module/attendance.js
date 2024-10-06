import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";

import { SlackClient } from "../../utils/slack/client.js";

const slackClient = new SlackClient(process.env.HOLANG_BOT_TOKEN);

// Build Kit - https://api.slack.com/block-kit/building
// Creating interactive messages - https://api.slack.com/messaging/interactivity
// bolt action listening - https://tools.slack.dev/bolt-js/concepts/action-listening

class AttendanceModule {
  #bolt;

  constructor(bolt) {
    this.#bolt = bolt;

    setCron();

    // 출석하기
    this.#bolt.action("attendance", async ({ body, client, ack }) => {
      await ack();

      // Temporary logging for development
      console.log(body, client);

      // DB insert

      // 본문에 스티커 남기기

      // 본문 업데이트

      // 출석체크 완료 메시지 전송 (Ephmeral)
    });

    // 나의 출석기록 보기
    this.#bolt.action("my-attendance-history", async ({ body, ack }) => {
      await ack();

      // 나의 출석기록 전송 (Ephmeral)
    });

    // 나의 랭킹 보기
    this.#bolt.action("attendance-ranking", async ({ body, ack }) => {
      await ack();

      // 나의 랭킹 전송 (Ephmeral)
    });
  }
}

function setCron() {
  // TODO
}

export { AttendanceModule };
