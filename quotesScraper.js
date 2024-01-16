const { default: puppeteer } = require("puppeteer");

const fs = require("fs");

const quotesScraper = async (url, numberOfPages = 1) => {
  const browser = await puppeteer.launch({
    headless: true, // no browser view
    defaultViewport: null, // ensure full w/h
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  let i = 0;

  const quotesObject = {
    table: [],
  };

  while (i < numberOfPages) {
    const quotes = await page.evaluate(() => {
      const quoteList = Array.from(document.querySelectorAll(".quote"));
      const textAndAuthor = quoteList.map((e) => {
        const text = e.querySelector(".text").innerText;
        const author = e.querySelector(".author").innerText;
        return { text, author };
      });
      return textAndAuthor;
    });
    quotesObject.table.push(...quotes);

    i++;
    await page.click(".pager > .next > a");
  }
  console.log(quotesObject);

  const quotesJSON = JSON.stringify(quotesObject);

  fs.writeFile("quotesJSON.json", quotesJSON, "utf-8", (err) => {
    if (err) throw err;
    console.log("\n >>>> JSON file Complete");
  });

  // Needed even in headless mode to close the function
  await browser.close();
};

quotesScraper(`http://quotes.toscrape.com/`);
