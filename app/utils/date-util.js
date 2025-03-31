import dotenv from "dotenv";
dotenv.config();

const TIMEZONE_OFFSET = process.env.TIMEZONE_OFFSET
  ? parseInt(process.env.TIMEZONE_OFFSET)
  : 0;

function getKstDate() {
  return new Date(new Date().getTime() + TIMEZONE_OFFSET * 60 * 1000); // timezone offset handling
}

export { getKstDate };
