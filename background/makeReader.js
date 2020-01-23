function injectMakeReader(tabId) {
    chrome.tabs.executeScript(tabId,{file: 'background/reader.js'},
        () => {});
}

function reInjectMakeReader(selector, tabId) {
    console.log('selector', selector);
    const code = `
themeSite(JSON.parse(\`${selector}\`));
    `;
    chrome.tabs.executeScript(tabId,{code}, () => {});
}

function removeReader() {
    const code = `deleteReader();`;
    chrome.tabs.executeScript(tabId,{code}, () => {});
}
