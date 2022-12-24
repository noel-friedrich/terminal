const loadIndex = localStorage.getItem("loadIndex") || 0

async function initalLoadScripts() {
    const loadFile = async (file) => {
        const script = document.createElement("script")
        script.src = `${file}?${loadIndex}`
        document.body.appendChild(script)
        await new Promise(resolve => script.onload = resolve)
    }

    for (let file of [
        "js/filesystem.js",
        "js/terminal.js",
    ]) {
        await loadFile(file)
    }
}

initalLoadScripts()