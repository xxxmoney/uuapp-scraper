import * as cheerio from 'cheerio';
import {CONTAINER_SELECTOR, LINK_SELECTOR} from "./constants.ts";

export const HtmlProcessor = {
    extractLinks(contentsHtml: string): string[] {
        const $ = cheerio.load(contentsHtml);
        const links: string[] = [];

        // Extract all anchor tags within the navigation container
        $(LINK_SELECTOR).each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                links.push(href);
            }
        });

        return links;
    },

    extractContent(pageHtml: string): string {
        const $ = cheerio.load(pageHtml);
        const container = $(CONTAINER_SELECTOR);

        // Extract all text from the container
        return container.text();
    }

};
