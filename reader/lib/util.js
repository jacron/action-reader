function bind(type, bindings) {
    for (const [id, listener] of bindings) {
        const element = document.getElementById(id);
        if (!element) {
            console.error('id does not exist', id);
        } else {
            element.addEventListener(type, listener);
        }
    }
}

export {bind}
