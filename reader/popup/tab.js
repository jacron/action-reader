import {monacoDocuments} from '../shared/monacoSettings.js';
import {setEditor} from "./editor.js";

/**
 * 'selected' or '.selected'
 *
 * @type {{SELECTED: {className: string, selector: string}}}
 */
const dynClass = {
    SELECTED: {
        className: 'selected',
        selector: '.selected',
    },
};

function removeSelected(tabs) {
    const selectedTabs = tabs.querySelectorAll(dynClass.SELECTED.selector);
    for (let i = 0; i < selectedTabs.length; i++) {
        selectedTabs[i].classList.remove(dynClass.SELECTED.className);
    }
}

function selectTab(tab) {
    const tabs = document.getElementById('tabs');
    const doc = monacoDocuments[tab];
    removeSelected(tabs);
    tabs.querySelector(doc.selector).classList.add(dynClass.SELECTED.className);
    setEditor(doc);
}

function toggle(tabs, mode) {
    const displayValue = mode === 'on' ? 'inline-block' : 'none';
    for (const tab of tabs) {
        document.querySelector('#tabs .' + tab).style.display = displayValue;
    }
}

function toggleCustom(mode) {
    toggle(['default', 'dark', 'selector'], mode);
}

function toggleGeneral(mode) {
    toggle(['_default', '_dark'], mode);
}

function selectSuperTab(tab) {
    const supertabs = document.getElementById('super-tabs');
    removeSelected(supertabs);
    supertabs.querySelector('.' + tab).classList.add(dynClass.SELECTED.className);
    if (tab === 'custom') {
        toggleCustom('on');
        toggleGeneral('off');
        selectTab('default');
    } else {
        toggleCustom('off');
        toggleGeneral('on');
        selectTab('_default');
    }
}

function tabsClickHandler(e) {
    const target = e.target;
    const tabs = ['default', 'dark', 'selector', '_default', '_dark'];
    for (const tab of tabs) {
        if (~target.classList.value.indexOf(tab)) {
            selectTab(tab);
        }
    }
}

function superTabsClickHandler(e) {
    const target = e.target;
    const tabs = ['custom', 'general'];
    for (const tab of tabs) {
        if (~target.classList.value.indexOf(tab)) {
            selectSuperTab(tab);
        }
    }
}

function handleTabClickActions() {
    document.getElementById('tabs').addEventListener('click', tabsClickHandler);
    document.getElementById('super-tabs').addEventListener('click', superTabsClickHandler);
}

function initTabs(custom, defaultText, darkText) {
    monacoDocuments.default.text = custom.default;
    monacoDocuments.dark.text = custom.dark;
    monacoDocuments.selector.text = custom.selector;
    monacoDocuments._default.text = defaultText;
    monacoDocuments._dark.text = darkText;
}

function initSuperTabs() {
    selectSuperTab('custom');
}

export { handleTabClickActions, selectTab, initTabs, initSuperTabs}
