/** inject a style tag to hold the special styles of splash */
function f() {
    const style = document.createElement('style');
    style.id = 'splashstyle';
    document.head.appendChild(style);

}
f();
window.addEventListener('message', e => {
    if (e.source === window && e.data.type &&
        (e.data.type ==='FROM_BACKGROUND'))
    {
        console.log(e.data.css);
        const style = document.getElementById('splashstyle');
        style.innerText = e.data.css;
    }
});
// chrome.runtime.onMessage.addListener(
//     (req, sender, sendResponse) => {
//         console.log('req', req);
//         if (req.requestContent) {
//             if (req.requestContent === 'css') {
//                 const style = document.getElementById('splashstyle');
//                 style.innerText = req.css;
//             }
//         } else {
//             sendResponse('no request handled');
//         }
//     });
