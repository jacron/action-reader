import {monacoDocuments} from "../shared/constants.js";
import {background} from './backgroundState.js';

function initInject(tabId, hostdata, dd_data) {
    const injectcode = `
function createStyle(id) {
    const styleElement = document.createElement('style');
    styleElement.id = id;
    return styleElement;
}

const cssStyle = createStyle('${monacoDocuments.css.styleId}');
document.head.appendChild(cssStyle);    

const defaultStyle = createStyle('${monacoDocuments.default.styleId}');
document.head.appendChild(defaultStyle);    

const darkStyle = createStyle('${monacoDocuments.dark.styleId}');
document.head.appendChild(darkStyle);    

cssStyle.innerHTML = \`${hostdata.css}\`;
defaultStyle.innerHTML = \`${dd_data['_default']}\`;
darkStyle.innerHTML = \`${dd_data['_dark']}\`;

`;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function articleAddDark(tabId) {
    const injectcode = `
    if (document.getElementById('readerarticle')) { 
        document.getElementById('readerarticle').classList.add('dark') 
    }
    document.body.classList.add('dark');
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function articleRemoveDark(tabId) {
    const injectcode = `
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.remove('dark');
    }
    document.body.classList.remove('dark');
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function injectCss(doc, tabId) {
    /** injected css may contain whitespace, so use (nested) backticks */
    const injectcode = `
    document.getElementById('${doc.styleId}').innerHTML = \`${doc.text}\`;
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function removeStyle(doc, tabId) {
    const injectcode = `
    document.getElementById('${doc.styleId}').innerHTML = '';
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}

function removeStyles() {
    const injectcode = `
    document.getElementById('${monacoDocuments.css.styleId}').innerHTML = '';
    document.getElementById('${monacoDocuments.default.styleId}').innerHTML = '';
    document.getElementById('${monacoDocuments.dark.styleId}').innerHTML = '';
    `;
    chrome.tabs.executeScript(background.tabId,{code: injectcode}, () => {});
}

export {articleAddDark, initInject, injectCss, removeStyles,
    removeStyle, articleRemoveDark}
