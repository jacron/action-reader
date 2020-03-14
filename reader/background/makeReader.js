function injectMakeReader(selector, tabId, host) {
    chrome.tabs.executeScript(tabId,{
            file: 'background/inject/reader.js'
        },
        () => {reInjectMakeReader(selector, tabId, host)});
}

function reInjectMakeReader(selector, tabId, host) {
    /**
     * call themesite() in injected script reader.js
     * @type {string}
     */
    const code = `themeSite(\`${selector}\`,\`${host}\`);
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
