import { getKstDate } from "./date-util.js";

function getYYMM(date) {
  if (date === undefined) {
    date = getKstDate();
  }
  const year = date.getFullYear().toString().slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  return `${year}${month}`;
}

function getYYMMDD(date) {
  if (date === undefined) {
    date = getKstDate();
  }
  const year = date.getFullYear().toString().slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}${month}${day}`;
}

function getFormattedYYMMDD(dateString) {
  if (dateString === undefined) {
    dateString = getYYMMDD();
  }
  const yy = dateString.slice(0, 2);
  const mm = dateString.slice(2, 4);
  const dd = dateString.slice(4, 6);
  return `${yy}/${mm}/${dd}`;
}

export { getYYMM, getYYMMDD, getFormattedYYMMDD };
