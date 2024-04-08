import {apply, save} from "./form.js";

function handleKeyboardDown() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            close();
        }
        if (e.metaKey && e.shiftKey && e.key === 's') {
            // console.log('CmdShS gedrukt')
            save();
            e.preventDefault()
        }
        if (e.metaKey && e.shiftKey && e.key === 'a') {
            // console.log('CmdShA gedrukt')
            apply();
            e.preventDefault()
        }
    })
}

export {handleKeyboardDown}
