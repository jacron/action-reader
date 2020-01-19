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
    console.log(css);
    injectCss(css);
    // const style = document.createElement('style');
    // style.appendChild(document.createTextNode(css));
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.request) {
        switch(req.request) {
            case 'fetchHost':
                fetchHost(req.host).then(response => {
                    console.log('fetched activeHost', response);
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
                sendResponse({host, tabId});
                break;
            case 'applyCss':
                sendResponse({data: applyCss(req.css)});
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

