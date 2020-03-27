// document.body.style.color = '#eeeeee';

// chrome.runtime.sendMessage({request: 'bodyStyle'}, response => {
//     // console.log('response', response);
//     // console.log('not iframe', window.self === window.top);
//     // console.log(window.self, window.top);
//     if (window.self !== window.top) {
//         const bodyStyle = response.bodyStyle;
//         if (bodyStyle) {
//             // console.log('bodyStyle', bodyStyle);
//             for (let prop in bodyStyle) {
//                 if (bodyStyle.hasOwnProperty(prop)) {
//                     document.body.style[prop] = bodyStyle[prop];
//                 }
//             }
//             // document.body.style = response.bodyStyle;
//         }
//     }
// });

