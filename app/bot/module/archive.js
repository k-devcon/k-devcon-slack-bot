import dotenv from "dotenv";
dotenv.config();

import { db } from "../../utils/firebase.js";
import { getYYMMDD } from "../../utils/formatter.js";
import { isArchiveUseChannel } from "../../utils/slack/channel-toggle.js";

const module = {
  archive: (event) => {
    db.ref(`events/${getYYMMDD()}`).push().set(event);
  },
  isArchiveUseChannel: (event) => {
    return isArchiveUseChannel(event);
  },
};

export { module };
