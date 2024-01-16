const { default: puppeteer } = require("puppeteer");

const webScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true, // no browser view
    defaultViewport: null, // ensure full w/h
  });

  const page = await browser.newPage();

  await page.goto(`http://quotes.toscrape.com/`, {
    waitUntil: "domcontentloaded",
  });

  const quotes = await page.evaluate(() => {
    const quote = document.querySelector(".quote");
    const text = quote.querySelector(".text").innerText;
    const author = quote.querySelector(".author").innerText;
    return { text, author };
  });

  console.log(quotes);
};

webScraper();
