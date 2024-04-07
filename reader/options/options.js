const STORAGE = chrome.storage.local;
const KEY_BOOLEAN_READER = '__readermode';
const KEY_BOOLEAN_DARK = '__darkmode';


window.onload = () => {
    const inputReader = document.getElementById('stateReader');
    const inputDark = document.getElementById('stateDark');

    STORAGE.get([KEY_BOOLEAN_DARK, KEY_BOOLEAN_READER], results => {
        if (results) {
            inputReader.checked = results[KEY_BOOLEAN_READER];
            inputDark.checked = results[KEY_BOOLEAN_DARK];
        }
    })

    inputReader.oninput = () => STORAGE.set({[KEY_BOOLEAN_READER]: inputReader.checked});
    inputDark.oninput = () => STORAGE.set({[KEY_BOOLEAN_DARK]: inputDark.checked});
}
