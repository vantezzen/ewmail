/**
 * Ew, Mail! Browser Extension.
 * Easily insert temporary mail address from temp-mail.org into pages.
 * This extension is not affiliated to temp-mail.org in any way!
 * 
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/ewmail
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */

// Create new context menu
chrome.contextMenus.create({
    id: "ewmail",
    title: "Use temporary mail",
    contexts: ["editable"],
    // "icons": {
    //     "16": "icons/icon-16.png",
    //     "32": "icons/icon-32.png"
    // }
});

// Script inserted to temp-mail to get the current email address
const tempMailGetMail = `
(() => {
    const ewMailChecker = setInterval(() => {
        // Check if the address is available
        const mail = document.getElementById('mail').value;
    
        if (mail.includes("@")) {
            clearInterval(ewMailChecker);
            chrome.runtime.sendMessage(mail);
        }
    }, 0);
})();
`;

// Tab the extension action has last been executed on
// This is needed to fill the mail input on that page
let currentTab;

// Set mail input in current tab to value
const setMail = (mail) => {
    chrome.tabs.sendMessage(currentTab.id, {
        action: 'insert_mail',
        data: mail,
    });
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    currentTab = tab;

    // Add temporary loading text into element while loading real mail
    setMail("Loading... Opening temp-mail");

    // Action to perform once we got the right tab
    const mailTabAction = (mail_tab) => {
        setMail("Waiting for temp-mail to load...");

        // Execute script in temp-mail.org tab to get mail address
        chrome.tabs.executeScript(mail_tab.id, {
            code: tempMailGetMail
        });
    }

    // Try to find a tab of temp-mail that is already open
    chrome.tabs.query({
        url: '*://temp-mail.org/*'
    }, (tabs) => {
        console.log("Got tabs", tabs);
        if (tabs.length) {
            console.log("Performing in tab");
            mailTabAction(tabs[0]);
        } else {
            // Create a new temp-mail.org tab
            chrome.tabs.create({
                active: false,
                url: 'https://temp-mail.org/'
            }, mailTabAction);
        }
    })
});

// Listen for the current email address from temp-mail
chrome.runtime.onMessage.addListener((mail, event) => {
    // Insert mail into current page
    setMail(mail);
});