import {StorageArea} from "../background/backgroundState.js";
import {KEY_ATTRIBUTES, KEY_CLASSES, KEY_IDS} from "../content/constants.js";

// const KEY_CLASSES = "hostClasses";
// const KEY_IDS = 'hostIds';
// const KEY_ATTRIBUTES = 'hostAttributes';

function makeSuggestions(sel) {
    /* mix classes en ids in selectors */
    const selectors = [];
    sel[KEY_CLASSES].map(className => {
        const name = '.' + className;
        selectors.push({
            label: name,
            insertText: name
        })
    })
    sel[KEY_IDS].map(idName => {
        const name = '#' + idName;
        selectors.push({
            label: name,
            insertText: name
        })
    })
    sel[KEY_ATTRIBUTES].map(attribute => {
        const name = attribute;
        selectors.push({
            label: name,
            insertText: name
        })
    })
    console.log(selectors)
    return selectors;
}

function registerSuggestions() {
    /* require werkt hier dankzij monaco library */
    require(['vs/editor/editor.main'], () => {
        StorageArea.get([KEY_CLASSES, KEY_IDS, KEY_ATTRIBUTES], selectors => {
            const suggestions = makeSuggestions(selectors);
            monaco.languages.registerCompletionItemProvider('css', {
                provideCompletionItems: function() {
                    return {
                        incomplete: false,
                        suggestions
                    }
                },
            });
        });
    });
}

export {registerSuggestions}
