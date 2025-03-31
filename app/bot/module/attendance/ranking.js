import { db } from "../../../utils/firebase.js";
import { getYYMM } from "../../../utils/formatter.js";

async function getUserListOrderByRanking() {
  const yymm = getYYMM();
  const userListOrderByCountRef = db
    .ref(`attendance/${yymm}/counts`)
    .orderByChild("count");
  const userListOrderByCountSnapshot = await userListOrderByCountRef.get();
  const userListOrderByCount = [];

  userListOrderByCountSnapshot.forEach((childSnapshot) => {
    userListOrderByCount.push({
      id: childSnapshot.key,
      ...childSnapshot.val(),
    });
  });

  if (userListOrderByCount.length === 0) {
    return userListOrderByCount;
  }

  const ranking = calculateRanking(userListOrderByCount.reverse());
  return ranking;
}

async function getMyAttendanceRanking(userId) {
  const ranking = await getUserListOrderByRanking();
  return ranking.find((user) => user.id === userId);
}

// users 는 desc 로 정렬된 것을 가정한다.
function calculateRanking(users) {
  let ranking = [];
  let currentRank = 1; // 현재 순위
  let prevCount = null; // 이전 사용자의 count 값
  let skipRank = 0; // 순위 건너뛰기

  for (let user of users) {
    if (user.count !== prevCount) {
      currentRank += skipRank;
      skipRank = 1;
    } else {
      skipRank++;
    }

    ranking.push({
      id: user.id,
      name: user.name,
      count: user.count,
      rank: currentRank,
    });

    prevCount = user.count;
  }

  return ranking;
}

async function calculateMonthlyRanking(yymm) {
  const dailyDataOfMonthRef = db.ref(`attendance/${yymm}/daily`);
  const dailyDataOfMonthSnapshot = await dailyDataOfMonthRef.get();
  const dailyDataOfMonth = dailyDataOfMonthSnapshot.val();

  const users = {};
  const counter = {};

  Object.keys(dailyDataOfMonth)
    .filter((key) => key.startsWith(yymm))
    .forEach((key) => {
      Object.values(dailyDataOfMonth[key]).forEach((user) => {
        if (!(user.id in users)) {
          users[user.id] = user.name;
        }

        if (!(user.id in counter)) {
          counter[user.id] = 0;
        }
        counter[user.id]++;
      });
    });

  const counts = Object.keys(counter).map((key) => {
    return {
      name: users[key],
      count: counter[key],
    };
  });

  const sorted = Object.values(counts).sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    }
    if (a.count < b.count) {
      return 1;
    }
    return 0;
  });

  return calculateRanking(sorted);
}

export {
  getUserListOrderByRanking,
  getMyAttendanceRanking,
  calculateRanking,
  calculateMonthlyRanking,
};
