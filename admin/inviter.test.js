import { inviteEveryone } from "./inviter.js";

// https://api.slack.com/methods/conversations.invite#errors
const excludedUsers = [];
const excludedUserIds = excludedUsers.map((user) => user.user);

inviteEveryone("CHANNEL_ID", excludedUserIds);
