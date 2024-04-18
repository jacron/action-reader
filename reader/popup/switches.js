import {messageToContent} from "../shared/popuplib.js";

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

function initOneSwitch(_activeHost, custom, switchId, message) {
    const _switch = document.getElementById(switchId);
    _switch.onclick = (e) => {
        toggleOnOff(e.target.classList, () => {
            messageToContent({message})
        })
    }
}

function initSwitches(_activeHost, custom) {
    initOneSwitch(_activeHost, custom, 'dark-toggle-switch', 'toggleDark');
    initOneSwitch(_activeHost, custom, 'general-toggle-switch', 'toggleReader');
}

export {initSwitches}
