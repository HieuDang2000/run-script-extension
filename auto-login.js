// WordPress Auto Login Script
const username = "namivsb";
const password = "cvzEWxfCwRcZCyUNQlN";

(function() {
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
    
    // Perform the login
    async function performLogin() {
        try {
            console.log('Starting WordPress auto-login...');
            
            // Wait for login form elements
            const usernameField = await waitForElement('#user_login');
            const passwordField = await waitForElement('#user_pass');
            
            // Fill in credentials
            usernameField.value = username;
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('Username entered');
            
            passwordField.value = password;
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('Password entered');
            
            const loginButton = await waitForElement('#wp-submit');
            console.log('Login button found, clicking...');
            loginButton.click();
            

        } catch (error) {
            console.error('Auto-login failed:', error);
        }
    }
    
    // Start the login process
    waitForPageLoad().then(performLogin);
})();








