const { default: puppeteer } = require("puppeteer");

const fs = require("fs");

const webScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true, // no browser view
    defaultViewport: null, // ensure full w/h
  });

  const page = await browser.newPage();

  await page.goto(`http://quotes.toscrape.com/`, {
    waitUntil: "domcontentloaded",
  });

  let i = 0;

  const quotesObject = {
    table: [],
  };

  while (i < 5) {
    const quotes = await page.evaluate(() => {
      const quoteList = Array.from(document.querySelectorAll(".quote"));
      const textAndAuthor = quoteList.map((e) => {
        const text = e.querySelector(".text").innerText;
        const author = e.querySelector(".author").innerText;
        return { text, author };
      });
      return textAndAuthor;
    });
    allQuotes.push(...quotes);
    quotesObject.table.push(...quotes);

    i++;
    await page.click(".pager > .next > a");
  }
  console.log(quotesObject);

  const quotesJSON = JSON.stringify(quotesObject);

  fs.writeFile("quotesJSON.json", quotesJSON, "utf-8", (err) => {
    if (err) throw err;
    console.log(">>>> JSON file Complete");
  });

  // Needed even in headless mode to close the function
  await browser.close();
};

webScraper();
