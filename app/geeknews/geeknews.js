import Parser from "rss-parser"

async function GeekNewsRSS() {
  const parser = new Parser();

  let text = "";
  let now = new Date().getTime();

  let feed = await parser.parseURL('http://feeds.feedburner.com/geeknews-feed');
  feed.items.forEach(item => {
    if (now - new Date(item.pubDate).getTime() < 60 * 60 * 24 * 1000) {
      text += `<${item.link}|*${item.title}*>\n>${item.content ? replaceHTMLCode(item.content.replace(/(<([^>]+)>)/ig, "").trim().replace(/\n/g, "\n>")) : "no content"}\n\n`;
    }
  });

  return text.trim();
}

function replaceHTMLCode(text) {
  return text.replace(/&quot;/g, "\"");
}

export { GeekNewsRSS }