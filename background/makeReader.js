function injectMakeReader(selector, tabId) {
    chrome.tabs.executeScript(tabId,{file: 'background/reader.js'},
        () => {reInjectMakeReader(selector, tabId)});
}

function reInjectMakeReader(selector, tabId) {
    const code = `themeSite(JSON.parse(\`${selector}\`));
    `;
    console.log('code', code);
    chrome.tabs.executeScript(tabId,{code}, () => {});
}

function removeReader() {
    const code = `deleteReader();`;
    chrome.tabs.executeScript(tabId,{code}, () => {});
}
