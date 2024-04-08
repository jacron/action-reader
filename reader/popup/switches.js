const STORAGE = chrome.storage.local;
const KEY_BOOLEAN_CUSTOM_READER = 'readerOn';
const KEY_BOOLEAN_CUSTOM_DARK = 'darkOn';

function undefinedOrTrue(x) {
    return x === undefined || x === true;
}

function setSwitch(switchElement, state) {
    const classList = switchElement.classList;
    if (state) {
        classList.remove('off');
        classList.add('on');
    } else {
        classList.remove('on');
        classList.add('off');
    }
}

function toggleOnOff(classList, cb) {
    if (classList.contains('on')) {
        classList.remove('on');
        classList.add('off');
        cb(false);
    } else {
        classList.remove('off');
        classList.add('on');
        cb(true);
    }
}

function initOneSwitch(_activeHost, custom, switchId, storageKey) {
    const _switch = document.getElementById(switchId);
    setSwitch(_switch, undefinedOrTrue(custom[storageKey]));
    _switch.onclick = (e) => {
        toggleOnOff(e.target.classList, state => {
            custom[storageKey] = state;
            STORAGE.set({[_activeHost]: custom}).then();
        })
    }
}

function initSwitches(_activeHost, custom) {
    initOneSwitch(_activeHost, custom, 'dark-toggle-switch', KEY_BOOLEAN_CUSTOM_DARK);
    initOneSwitch(_activeHost, custom, 'general-toggle-switch', KEY_BOOLEAN_CUSTOM_READER);
}

export {initSwitches}
