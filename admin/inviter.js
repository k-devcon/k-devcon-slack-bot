import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

async function inviteEveryone(channelId, excludedUserIds) {
  // get user list
  // https://api.slack.com/methods/users.list
  const users = await getUsers();

  // If there are errors in the invite API below, you need to exclude the users who caused the errors (which the return value will provide).
  const filtered_users = users.filter(
    (user) => !excludedUserIds.includes(user)
  );

  // invite user to channel (* bot should be in target channel)
  // This API is limited to 1000 users per request
  // https://api.slack.com/methods/conversations.invite
  const response = await invite(channelId, filtered_users);
  console.log(response.status);
  console.log(response.data);
}

async function getUsers() {
  const userListResponse = await axios.get("https://slack.com/api/users.list", {
    headers: {
      Authorization: `Bearer ${process.env.HOLANG_BOT_TOKEN}`,
    },
  });
  return userListResponse.data.members.map((member) => member.id);
}

async function invite(channelId, users) {
  const joined_users = users.join(",");
  // console.log(joined_users);

  return await axios.post(
    "https://slack.com/api/conversations.invite",
    {
      channel: channelId,
      users: joined_users,
    },
    {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${process.env.HOLANG_BOT_TOKEN}`,
      },
    }
  );
}

export { inviteEveryone };
