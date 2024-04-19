import {toggleDarkSettings, toggleGeneralSettings} from "./shared/popuplib.js";
import {openEditors} from "./background/openEditors.js";

function handleCmds() {
    document.getElementById('cmdOpenEditors')
        .addEventListener('click', openEditors);
    document.getElementById('general-toggle-switch')
        .addEventListener('click',
            e => toggleGeneralSettings(e));
    document.getElementById('dark-toggle')
        .addEventListener('click', e => toggleDarkSettings(e));
}

handleCmds();
