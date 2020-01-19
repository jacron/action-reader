function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

let activeUrl;
let tTabId;

let tabId;
let winId = null;
let activeHost;

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
function injectCss(css, tabId) {
    // console.log('css', css);
    const injectcode = `
    style = document.createElement('style');
    style.id = 'injectedstyle';
    style.appendChild(document.createTextNode(\`${css}\`));
    document.head.appendChild(style);    
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
    // chrome.tabs.insertCSS(tabId, {code}, () => {});
}

function removeCss() {
    const injectcode = `
    document.head.removeChild(document.getElementById('injectedstyle'));    
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

chrome.tabs.onUpdated.addListener((_tabId, info) => {
    // tabId = _tabId;
    // if (_tabId === tTabId) {
    //     return;
    // }
    /** do not use the globals tabId and activeHost here */
    if (info.status === 'loading') {
        console.log('loading url', info.url);
        const _activeHost = getJcReaderHost(info.url);
        if (_activeHost) {
            fetchHost(_activeHost).then(data => {
                if (data) {
                    console.log(data.css);
                    injectCss(data.css, _tabId);
                }
            })
        }
    }
});

chrome.browserAction.onClicked.addListener(function() {
    if (winId === null) {  /** prevent multiple popups */
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            // console.log('active tab', tabs[0]);
            // chrome.windows.get(tabs[0].windowId, win=> console.log(win));
            activeUrl = tabs[0].url;
            tabId = tabs[0].id;
            activeHost = getJcReaderHost(activeUrl);
            openView();
        });
    } else {
        chrome.windows.update(winId, {
            focused: true
        });
    }
});
