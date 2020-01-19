function getJcReaderHost(url) {
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function fetchHost(name) {
    console.log(name);
    const host = new Host(name);
    return host.get();
}

function storeHost(name) {
    const host = new Host(name);
    host.store();
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.request) {
        switch(req.request) {
            case 'fetchHost':
                fetchHost(req.host).then(response => {
                    console.log(response);
                    chrome.runtime.sendMessage({
                        host: req.host,
                        result: response
                    });
                });
                sendResponse({data: 'ok'});
                break;
            case 'storeHost':
                sendResponse({data: storeHost(req.host)});
                break;
            case 'getInitial':
                sendResponse({host, tabId});
                break;
            default:
                sendResponse('invalid request:' + req.request);
                break;
        }
    } else {
        sendResponse('no request handled');
    }
});

let activeUrl;
let tTabId;

let tabId;
let winId = null;
let host;

function openView() {
    chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 400,
        height: 400,
        top: 20,
    }, win => {
        winId = win.id;
        tTabId = win.tabs[0].id;
        // chrome.tabs.executeScript(win.tabs[0].id, {
        //     file: 'reader.js'
        // }, () => {});

    })
}

chrome.windows.onRemoved.addListener(windowId => {
    if (windowId === winId) {
        winId = null;
        console.log('the popup closed');
    }
});

chrome.windows.onFocusChanged.addListener(windowId => {
    if (winId !== null && windowId !== winId) {
        console.log('the popup lost focus');
    }
});

chrome.browserAction.onClicked.addListener(function() {
    if (winId === null) {  /** prevent multiple popups */
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            activeUrl = tabs[0].url;
            tabId = tabs[0].id;
            host = getJcReaderHost(activeUrl);
            openView();
        });
    } else {
        chrome.windows.update(winId, {
            focused: true
        });
    }
});
