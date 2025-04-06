import {Scraper} from "./scraper.ts";
import {HtmlProcessor} from "./htmlProcessor.js";
import {Env} from "./types.ts";

export class Processor {
    private readonly env: Env;

    constructor(env: Env) {
        this.env = env;
    }

    async process(): Promise<string[]> {
        // Prepare scraper
        await using scraper = await Scraper.build(this.env);

        // Get html with links
        const contentsPageHtml = await scraper.getHtml(this.env.URL);
        if (!contentsPageHtml) {
            throw new Error(`Failed to get html from ${this.env.URL}`);
        }

        // Extract links
        const links = HtmlProcessor.extractLinks(contentsPageHtml);
        if (links.length === 0) {
            throw new Error(`Failed to extract links from ${this.env.URL}`);
        }

        // Log links
        console.log(`Extracted ${links.length} links:`);
        for (const link of links) {
            console.log(link);
        }

        // Get html for each link
        const pageContents = [];
        for (const link of links.slice(0, 3)) {
            const html = await scraper.getHtml(link);
            if (!html) {
                throw new Error(`Failed to get html from ${link}`);
            }

            // TODO: probably get content using pupeteer, not cheerio
            // Also: https://github.com/puppeteer/puppeteer/issues/545#issuecomment-1536915114

            // Extract content
            const content = HtmlProcessor.extractContent(html);
            if (!content) {
                throw new Error(`Failed to extract content from ${link}, html: \n ${html}`);
            }

            pageContents.push(content);
        }

        return pageContents;
    }
}
