function injectMakeReader(selector, tabId) {
    chrome.tabs.executeScript(tabId,{file: 'background/reader.js'},
        () => {reInjectMakeReader(selector, tabId)});
}

function reInjectMakeReader(selector, tabId) {
    const code = `themeSite(\`${selector}\`);
`;
    chrome.tabs.executeScript(tabId,{code}, () => {});
}

function removeReader(tabId) {
    const code = `deleteReader();`;
    chrome.tabs.executeScript(tabId,{code}, () => {});
}
