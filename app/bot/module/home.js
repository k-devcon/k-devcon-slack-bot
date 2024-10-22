const module = {
  publish: async (event, client) => {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        callback_id: 'home_view',
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "<https://github.com/k-devcon/k-devcon-slack-bot|k-devcon-slack-bot github repository> 에서 코드 수정 및 기능 제안을 할 수 있습니다."
            }
          }
        ]
      }
    });
  }
};

export { module };


