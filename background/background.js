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

function injectDefaultDark(_tabId) {
    retrieveDefaultDark().then(data => {
        documents.default.text = data['_default'];
        documents.dark.text = data['_dark'];
        injectCss(documents.default, _tabId);
        injectCss(documents.dark, _tabId);
        // articleAddDark(_tabId);
    });
}

// todo: handle tabs event to rebuild after refresh?
// after refresh one has to navigate back and forth to regain
// reader styling - does Safari reader work that way also? no.


function initExistingHost(_activeHost, _tabId) {
    const host = new Host(_activeHost);
    host.get().then(_data => {
        const hostdata = _data[_activeHost];
        if (hostdata) { // we have data for this host
            retrieveDefaultDark().then(dd_data => {
                initInject(_tabId, hostdata, dd_data);
            });
            documents.selector.text = hostdata.selector;
            injectMakeReader(documents.selector.text, _tabId);
            articleAddDark(_tabId);
        }
    })
}

function initView() {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        if (tabs[0]) {
            activeUrl = tabs[0].url;
            tabId = tabs[0].id;
            activeHost = getJcReaderHost(activeUrl);
            openView();
        }
    });
}

chrome.windows.onRemoved.addListener(windowId => {
    if (windowId === winId) {
        winId = null;
    }
});

let lastActiveTabId;

chrome.tabs.onUpdated.addListener((_tabId, info) => {
    lastActiveTabId = _tabId;
    if (_tabId === tTabId) {
        return;
    }
    /** do not use the globals tabId and activeHost here */
    if (info.status === 'loading') {
        const _activeHost = getJcReaderHost(info.url);
        if (_activeHost) {
            initExistingHost(_activeHost, _tabId);
        }
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    // console.log(activeInfo, lastActiveTabId);
    if (activeInfo.tabId !== lastActiveTabId) {
        closeView();
    }
});

// chrome.tabs.onReplaced.addListener((added, removed) => {
//     console.log(added, removed)
// });
//
// chrome.tabs.onCreated.addListener(tab => {
//     console.log(tab)
// });

chrome.browserAction.onClicked.addListener(function() {
    if (winId === null) {  /** prevent multiple popups */
        initView();
    } else {
        closeView();
    }
});
