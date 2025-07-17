import {KEY_ATTRIBUTES, KEY_CLASSES, KEY_IDS, StorageArea} from "./constants.js";


function suggestion(s) {
    return {label: s, insertText: s};
}

function makeSuggestions(sel) {
    /* mix classes en ids in selectors */
    const selectors = [];
    for (const s of ['#readerarticle', '#readercontainer', '.dark']) {
        selectors.push(suggestion(s));
    }
    sel[KEY_CLASSES].forEach(className => {
        selectors.push(suggestion('.' + className));
    })
    sel[KEY_IDS].forEach(idName => {
        selectors.push(suggestion('#' + idName));
    })
    sel[KEY_ATTRIBUTES].forEach(attribute => {
        selectors.push(suggestion(attribute));
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

function getClassAndIdNames() {
    /* gebruik set om dubbelen te voorkomen */
    const classes = new Set();
    const ids = new Set();
    const attributes = new Set();

    document.querySelectorAll('*').forEach(element => {
        element.classList.forEach(className => {
            classes.add(className);
        });
        if (element.id) {
            ids.add(element.id);
        }
        for (const attribute of element.attributes) {
            attributes.add(attribute.name);
        }
    });
    StorageArea.set({[KEY_CLASSES]: Array.from(classes)}).then();
    StorageArea.set({[KEY_IDS]: Array.from(ids)}).then();
    StorageArea.set({[KEY_ATTRIBUTES]: Array.from(attributes)}).then();

}

export {registerSuggestions, getClassAndIdNames}
