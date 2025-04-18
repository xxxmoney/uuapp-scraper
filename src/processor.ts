import {Scraper} from "./scraper.ts";
import {HtmlProcessor} from "./htmlProcessor.js";
import {Env} from "./types.ts";
import _ from "lodash";
import {LINKS_CHUNK_SIZE} from "./constants.ts";

export class Processor {
    private readonly env: Env;
    private scraper: Scraper | null = null;

    private constructor(env: Env) {
        this.env = env;
    }

    public static async build(env: Env): Promise<Processor> {
        const processor = new Processor(env);
        await processor.initialize();
        return processor;
    }

    private async initialize() {
        this.scraper = await Scraper.build(this.env);
    }

    public async process(): Promise<string[]> {
        if (!this.scraper) {
            throw new Error(`Scraper is not initialized: firstly call initialize()`);
        }

        // Get html with links
        const contentsPageHtml = await this.scraper.getHtml(this.env.URL);
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

        // TODO: fix, seems to now work now
        // Process links in chunks
        // for (const chunk of linksChunked) {
        //     const chunkContents = await Promise.all(chunk.map(async link => {
        //         try {
        //             return await this.processUrl(link);
        //         } catch (error) {
        //             console.error(error);
        //             return null;
        //         }
        //     }));
        //     pageContents.push(...chunkContents.filter(content => content !== null));
        // }

        // Process links sequentially
        for (const link of links) {
            try {
                const content = await this.processUrl(link);
                pageContents.push(content);
            } catch (error) {
                console.error(error);
            }
        }

        return pageContents;
    }

    public async processUrl(link: string): Promise<string> {
        if (!this.scraper) {
            throw new Error(`Scraper is not initialized: firstly call initialize()`);
        }

        const html = await this.scraper.getHtml(link);
        if (!html) {
            throw new Error(`Failed to get html from ${link}`);
        }

        // Extract content
        const content = HtmlProcessor.extractContent(html);
        if (!content) {
            throw new Error(`Failed to extract content from ${link}`);
        }

        return content;
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        if (this.scraper) {
            console.log(`Disposing processor...`);
            try {
                await this.scraper[Symbol.asyncDispose]();
                console.log(`Processer disposed`);
            }
            catch (error) {
                console.error(`Error disposing processor:`, error);
            }

            this.scraper = null;
        }
    }
}
