import {Scraper} from "./scraper.ts";

// TODO: get from param
const url = 'https://uuapp.plus4u.net/uu-bookkit-maing01/0238a88bac124b3ca828835b57144ffa/book/page?code=home';

await using scraper = await Scraper.build();

const result = await scraper.getHtml(url);

console.log(result);
