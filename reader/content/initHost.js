import {select} from "./select.js";
import {initedHost, keysGeneral, StorageArea, styleIds} from "../shared/constants.js";
import {parseFunctionInStyle} from "../shared/parse/parse.js";
import {injectStyle} from "./styles.js";
import {hideAnnoying, setAnnoying} from "./annoying.js";

function fromStorage(keys) {
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            resolve(results)
        });
    });
}

async function setDefaultStyles(websiteProps, immersive) {
    const defaultStyleObject = await fromStorage(keysGeneral.default);
    const defaultStyle = defaultStyleObject[keysGeneral.default];
    if (immersive) {
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
    }
    injectStyle(websiteProps.default, styleIds.custom.default);
    parseFunctionInStyle(websiteProps.default, results => setAnnoying(results));
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

async function setStyles(websiteProps, hostName) {
    /* als er geen selector aanwezig is of van toepassing is, is immersive false */
    const useHeaderTitle = false; // obsolete
    const immersive = select(websiteProps.selector, useHeaderTitle);
    await setDefaultStyles(websiteProps, immersive);
    await setDarkStyles(websiteProps, immersive);
    getHostDelay(hostName).then(delay => {
        if (delay) {
            setTimeout(() => reinjectStyles(), +delay);
        }
    })
}

export /**
 *
 * @param {null|string} hostName (referer)
 * @returns {Promise<void>}
 */
async function contentInitHost(hostName = null) {
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
