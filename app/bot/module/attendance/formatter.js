import { db } from "../../../utils/firebase.js";
import { getFormattedYYMMDD } from "../../../utils/formatter.js";
import { getMyAttendanceRanking, getUserListOrderByRanking } from "./ranking.js";

async function getDailyAttendanceCheckBlock(today) {
  const todayAttendanceBlock = await getTodayAttendanceBlock(today);
  const top10RankingBlock = await getTop10RankingBlock();

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${today} 출석체크*\n\n:raised_hands: 오늘의 참여자\n${todayAttendanceBlock}\n\n:first_place_medal: 랭킹 (10위까지)\n${top10RankingBlock}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "출석하기",
          },
          value: today,
          action_id: "attendance",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "나의 출석기록 보기",
          },
          value: "my_attendance_history",
          action_id: "my-attendance-history",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "나의 랭킹 보기",
          },
          value: "my_attendance_ranking",
          action_id: "my-attendance-ranking",
        },
      ],
    },
  ];
}

async function getTodayAttendanceBlock(today) {
  const dailySnapshot = await db.ref(`attendance/daily/${today}`).get();
  const dailyList = dailySnapshot.val();
  if (dailyList == null) {
    return ">아직 참여자가 없습니다.";
  }

  return Object.values(dailyList).map((user, index) => `>${index + 1}. ${user.name}`).join("\n");
}

async function getTop10RankingBlock() {
  const ranking = await getUserListOrderByRanking();

  if (ranking.length === 0) {
    return ">아직 참여자가 없습니다.";
  }

  return Object.values(ranking).filter((user) => user.rank <= 10).map((user) => `>${user.rank}. ${user.name} (${user.count}회)`).join("\n");
}

async function getMyAttendanceHistoryText(userId) {
  const myHistoryRef = db.ref(`attendance/history/${userId}`);
  const myHistory = await myHistoryRef.get();
  const myHistoryList = myHistory.val()
  if (myHistoryList == null) {
    return "참여기록이 없습니다.";
  }

  const attendanceDates = Object.keys(myHistoryList);
  const myHistoryBlock = attendanceDates.map(dateString => `- ${getFormattedYYMMDD(dateString)}`).join('\n');

  return `*내 출석기록 (${attendanceDates.length}회)*\n\n${myHistoryBlock}`;
}

async function getMyAttendanceRankingText(userId) {
  const myAttendanceRanking = await getMyAttendanceRanking(userId);
  if(myAttendanceRanking === undefined) {
    return "참여기록이 없습니다.";
  }

  return `현재 ${myAttendanceRanking.rank} 등 입니다.`;
}

export { getDailyAttendanceCheckBlock, getMyAttendanceHistoryText, getMyAttendanceRankingText }