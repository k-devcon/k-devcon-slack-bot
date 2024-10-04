import axios from "axios";

async function sendHook(hookURL, text) {
  return await axios.post(
    hookURL,
    {
      text: text,
    },
    {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    }
  );
}

export { sendHook };
