function isArchiveUseChannel(event) {
  return isChannel(event, [
    "C022MFB9Z7D", // 자기소개
    "C053JGL7M1Q", // 테스트
  ]);
}

function isChatGPTAllowedChannel(event) {
  return isChannel(event, [
    "C053A6UL221", // 질문
    "C053JGL7M1Q", // 테스트
  ]);
}

function isChannel(event, channelIds) {
  if (event.channel) {
    return channelIds.includes(event.channel);
  }
  return false;
}

export { isArchiveUseChannel, isChatGPTAllowedChannel };
