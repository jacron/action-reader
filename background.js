function getJcReaderHost(url) {
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

let activeUrl;
let tTabId;

let tabId;
let winId = null;
let host;

function openView() {
    chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 500,
        height: 500,
        top: 20,
    }, win => {
        winId = win.id;
        tTabId = win.tabs[0].id;
    })
}

chrome.windows.onRemoved.addListener(windowId => {
    if (windowId === winId) {
        winId = null;
        // console.log('the popup closed');
    }
});

// function injectScript() {
//     chrome.tabs.executeScript(tabId, {
//         code: `console.log('reader says', document.title);
//                 document.body.style.color = 'red';
//                 `
//     }, () => {});
// }

// const democode =
//     `
// body {
//     color: red !important;
// }
// `;
function injectCss(code) {
    chrome.tabs.insertCSS(tabId, {code}, () => {});
}

chrome.browserAction.onClicked.addListener(function() {
    if (winId === null) {  /** prevent multiple popups */
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            activeUrl = tabs[0].url;
            tabId = tabs[0].id;
            host = getJcReaderHost(activeUrl);
            // injectScript();
            // injectCss();
            openView();
        });
    } else {
        chrome.windows.update(winId, {
            focused: true
        });
    }
});
