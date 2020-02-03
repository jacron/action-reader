// todo: move these constants to the struct documents
// const INJECTED_DEFAULT_STYLE_ID = 'splash-default-style';
// const INJECTED_CUSTOM_STYLE_ID = 'splash-custom-style';

function initInject(tabId, hostdata, dd_data) {
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
    document.getElementById('${documents.css.styleId}').innerHTML = '';
    document.getElementById('${documents.default.styleId}').innerHTML = '';
    document.getElementById('${documents.dark.styleId}').innerHTML = '';
    `;
    chrome.tabs.executeScript(tabId,{code: injectcode}, () => {});
}
