let sites = null;

function updateSite(input) {
    const li = input.parentElement;
    const name = li.querySelector('span').innerText.trim();
    for (const [key, value] of Object.entries(sites)) {
        if (key === name) {
            value.active = input.checked ? 'on' : 'off';
            break;
        }
    }
}

function makeCheckbox(value) {
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    if (value.active === 'on') {
        input.setAttribute('checked', 'checked');
    }
    input.addEventListener('change', e => {
        if (sites) {
            updateSite(e.target);
            chrome.storage.local.set(sites, () => console.log('options updated.'));
        }
    })
    return input;
}

function makeCaption(name) {
    const span = document.createElement('span');
    span.innerText = ' ' + name;
    return span;
}

function siteLi(name, value) {
    const li = document.createElement('li');
    li.appendChild(makeCheckbox(value));
    li.appendChild(makeCaption(name));
    return li;
}

function listSites(sites) {
    const sitesList = document.getElementById('sites-list');
    for (const [key, value] of Object.entries(sites)) {
        if (key.length > 0) {
            sitesList.appendChild(siteLi(key, value));
        }
    }
}

function init() {
    chrome.storage.local.get(null, sites1 => {
        listSites(sites1, 'storagelist');
        // console.log(sites1);
        sites = sites1;
    })
}

init();
