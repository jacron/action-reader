const STORAGE = chrome.storage.local;
const KEY_BOOLEAN_GENERAL_READER = '_readerOn';
const KEY_BOOLEAN_GENERAL_DARK = '_darkOn';


window.onload = () => {
    const inputReader = document.getElementById('stateReader');
    const inputDark = document.getElementById('stateDark');

    STORAGE.get([KEY_BOOLEAN_GENERAL_DARK, KEY_BOOLEAN_GENERAL_READER], results => {
        if (results[KEY_BOOLEAN_GENERAL_READER] !== undefined) {
            inputReader.checked = results[KEY_BOOLEAN_GENERAL_READER];
            inputDark.checked = results[KEY_BOOLEAN_GENERAL_DARK];
        }
    })
    inputReader.oninput = () => STORAGE.set({[KEY_BOOLEAN_GENERAL_READER]: inputReader.checked});
    inputDark.oninput = () => STORAGE.set({[KEY_BOOLEAN_GENERAL_DARK]: inputDark.checked});
    STORAGE.remove('__readermode')
    STORAGE.remove('_darkmode')
}
