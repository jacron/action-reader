// todo: move these constants to the struct documents
// const INJECTED_DEFAULT_STYLE_ID = 'splash-default-style';
// const INJECTED_CUSTOM_STYLE_ID = 'splash-custom-style';

function initInject(tabId) {
    // todo: get and set the default style in the view
//     const css = `
// #readercontainer {
//   position: fixed;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   overflow: auto;
//   background-color: #888;
//   z-index: 9999999999999;
// }
// #readerarticle {
//     width: 600px;
//     margin: auto;
//     background-color: #ccc;
// }
//     `;
    const injectcode = `
function createStyle(id) {
    const styleElement = document.createElement('style');
    styleElement.id = id;
    return styleElement;
}

const cssStyle = createStyle('${documents.css.styleId}');
document.head.appendChild(cssStyle);    

const defaultStyle = createStyle('${documents.default.styleId}');
document.head.appendChild(defaultStyle);    

const darkStyle = createStyle('${documents.dark.styleId}');
document.head.appendChild(darkStyle);    

`;
    //defaultStyle.innerHTML = \`${css}\`;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function injectCss(doc, tabId) {
    /** injected css may contain whitespace, so use (nested) backticks */
    const injectcode = `
    document.getElementById('${doc.styleId}').innerHTML = \`${doc.text}\`;
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function removeStyle() {
    const injectcode = `
    document.getElementById('${documents.css.styleId}').innerHTML = '';
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}
