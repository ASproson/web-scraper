const pokeWebScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(`https://www.serebii.net/pokemon/gen1pokemon.shtml`, {
    waitUntil: "domcontentloaded",
  });

  const pokemon = await page.evaluate(() => {
    const title = document.querySelector("table");
    const first = title.querySelector("tr").innerText;
    return first;
  });

  console.log(pokemon);

  await browser.close();
};

pokeWebScraper();
