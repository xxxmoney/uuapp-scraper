import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Scrapes the full HTML content of a given URL using Puppeteer.
 * Handles SPAs by waiting for network activity to settle.
 *
 * @param url - The URL of the web page to scrape.
 * @returns A Promise that resolves with the full HTML content of the page, or null if an error occurs.
 */
async function scrapePageContent(url: string): Promise<string | null> {
    let browser: Browser | null = null; // Declare browser outside try block for finally access
    console.log(`Attempting to scrape: ${url}`);

    try {
        // Launch a headless browser instance.
        // 'headless: true' runs browser in background. Set to 'false' or 'new' for debugging to see the browser UI.
        // 'args' can be used to configure the browser, e.g., '--no-sandbox' for some Linux environments.
        browser = await puppeteer.launch({
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

        const page: Page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Wait and handle SPAs: 'waitUntil: 'networkidle0'' waits until there are no more than 0 network connections for at least 500 ms
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log(`Navigation complete for ${url}.`);

        // Get the full HTML content of the page after JavaScript execution.
        console.log(`Extracting content from ${url}...`);
        const content: string = await page.content();
        console.log(`Successfully scraped content from: ${url}`);

        return content;

    } catch (error) {
        // Log any errors that occur during the process.
        console.error(`Error scraping ${url}:`, error);
        return null;

    } finally {
        // Ensure the browser is closed, even if an error occurred.
        if (browser) {
            console.log(`Closing browser for ${url}...`);
            await browser.close();
            console.log(`Browser closed for ${url}.`);
        }
    }
}

/**
 * Main function to demonstrate scraping multiple URLs.
 */
async function main() {
    // List of URLs to scrape. Replace with your target URLs.
    const urlsToScrape: string[] = [
        'https://quotes.toscrape.com/', // Example static site
        'https://quotes.toscrape.com/js/', // Example site using JS
        'https://example.com'
        // Add more URLs here
    ];

    console.log('Starting scraping process...');

    // Process each URL sequentially. Use Promise.all for parallel scraping (use cautiously to avoid overloading).
    for (const url of urlsToScrape) {
        const htmlContent = await scrapePageContent(url);

        if (htmlContent) {
            // Process the scraped content (e.g., save to a file, parse data)
            console.log(`--- Content for ${url} ---`);
            // Log only the beginning of the content to avoid flooding the console
            console.log(htmlContent.substring(0, 500) + '...');
            console.log(`--- End Content for ${url} ---\n`);

            // Example: Save to file (uncomment to use)
            /*
            try {
                const fs = await import('fs/promises'); // Dynamically import fs/promises
                const fileName = `${new URL(url).hostname}.html`;
                await fs.writeFile(fileName, htmlContent);
                console.log(`Content saved to ${fileName}`);
            } catch (writeError) {
                console.error(`Error writing file for ${url}:`, writeError);
            }
            */
        } else {
            console.log(`Failed to scrape content from ${url}.\n`);
        }
    }

    console.log('Scraping process finished.');
}

// Execute the main function.
main().catch(console.error); // Catch any unhandled errors in main
