function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e, input, cb) {
    e.stopPropagation();
    e.preventDefault();
    const dt = e.dataTransfer;
    input.files = dt.files;
    if (cb) {
        cb();
    }
}

/**
 * When a user dragges a file object into the boxElement,
 * it is inserted as 'files' into the inputElement.
 * @param boxElementId {string} DOM id
 * @param inputElementId {string} DOM id
 * @param cbDrop {function}
 */
function initDrop(boxElementId, inputElementId, cbDrop) {
    const dropbox = document.getElementById(boxElementId);
    const input = document.getElementById(inputElementId);
    dropbox.addEventListener('dragenter', dragenter, false);
    dropbox.addEventListener('dragover', dragover, false);
    dropbox.addEventListener('drop', e => drop(e, input, cbDrop), false);
}

export {initDrop}
