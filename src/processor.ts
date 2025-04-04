import {Scraper} from "./scraper.ts";
import {HtmlProcessor} from "./htmlProcessor.js";

export const Processor = {
    async process(contentsPageUrl: string): Promise<string[]> {
        // Prepare scraper
        await using scraper = await Scraper.build();

        // Get html with links
        const contentsPageHtml = await scraper.getHtml(contentsPageUrl);
        if (!contentsPageHtml) {
            throw new Error(`Failed to get html from ${contentsPageUrl}`);
        }

        // Extract links
        const links = HtmlProcessor.extractLinks(contentsPageHtml);
        if (links.length === 0) {
            throw new Error(`Failed to extract links from ${contentsPageUrl}`);
        }

        // Log links
        console.log(`Extracted ${links.length} links:`);
        for (const link of links) {
            console.log(link);
        }

        // Get html for each link
        const pageContents = [];
        for (const link of links) {
            const html = await scraper.getHtml(link);
            if (!html) {
                throw new Error(`Failed to get html from ${link}`);
            }

            // Extract content
            const content = HtmlProcessor.extractContent(html);
            if (!content) {
                throw new Error(`Failed to extract content from ${link}`);
            }

            pageContents.push(content);
        }

        return pageContents;
    }
};
