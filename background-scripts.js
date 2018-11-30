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
chrome.menus.create({
    id: "ewmail",
    title: "Use temporary mail",
    contexts: ["editable"],
    "icons": {
        "16": "icons/icon-16.png",
        "32": "icons/icon-32.png"
    }
});

// Handle context menu click
browser.menus.onClicked.addListener(function(info, tab) {
    // Add tempoary loading text into element while loading real mail
    browser.tabs.executeScript(tab.id, {
        frameId: info.frameId,
        code: `browser.menus.getTargetElement(${info.targetElementId}).value = "Loading... Please wait a second";`,
    });

    // Create a new temp-mail.org tab
    browser.tabs.create({
        active: false,
        url: 'https://temp-mail.org/'
    }).then((new_tab) => {

        // Execute script in temp-mail.org tab to get mail address
        browser.tabs.executeScript(new_tab.id, {
            code: "document.getElementById('mail').value"
        }).then((mail) => {
            mail = mail[0];

            // Insert mail into current page
            browser.tabs.executeScript(tab.id, {
                frameId: info.frameId,
                code: `browser.menus.getTargetElement(${info.targetElementId}).value = "${mail}";`,
            });
        });
    });
});