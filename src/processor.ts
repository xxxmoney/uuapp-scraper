import * as cheerio from 'cheerio';
import {CONTAINER_SELECTOR, LINK_SELECTOR} from "./constants.ts";

export const Processor = {
    getNavigationLinks(html: string): string[] {
        const $ = cheerio.load(html);
        const links: string[] = [];

        // Extract all anchor tags within the navigation container
        $(LINK_SELECTOR).find('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                links.push(href);
            }
        });

        return links;
    },

    getContent(html: string): string {
        const $ = cheerio.load(html);
        const container = $(CONTAINER_SELECTOR);

        // Extract all text from the container
        return container.text();
    }

}
