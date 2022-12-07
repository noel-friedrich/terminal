const loadIndex = localStorage.getItem("loadIndex") || 0

{
    const loadFile = (file) => {
        const script = document.createElement("script")
        script.src = `${file}?${loadIndex}`
        document.body.appendChild(script)
    }

    [
        "js/filesystem.js",
        "js/terminal.js",
    ].forEach(loadFile)
}