function withActiveTab(cb) {
    chrome.tabs.query({
        active: true,
    }, tabs => {
        if (tabs.length > 0) {
            cb(tabs[0]);
        }
    });
}
// function withActiveTab(cb) {
//     chrome.tabs.query({
//         active: true,
//     }, tabs => {
//         if (tabs.length > 0) {
//             let tab;
//             for (const t of tabs) {
//                 if (t.url.startsWith('http')) {
//                     tab = t;
//                     break;
//                 }
//             }
//             // console.log(tab)
//             cb(tab);
//         }
//     });
// }
//

export {withActiveTab}
