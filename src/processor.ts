import {Scraper} from "./scraper.ts";
import {HtmlProcessor} from "./htmlProcessor.js";
import {Env} from "./types.ts";
import _ from "lodash";
import {LINKS_CHUNK_SIZE} from "./constants.ts";

export class Processor {
    private readonly env: Env;

    constructor(env: Env) {
        this.env = env;
    }

    public async process(): Promise<string[]> {
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
        const linksChunked = _.chunk(links, LINKS_CHUNK_SIZE);

        // Process links in chunks
        for (const chunk of linksChunked) {
            const chunkContents = await Promise.all(chunk.map(async link => {
                try {
                    return await this.processLink(scraper, link);
                } catch (error) {
                    console.error(error);
                    return null;
                }
            }));
            pageContents.push(...chunkContents.filter(content => content !== null));
        }

        return pageContents;
    }

    private async processLink(scraper: Scraper, link: string): Promise<string> {
        const html = await scraper.getHtml(link);
        if (!html) {
            throw new Error(`Failed to get html from ${link}`);
        }

        // Extract content
        const content = HtmlProcessor.extractContent(html);
        if (!content) {
            throw new Error(`Failed to extract content from ${link}, html: \n ${html}`);
        }

        return content;
    }
}
