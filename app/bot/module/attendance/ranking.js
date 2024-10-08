import { db } from "../../../utils/firebase.js";

async function getUserListOrderByRanking() {
  const userListOrderByCountRef = db.ref(`attendance/counts`).orderByChild('count');
  const userListOrderByCountSnapshot = await userListOrderByCountRef.get();
  const userListOrderByCount = [];

  userListOrderByCountSnapshot.forEach(childSnapshot => {
    userListOrderByCount.push({ id: childSnapshot.key, ...childSnapshot.val() });
  });

  if (userListOrderByCount.length === 0) {
    return userListOrderByCount
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
        rank: currentRank
    });

    prevCount = user.count;
  }

  return ranking;
}

export { getUserListOrderByRanking, getMyAttendanceRanking, calculateRanking }