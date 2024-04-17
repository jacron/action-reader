// import {Host, storeDefault, storeDark} from "./host.js";
// import {background} from './backgroundState.js';
//
// function saveHost(req, sendResponse) {
//     const host = new Host(req.host);
//     applyHost(req, sendResponse);
//     switch (req.name) {
//         case 'default':
//             host.store({default: req.text});
//             break;
//         case 'dark':
//             host.store({dark: req.text});
//             break;
//         case 'selector':
//             host.store({selector: req.text});
//             break;
//         case '_default':
//             storeDefault(req.text);
//             break;
//         case '_dark':
//             storeDark(req.text);
//             break;
//     }
//     sendResponse({data: 'ok'});
// }
//
// function injectCss(doc, tabId) {
//     chrome.tabs.sendMessage(tabId, {
//         message: 'replaceStyle',
//         css: doc.text,
//         id: doc.styleId
//     });
// }
//
// function reInjectMakeReader(selector, tabId) {
//     chrome.tabs.sendMessage(tabId, {
//         message: 'reSelect',
//         selector
//     });
// }
//
// function _applyHost(req, tabId, sendResponse) {
//     console.log('*** in _applyHost')
//     if (~['default', 'dark', '_default', '_dark'].indexOf(req.name )) {
//         injectCss(req, tabId);
//     }
//     if (req.name === 'selector') {
//         reInjectMakeReader(req.text, tabId);
//     }
//     sendResponse({data: 'ok'});
// }
//
// function applyHost(req, sendResponse) {
//     const tabId = background.tabId;
//     if (!tabId) {
//         chrome.tabs.query({
//             active: true
//         }, tabs => {
//             _applyHost(req, tabs[0].id, sendResponse);
//         })
//
//     } else {
//         _applyHost(req, tabId, sendResponse);
//     }
// }
//
// const actionBindings = {
//     saveHost,
//     applyHost,
// };
//
// function initActions(req, sendResponse, sender) {
//     if (req.request) {  // req: client, request
//         const fun = actionBindings[req.request];
//         if (fun) {
//             fun(req, sendResponse, sender);
//         } else {
//             console.error('invalid request', req.request);
//             sendResponse('invalid request:' + req.request);
//         }
//     }
// }
//
// export {initActions}
