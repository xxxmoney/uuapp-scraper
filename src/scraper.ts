import puppeteer, { Browser, Page } from 'puppeteer';
import {USER_AGENT} from "./constants.ts";

export class Scraper {
    private browser: Browser | null = null;

    constructor() {
    }

    public async initialize() {
        console.log(`Initializing browser...`);
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas', // Disable GPU acceleration
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        console.log(`Browser initialized`);
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        if (this.browser) {
            if (this.browser) {
                console.log(`Closing browser...`);
                await this.browser.close();
                console.log(`Browser closed`);

                this.browser = null;
            }
        }
    }

    /**
     * Scrapes the full HTML content of a given URL
     * Handles normal pages and SPAs
     *
     * @param url - The URL of the web page to scrape
     * @returns A Promise that resolves with the full HTML content of the page, or null if an error occurs
     */
    public async getHtml(url: string): Promise<string | null> {
        if (!this.browser) {
            console.error(`Browser is not initialized: call init() before scraping`);
            return null;
        }

        console.log(`Start scraping of: ${url}`);

        let page: Page | null = null;
        try {
            page = await this.browser.newPage();
            await page.setUserAgent(USER_AGENT);

            // Wait and handle SPAs: 'waitUntil: 'networkidle0'' waits until there are no more than 0 network connections for at least 500 ms
            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle0' });
            console.log(`Navigation complete for ${url}`);

            // Get the full HTML content
            console.log(`Extracting content from ${url}...`);
            const content = await page.content();
            console.log(`Successfully scraped content from: ${url}`);

            return content;
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            return null;
        }
        finally {
            if (page) {
                await page.close();
            }
        }
    }
}

