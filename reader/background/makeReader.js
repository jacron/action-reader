function reInjectMakeReader(selector, tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'reSelect',
        selector
    });
}

function removeReader(tabId) {
    chrome.tabs.sendMessage(tabId, {
        message: 'deleteReaderArticle'
    });
}

export {removeReader, reInjectMakeReader}
