import { Browser, Page, launch } from 'puppeteer';
import {
    AUTH_FORM_CONTAINER_SELECTOR,
    AUTH_FORM_PASSWORD_SELECTOR,
    AUTH_FORM_SUBMIT_BUTTON_SELECTOR,
    AUTH_FORM_USERNAME_SELECTOR, AUTHENTICATION_URL,
    LOGIN_BUTTON_SELECTOR,
    MAIN_URL,
    USER_AGENT,
    WAIT_UNTIL_NETWORK_IDLE
} from "./constants.ts";
import {Env} from "./types.ts";

export class Scraper {
    private readonly env: Env;
    private browser: Browser | null = null;

    private constructor(env: Env) {
        this.env = env;
    }

    public static async build(env: Env): Promise<Scraper> {
        const scraper = new Scraper(env);
        await scraper.initialize();
        return scraper;
    }

    private async initialize() {
        console.log(`Initializing browser...`);
        this.browser = await launch({
            headless: !this.env.IS_DEBUG,
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

        console.log(`Authenticating...`);

        let page: Page | null = null;
        let loginPage: Page | null = null;
        try {
            // No need to check authentication first - the browser does not remember authentication

            page = await this.browser.newPage();

            // Go to main page
            console.log(`Navigating to ${MAIN_URL}...`);
            await page.goto(MAIN_URL, { waitUntil: WAIT_UNTIL_NETWORK_IDLE });
            console.log(`Navigation complete for ${MAIN_URL}`);

            // Click on login button
            const loginButton = await page.$(LOGIN_BUTTON_SELECTOR);
            if (!loginButton) {
                throw new Error('Login button not found');
            }

            console.log(`Clicking on login button...`);
            await loginButton.click();
            console.log(`Login button clicked`);

            // Wait for new login page to open
            const loginPageTarget = await this.browser.waitForTarget(
                target =>  target.type() === 'page' && target.url().startsWith(AUTHENTICATION_URL)
            );
            if (!loginPageTarget) {
                throw new Error('Could not find the login page taget');
            }
            console.log(`Login page target found`);

            loginPage = await loginPageTarget.page();
            if (!loginPage) {
                throw new Error('Could not open login page');
            }
            console.log(`Login page found`);

            // Bring to front and wait for navigation
            console.log(`Loading login page...`);
            await Promise.all([
                loginPage.bringToFront(),
                loginPage.waitForNavigation({ waitUntil: WAIT_UNTIL_NETWORK_IDLE })
            ]);
            console.log(`Login page loaded`);

            // Get the container and inputs
            console.log(`Getting login form elements...`);
            const loginContainer = await loginPage.$(AUTH_FORM_CONTAINER_SELECTOR);
            if (!loginContainer) {
                throw new Error('Login container not found');
            }
            const usernameInput = await loginContainer.$(AUTH_FORM_USERNAME_SELECTOR);
            if (!usernameInput) {
                throw new Error('Username input not found');
            }
            const passwordInput = await loginContainer.$(AUTH_FORM_PASSWORD_SELECTOR);
            if (!passwordInput) {
                throw new Error('Password input not found');
            }
            const submitButton = await loginContainer.$(AUTH_FORM_SUBMIT_BUTTON_SELECTOR);
            if (!submitButton) {
                throw new Error('Submit button not found');
            }
            console.log(`Login form elements found`);

            // Fill in the login form
            console.log(`Filling in the login form...`);
            await usernameInput.type(this.env.AUTH_USERNAME);
            await passwordInput.type(this.env.AUTH_PASSWORD);
            console.log(`Login form filled`);

            // Submit the form and wait for navigation
            console.log(`Submitting the login form...`);
            await Promise.all([
                submitButton.click(),
                loginPage.waitForNavigation({ waitUntil: WAIT_UNTIL_NETWORK_IDLE })
            ]);
            console.log(`Login form submitted`);

            // Wait to apply the authentication to browser
            console.log(`Waiting for authentication to apply...`);
            await page.waitForNavigation({ waitUntil: WAIT_UNTIL_NETWORK_IDLE });

            // Success
            console.log(`Authenticated`);
        }
        finally {
            if (page) {
                try {
                    await page.close();
                }
                catch (error) {
                    console.warn(`Failed to clode page:`, error);
                }
            }
            if (loginPage) {
                try {
                    await loginPage.close();
                }
                catch (error) {
                    console.warn(`Failed to close login page:`, error);
                }
            }

            console.log(`Authentication process cleanup finished`);
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

            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: WAIT_UNTIL_NETWORK_IDLE });
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

