// function getHost(name) {
//     const host = new Host(name);
//     return host.get();
// }

function storeHost(req, sendResponse) {
    const host = new Host(req.host);
    host.store();
    sendResponse({data: 'ok'});
}

function save(req, sendResponse) {
    injectCss(req.css, tabId);
    const host = new Host(req.host);
    host.setCss(req.css);
    host.setSelector(req.selector);
    host.store();
    sendResponse({data: 'ok'});
}

function apply(req, sendResponse) {
    injectCss(req.css, tabId);
    // todo: implement use selectors
    sendResponse({data: 'ok'});
}

function getInitial(req, sendResponse) {
    sendResponse({activeHost});
}

function closePopup() {
    chrome.windows.remove(winId);
    winId = null;
}

function deleteHost(req, sendResponse) {
    const host = new Host(req.host);
    host.delete();
    sendResponse({data: 'ok'});
}

function removeCss(req, sendResponse) {
    removeStyle();
    sendResponse({data: 'ok'});
}

// function getHost(req, sendResponse) {
//     console.log(req, sendResponse);
//     const host = new Host(req.host);
//     host.get().then(response => {
//         chrome.runtime.sendMessage({
//             host: req.host,
//             result: response || {}
//         });
//     }).catch(err => console.error(err));
//     // sendResponse({data: 'ok'});
// }

function getHost(name) {
    const host = new Host(name);
    return host.get();
}

function fetchHost(req, sendResponse) {
    const host = new Host(req.host);
    host.get().then(response => {
        console.log('fetched activeHost', response);
        chrome.runtime.sendMessage({
            host: req.host,
            result: response || {}
        });
    }).catch(err => console.error(err));
    sendResponse({data: 'ok'});
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    /** these functions are named identical to the request */
    const bindings = {
        fetchHost,
        getInitial,
        save,
        apply,
        removeCss,
        closePopup,
        deleteHost
    };
    const fun = bindings[req.request];
    if (fun) {
        fun(req, sendResponse);
    } else {
        sendResponse('invalid request:' + req.request);
    }

    // if (req.request) {
    //     switch(req.request) {
    //         // case 'fetchHost':
    //         //     // getHost(req, sendResponse);
    //         //     // sendResponse({data: 'ok'});
    //         //     fetchHost(req, sendResponse);
    //         //     break;
    //         case 'storeHost':
    //             storeHost(req, sendResponse);
    //             // sendResponse({data: storeHost(req.host)});
    //             break;
    //         case 'getInitial':
    //             getInitial(req, sendResponse);
    //             break;
    //         case 'save':
    //             save(req, sendResponse);
    //             // sendResponse({data: saveCss(req.css)});
    //             break;
    //         case 'apply':
    //             apply(req, sendResponse);
    //             // sendResponse({data: applyCss(req.css)});
    //             break;
    //         case 'removeCss':
    //             removeCss(req, sendResponse);
    //             break;
    //         case 'closePopup':
    //             closePopup();
    //             break;
    //         case 'deleteHost':
    //             deleteHost(req, sendResponse);
    //             break;
    //         default:
    //             sendResponse('invalid request:' + req.request);
    //             break;
    //     }
    // } else {
    //     sendResponse('no request handled');
    // }
});

