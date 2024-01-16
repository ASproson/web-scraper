const { default: puppeteer } = require("puppeteer");
const axios = require("axios");
const fs = require("fs");

const pokeWebScraper = async (download = false) => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(`https://www.serebii.net/pokemon/gen1pokemon.shtml`, {
    waitUntil: "domcontentloaded",
  });

  const baseImageUrl = "https://www.serebii.net";

  const pokemon = await page.evaluate((baseImageUrl) => {
    const pokemonTable = document.querySelector(".dextable");
    const pokemonList = Array.from(pokemonTable.querySelectorAll("tr"));

    const pokeInfo = pokemonList.map((row) => {
      const columns = Array.from(row.querySelectorAll(".fooinfo"));

      if (columns.length >= 5) {
        const id = columns[0].textContent.trim();
        const image =
          columns[1].querySelector("img")?.getAttribute("src") || "";
        const imageUrl = image ? baseImageUrl + image : "";

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
          image: imageUrl,
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

    return pokeInfo.filter((pokemon) => pokemon !== null);
  }, baseImageUrl);

  // Save Pokemon information to a JSON file
  const pokemonTableObject = { table: [] };
  pokemonTableObject.table.push(...pokemon);

  const formatedPokemonTableObject = JSON.stringify(
    pokemonTableObject,
    null,
    2
  );

  fs.writeFile(
    "pokemonList.json",
    formatedPokemonTableObject,
    "utf-8",
    (err) => {
      if (err) throw err;
      console.log("\n >>>> JSON file complete");
    }
  );

  if (download) {
    // Download images
    for (const pokemonData of pokemon) {
      const { id, image } = pokemonData;

      try {
        const response = await axios.get(image, {
          responseType: "arraybuffer",
        });
        fs.writeFileSync(`images/${id}.png`, response.data, "binary");
        console.log(`Downloaded image for Pokemon ${id}`);
      } catch (error) {
        console.error(
          `Error downloading image for Pokemon ${id}: ${error.message}`
        );
      }
    }
  }

  await browser.close();
};

pokeWebScraper();
