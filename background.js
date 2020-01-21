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
    }
});

const INJECTED_STYLE_ID = 'splash-style';

function initInject(tabId) {
    const injectcode = `
    const splashStyle = document.createElement('style');
    splashStyle.id = '${INJECTED_STYLE_ID}';
    document.head.appendChild(splashStyle);    
`;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function injectCss(css, tabId) {
    css += `
#readercontainer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  background-color: #888;
}
#readerarticle {
    width: 600px;
    margin: auto;
    background-color: #ccc;
}
    `;
    /** injected css may contain whitespace, so use backticks */
    const injectcode = `
    document.getElementById('${INJECTED_STYLE_ID}').innerText = \`${css}\`;
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function removeStyle() {
    const injectcode = `
    document.getElementById('${INJECTED_STYLE_ID}').innerText = '';
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

chrome.tabs.onUpdated.addListener((_tabId, info) => {
    // if (_tabId === tTabId) {
    //     return;
    // }
    /** do not use the globals tabId and activeHost here */
    if (info.status === 'loading') {
        console.log('loading url', info.url);
        const _activeHost = getJcReaderHost(info.url);
        if (_activeHost) {
            getHost(_activeHost).then(data => {
                if (data) {
                    initInject(_tabId);
                    injectCss(data.css, _tabId);
                    injectMakeReader(data.selector, _tabId);
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
        /** bring popup to front */
        chrome.windows.update(winId, {
            focused: true
        });
    }
});
