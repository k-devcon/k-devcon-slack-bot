import dotenv from "dotenv";
dotenv.config();

const TIMEZONE_OFFSET = process.env.TIMEZONE_OFFSET ? parseInt(process.env.TIMEZONE_OFFSET) : 0;

function getYYMMDD() {
  const date = new Date(new Date().getTime() + TIMEZONE_OFFSET * 60 * 1000); // timezone offset handling
  const year = date.getFullYear().toString().slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}${month}${day}`;
}

function getFormattedYYMMDD(dateString) {
  if (dateString === undefined) {
    dateString = getYYMMDD();
  }
  return `${dateString.slice(0,2)}/${dateString.slice(2,4)}/${dateString.slice(4,6)}`;
}

export { getYYMMDD, getFormattedYYMMDD };
