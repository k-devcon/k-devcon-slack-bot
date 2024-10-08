import { db } from "../../../utils/firebase.js";
import { getYYMMDD } from "../../../utils/formatter.js";
import { getDailyAttendanceCheckBlock } from "./formatter.js";

async function attend(referenceDate, userId, slackClient, channelId, ts) {
  try {
    const today = getYYMMDD();

    // 기준일 확인
    if (referenceDate !== today) {
      console.log('referenceDate !== today', {referenceDate: referenceDate, today: today}, {userId: userId});
      slackClient.sendEphmeral(
        channelId,
        `이미 지난 일자입니다!`,
        userId
      );
      return;
    }

    // 출석 여부 확인
    const historyRef = db.ref(`attendance/history/${userId}/${today}`);
    const historySnapshot = await historyRef.get();
    if (historySnapshot.exists()) {
      console.log(`${userId} already attend at ${today}`);
      slackClient.sendEphmeral(
        channelId,
        `오늘은 이미 출석하였습니다!`,
        userId
      );
      return;
    }

    // 사용자 이름 조회
    // https://slack.com/api/users.profile.get
    const profileResponse = await slackClient.getProfile(userId);
    const profile = profileResponse.data.profile;
    if (profile === undefined) {
      throw new Error(`profile fetch failed : user-id : ${userId}`);
    }
    const name = profile.real_name_normalized || profile.display_name_normalized;

    // 카운터 업데이트
    const countRef = db.ref(`attendance/counts/${userId}`);
    const countSnapshot = await countRef.get();
    if (countSnapshot.exists()) {
      countRef.set({
        name: name,
        count: countSnapshot.val().count + 1
      });
    } else {
      countRef.set({
        name: name,
        count: 1,
      });
    }

    // 출석 처리
    db.ref(`attendance/history/${userId}/${today}`).set(true);
    db.ref(`attendance/daily/${today}`).push().set({
      id: userId,
      name: name
    });

    // 본문 업데이트
    slackClient.updateBlockMessage(
      channelId,
      await getDailyAttendanceCheckBlock(referenceDate),
      ts
    );

    // 출석체크 완료 메시지 전송 (Ephmeral)
    slackClient.sendEphmeral(
      channelId,
      `${today} 출석 완료!`,
      userId
    );
  } catch (e) {
    console.error(e);
  }
}

export { attend }