const { default: puppeteer } = require("puppeteer");
const fs = require("fs");

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
    const pokemonTable = document.querySelector(".dextable");
    const pokemonList = Array.from(pokemonTable.querySelectorAll("tr"));

    const pokeInfo = pokemonList.map((row) => {
      const columns = Array.from(row.querySelectorAll(".fooinfo"));

      // Check if columns exist and have the expected structure
      if (columns.length >= 5) {
        const id = columns[0].textContent.trim();
        const image =
          columns[1].querySelector("img")?.getAttribute("src") || "";
        const name = columns[2].querySelector("a")?.textContent.trim() || "";
        const types = Array.from(columns[3].querySelectorAll("a img")).map(
          (type) => type.getAttribute("src").split("/").pop().split(".")[0]
        );

        const abilities = Array.from(columns[4].querySelectorAll("a")).map(
          (ability) => ability.textContent.trim()
        );

        const stats = Array.from(columns.slice(5)).map((stat) =>
          stat.textContent.trim()
        );

        return {
          id,
          image,
          name,
          types,
          abilities,
          stats,
        };
      } else {
        console.error("Unexpected structure in columns:", columns);
        return null;
      }
    });

    return pokeInfo.filter((pokemon) => pokemon !== null); // Remove null entries
  });

  const pokemonTableObject = { table: [] };
  pokemonTableObject.table.push(...pokemon);

  const formatedPokemonTableObject = JSON.stringify(
    pokemonTableObject,
    null,
    2
  ); // Indent with 2 spaces

  fs.writeFile(
    "pokemonList.json",
    formatedPokemonTableObject,
    "utf-8",
    (err) => {
      if (err) throw err;
      console.log("\n >>>> JSON file complete");
    }
  );

  await browser.close();
};

pokeWebScraper();
