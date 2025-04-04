import { Browser, Page, launch } from 'puppeteer';
import {USER_AGENT} from "./constants.ts";

export class Scraper {
    private browser: Browser | null = null;

    private constructor() {
    }

    public static async build(): Promise<Scraper> {
        const scraper = new Scraper();
        await scraper.initialize();
        return scraper;
    }

    private async initialize() {
        console.log(`Initializing browser...`);
        this.browser = await launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                `--user-agent=${USER_AGENT}`
            ]
        });
        console.log(`Browser initialized`);

        await this.authenticate();
    }

    private async authenticate() {
        if (!this.browser) {
            throw new Error(`Browser is not initialized: call init() before scraping`);
        }

        let page: Page | null = null;
        try {
            // TODO: authenticate (take params from parameters or .env, etc)

            page = await this.browser.newPage();
        }
        finally {
            if (page) {
                await page.close();
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
            throw new Error(`Browser is not initialized: call init() before scraping`);
        }

        console.log(`Start scraping of: ${url}`);

        let page: Page | null = null;
        try {
            page = await this.browser.newPage();

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

    public async [Symbol.asyncDispose](): Promise<void> {
        if (this.browser) {
            console.log(`Closing browser...`);
            try {
                await this.browser.close();
                console.log(`Browser closed`);
            }
            catch (error) {
                console.error(`Error closing browser:`, error);
            }

            this.browser = null;
        }
    }

}

