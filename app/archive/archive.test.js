import { db } from "../utils/firebase.js";

import { getYYMMDD } from "../utils/formatter.js";

console.log(`${getYYMMDD()}`);

db.ref(`tests/${getYYMMDD()}`).push().set({
  type: "message",
  subtype: "channel_join",
  text: "<@U123ABC456|bobby> has joined the channel",
  ts: "1403051575.000407",
  user: "U123ABC456",
});
