// WordPress Auto Theme Embedded Script
(function () {
    'use strict';

    // Wait for the page to fully load
    function waitForPageLoad() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    // Wait for an element to be available in the DOM
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Wait for a specific class to be added to an element
    function waitForClass(selector, className, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);

            if (element && element.classList.contains(className)) {
                return resolve(element);
            }

            const observer = new MutationObserver(mutations => {
                const element = document.querySelector(selector);
                if (element && element.classList.contains(className)) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                attributes: true,
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Class ${className} not added to ${selector} within ${timeout}ms`));
            }, timeout);
        });
    }

    // Scroll to the end of the page
    function scrollToEndOfPage() {
        return new Promise(resolve => {
            console.log('Scrolling to the end of the page...');
            window.scrollTo(0, document.body.scrollHeight);
            
            // Đợi một chút để trang hiển thị đầy đủ sau khi cuộn
            setTimeout(() => {
                console.log('Scrolled to the end of the page');
                resolve();
            }, 1000);
        });
    }

    // Click a button and wait for popup
    async function clickButtonAndWaitForPopup(buttonSelector, popupSelector, popupClass = 'show') {
        try {
            // Find and click the initial button
            const button = await waitForElement(buttonSelector);
            button.click();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Wait for popup to appear with the 'show' class
            const popupBaseSelector = popupSelector.split('.show')[0];
            await waitForClass(popupBaseSelector, popupClass);

            // Find and click the popup button
            const popupButton = await waitForElement(popupSelector);
            popupButton.click();

            return true;
        } catch (error) {
            console.error(`Error with button ${buttonSelector}:`, error);
            return false;
        }
    }

    // Process all product buttons simultaneously
    async function processProducts() {
        console.log('Starting product button automation...');

        // Thực hiện tuần tự
        clickButtonAndWaitForPopup(
            "#product_ftt > div.product__footer > button",
            "#product_ftt > div.product__over.show.product__over--show > div > p > button"
        );
        
        await new Promise(resolve => setTimeout(resolve, 200));
        await scrollToEndOfPage();
        
        clickButtonAndWaitForPopup(
            "#product_amve > div.product__footer > button",
            "#product_amve > div.product__over.show.product__over--show > div > p > button"
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        clickButtonAndWaitForPopup(
            "#product_ctpl > div.product__footer > button",
            "#product_ctpl > div.product__over.show.product__over--show > div > p > button"
        );

        console.log('Product button automation completed!');
    }

    // Start the automation process
    waitForPageLoad()
        .then(processProducts)
        .catch(error => console.error('Automation failed:', error));
})();
