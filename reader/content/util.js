function decomment(s) {
    return s.replace('/* ', '').replace(' */', '').trim();
}

function validateMinLength(w, len) {
    if (w.length < len) {
        console.error('*** not enough arguments in function declaration in style');
        return false;
    }
    return true;
}

function validateExactLength(w, len) {
    if (w.length !== len) {
        console.error('*** wrong number of arguments in function declaration in style');
        return false;
    }
    return true;
}

export {decomment, validateMinLength, validateExactLength}
