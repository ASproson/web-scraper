const { default: puppeteer } = require("puppeteer");

const webScraper = async () => {
  const browser = await puppeteer.launch({
    headless: false, // no browser view
    defaultViewport: null, // ensure full w/h
  });

  const page = await browser.newPage();

  await page.goto(`http://quotes.toscrape.com/`, {
    waitUntil: "domcontentloaded",
  });

  let i = 0;

  const allQuotes = [];

  while (i < 3) {
    const quotes = await page.evaluate(() => {
      const quoteList = Array.from(document.querySelectorAll(".quote"));
      const textAndAuthor = quoteList.map((e) => {
        const text = e.querySelector(".text").innerText;
        const author = e.querySelector(".author").innerText;
        return { text, author };
      });
      return textAndAuthor;
    });
    allQuotes.push(quotes);
    i++;
    await page.click(".pager > .next > a");
  }

  console.log(allQuotes);
};

webScraper();
