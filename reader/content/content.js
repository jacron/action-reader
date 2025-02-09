import {parseFunctionInStyle} from "../shared/parse/parse.js";
import {initedHost, keysGeneral, StorageArea, styleIds} from "../shared/constants.js";
import {deleteReaderArticle, reSelect, select} from "./select.js";
import {getClassAndIdNames} from "../shared/suggestions.js";
import {vaultToHead} from "./vault.js";


/* initieel is readerOn true, als een soort quasi global hier */
let readerOn = true;

/* ft.com has some hard to hide elements */
let annoying = [];

function getHostDelay(hostName) {
    const keys = [hostName];
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            const obj = results[hostName];
            if (obj) {
                resolve(obj.delay);
            }
        });
    })
}

function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/https?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function injectStyle(css, id) {
    removeStyle(id);
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
}

function removeStyle(id) {
    const style = document.getElementById(id);
    if (style) style.parentNode.removeChild(style);
    // else console.log(id + ' is een onbekend style element')
}

function addDark() {
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.add('dark')
    }
    document.body.classList.add('dark');
    const {custom, darkText} = initedHost;
    injectStyle(custom.dark, 'splash-custom-dark-style');
    injectStyle(darkText, 'splash-dark-style');
}

function removeDark() {
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.remove('dark');
    }
    document.body.classList.remove('dark');
    removeStyle('splash-custom-dark-style');
    removeStyle('splash-dark-style');
    setTimeout(() => {
    });
}

function replaceStyle(req) {
    injectStyle(req.css, req.id);
}

function removeMyStyles() {
    for (const theme in styleIds) {
        for (const styleId of Object.values(styleIds[theme])) {
            removeStyle(styleId);
        }
    }
}

function toggleGeneralContent(req) {
    const {mode} = req;
    if (mode) {
        contentInitHost().then();
    } else {
        removeMyStyles();
        deleteReaderArticle();
        vaultToHead();
    }
}

function toggleDarkContent(req) {
    const {mode} = req;
    if (mode) {
        addDark();
    } else {
        removeDark();
    }
}

function reinjectStyles() {
    const {custom, darkText, defaultText} = initedHost;
    /* dark styles */
    injectStyle(custom.dark, 'splash-custom-dark-style');
    injectStyle(darkText, 'splash-dark-style');
    /* default styles */
    injectStyle(custom.default, 'splash-custom-default-style');
    injectStyle(defaultText, 'splash-default-style');
    /* correct later injected styles */
    hideAnnoying();
}

function toggleDark() {
    if (document.body.classList.contains('dark')) {
        removeDark();
    } else {
        addDark();
    }
}

function toggleReader() {
    readerOn = !readerOn;
    if (readerOn) {
        contentInitHost().then();
    } else {
        removeMyStyles();
        deleteReaderArticle();
        vaultToHead();
    }
}

const actionBindings = {
    replaceStyle,
    reSelect,
    toggleGeneralContent,
    toggleDarkContent,
    toggleDark,
    toggleReader
};

function initActions(req, sendResponse) {
    if (req.message) {
        // console.log(req)
        const func = actionBindings[req.message];
        if (func) {
            func(req);
            sendResponse('okay');
        } else {
            console.error('invalid request', req.message);
            sendResponse('invalid request:' + req.message);
        }
    }
}

function fromStorage(keys) {
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            resolve(results)
        });
    });
}

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse);
}

/**
 * laat js elementen verbergen... maar let erop dat het element readerarticle een duplicaat is
 * dus verberg alle elementen die op een selector passen
 */
function hideAnnoying() {
    if (annoying.length) {
        for (const selector of annoying.split('\n')) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements) {
                    for (const element of elements) {
                        element.style.display = 'none';
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }

    }
}

async function setDefaultStyles(websiteProps, immersive) {
    const defaultStyleObject = await fromStorage(keysGeneral.default);
    const defaultStyle = defaultStyleObject[keysGeneral.default];
    if (immersive) {
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
    }
    injectStyle(websiteProps.default, styleIds.custom.default);
    parseFunctionInStyle(websiteProps.default, results => annoying = results);
}

async function setDarkStyles(websiteProps, immersive) {
    if (immersive) {
        const darkStyleObject = await fromStorage(keysGeneral.dark);
        const darkStyle = darkStyleObject[keysGeneral.dark];
        injectStyle(darkStyle, styleIds.general.dark);
        initedHost.darkText = darkStyle;
    }
    else {
        injectStyle(websiteProps.dark, styleIds.custom.dark);
        document.body.classList.add('dark');
    }
}

async function setStyles(websiteProps, hostName) {
    /* als er geen selector aanwezig is of van toepassing is, is immersive false */
    const immersive = select(websiteProps.selector, useHeaderTitle);
    await setDefaultStyles(websiteProps, immersive);
    await setDarkStyles(websiteProps, immersive);
    getHostDelay(hostName).then(delay => {
        if (delay) {
            setTimeout(() => reinjectStyles(), +delay);
        }
    })
}

/**
 *
 * @param hostName null|referer
 * @returns {Promise<void>}
 */
async function contentInitHost(hostName) {
    console.log('*** in contentInitHost');
    if (hostName === null) {
        hostName = getJcReaderHost(document.location.href);
    }
    console.log('*** hostname=' + hostName)
    const websitePropsObject = await fromStorage(hostName);
    if (websitePropsObject) {  // host exists
        StorageArea.set({['hostname']: hostName}, () => {});
        const websiteProps = websitePropsObject[hostName];
        initedHost.custom = websiteProps;
        if (websiteProps && websiteProps.active === 'on') {
            await setStyles(websiteProps, hostName);
        }
    }
}

function lastThumbBlockItem() {
    const divs = document.querySelectorAll('.THUMBS-BLOCK > div');
    if (divs.length) {
        const lastDiv = divs[divs.length - 1];
        if (lastDiv) {
            return lastDiv.querySelector('a');
        }
    }
    return false;
}

function isNotGlobalSite(url) {
    const w = url.split('/');
    // console.log(url); // https://fd.nl/
    // console.log(w); // (4) ['https:', '', 'fd.nl', '']
    return w.length > 4;
}

function redirectIs() {
    if (getJcReaderHost(document.location.href) === 'archive.is') {
        const lastHref = lastThumbBlockItem();
        const referer = document.forms[0].querySelector('input[name=q]').value;
        const refererHost = getJcReaderHost(referer);
        if (lastHref) {
            if (isNotGlobalSite(referer)) {
                lastHref.click();
                return -1;
            }
        } else {
            useHeaderTitle = true;
            return refererHost;
        }
    }
    return null;
}

let useHeaderTitle = false;

function imgClick(img) {
    img.addEventListener('click', () => {
        if (img.style.position === 'absolute') {
            img.style.position = 'relative';
        } else {
            img.style.width = '100%';
            img.style.position = 'absolute';
            img.style.left = '0';
        }
    })
}

function imgMagnify() {
    const imgs = document.getElementsByTagName('img');
    // console.log(imgs)
    setTimeout(() => {
        for (let img of imgs) {
            imgClick(img)
        }
    },1000)
}

/**
 * this export is making content.js a module
 */
export function main() {
    console.log("*** contentscript loaded for jreader!");
    const host = redirectIs();
    if (host === -1) return;
    /* host is null or referer */
    contentInitHost(host).then(() => {
        getClassAndIdNames();
        hideAnnoying();
        imgMagnify();
    });
    chrome.runtime.onMessage.addListener(messageListener);
}

export {injectStyle, removeStyle}
