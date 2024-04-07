const STORAGE = chrome.storage.local;
const KEY_BOOLEAN_READER = '__readermode';
const KEY_BOOLEAN_DARK = '__darkmode';


window.onload = () => {
    const inputReader = document.getElementById('stateReader');
    const inputDark = document.getElementById('stateDark');

    STORAGE.get([KEY_BOOLEAN_DARK, KEY_BOOLEAN_READER], results => {
        console.log(results[KEY_BOOLEAN_READER])
        if (results[KEY_BOOLEAN_READER] !== undefined) {
            inputReader.checked = results[KEY_BOOLEAN_READER];
            inputDark.checked = results[KEY_BOOLEAN_DARK];
        }
    })
    STORAGE.get(['onzinA', 'onzinB'], results => {
        console.log(results)
        if (results) console.log('results are defined!')
        if (results['onzinA']) console.log('onzinA is defined')
        if (results['onzinA'] === undefined) console.log('onzinA is undefined')
        if (results['onzinA'] === false) console.log('onzinA is false')
    });

    inputReader.oninput = () => STORAGE.set({[KEY_BOOLEAN_READER]: inputReader.checked});
    inputDark.oninput = () => STORAGE.set({[KEY_BOOLEAN_DARK]: inputDark.checked});
}
