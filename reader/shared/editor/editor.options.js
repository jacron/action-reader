function editorOptions(doc) {
    return {
        value: doc.text,
        language: doc.language,
        lineNumbers: false,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
            enabled: false
        },
        parameterHints: {
            enabled: false
        },
        codeLens: false,
        hover: {
            enabled: false
        },
    };
}

export {editorOptions}
