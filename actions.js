function fetchHost(name) {
    const host = new Host(name);
    return host.get();
}

function deleteHost(name) {
    const host = new Host(name);
    host.delete();
}

function storeHost(name) {
    const host = new Host(name);
    host.store();
}

function applyCss(css) {
    injectCss(css, tabId);
}

function saveCss(css) {
    // console.log(css);
    injectCss(css, tabId);
    const host = new Host(activeHost);
    host.setCss(css);
    host.store();
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    // const bindings = [
    //     ['fetchHost', ],
    // ];
    // const {host, css} = req;
    if (req.request) {
        switch(req.request) {
            case 'fetchHost':
                fetchHost(req.host).then(response => {
                    // console.log('fetched activeHost', response);
                    chrome.runtime.sendMessage({
                        host: req.host,
                        result: response || {}
                    });
                }).catch(err => console.error(err));
                sendResponse({data: 'ok'});
                break;
            case 'storeHost':
                sendResponse({data: storeHost(req.host)});
                break;
            case 'getInitial':
                sendResponse({activeHost});
                break;
            case 'saveCss':
                sendResponse({data: saveCss(req.css)});
                break;
            case 'applyCss':
                sendResponse({data: applyCss(req.css)});
                break;
            case 'removeCss':
                sendResponse({data: removeCss()});
                break;
            case 'closePopup':
                chrome.windows.remove(winId);
                winId = null;
                break;
            case 'delete':
                sendResponse({data: deleteHost(req.host)});
                break;
            default:
                sendResponse('invalid request:' + req.request);
                break;
        }
    } else {
        sendResponse('no request handled');
    }
});

