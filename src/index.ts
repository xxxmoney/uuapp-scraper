import {Scraper} from "./scraper.ts";

await using scraper = await Scraper.build();

const result = await scraper.getHtml('https://www.seznam.cz')

console.log(result);
