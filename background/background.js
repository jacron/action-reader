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

function closeView() {
    chrome.windows.remove(winId);
    winId = null;
}

chrome.windows.onRemoved.addListener(windowId => {
    if (windowId === winId) {
        winId = null;
    }
});

// todo: handle tabs event to rebuild after refresh

chrome.tabs.onUpdated.addListener((_tabId, info) => {
    if (_tabId === tTabId) {
        return;
    }
    /** do not use the globals tabId and activeHost here */
    if (info.status === 'loading') {
        // console.log('loading url', info.url);
        const _activeHost = getJcReaderHost(info.url);
        if (_activeHost) {
            getHost(_activeHost).then(data => {
                if (data) {
                    // console.log('data', data);
                    data = data[_activeHost];
                    if (data) {
                        console.log('data', data);
                        initInject(_tabId);
                        documents.css.text = data.css;
                        documents.selector.text = data.selector;
                        injectCss(documents.css, _tabId);
                        injectMakeReader(documents.selector, _tabId);
                    }
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
            activeUrl = tabs[0].url;
            tabId = tabs[0].id;
            activeHost = getJcReaderHost(activeUrl);
            openView();
        });
    } else {
        /** bring popup to front */
        chrome.windows.update(winId, {
            focused: true
        });
    }
});
