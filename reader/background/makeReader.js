function injectMakeReader(selector, tabId) {
    chrome.tabs.executeScript(tabId,{
            file: 'background/inject/reader.js'
        },
        () => {reInjectMakeReader(selector, tabId)});
}

function reInjectMakeReader(selector, tabId) {
    /**
     * call themesite() in injected script reader.js
     * @type {string}
     */
    const code = `themeSite(\`${selector}\`);
`;
    chrome.tabs.executeScript(tabId,{code}, () => {});
}

function removeReader(tabId) {
    /**
     * call deleteReader() in injected script reader.js
     * @type {string}
     */
    const code = `deleteReader();`;
    chrome.tabs.executeScript(tabId,{code}, () => {});
}

export {injectMakeReader, removeReader, reInjectMakeReader}
