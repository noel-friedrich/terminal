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

document.querySelector("#loading-terminal-container").style.display = "block"

setTimeout(() => {
    if (window.terminal && window.terminal.hasInitted) {
        return
    }

    let loadingContainer = document.querySelector("#loading-terminal-container")

    if (loadingContainer) {
        loadingContainer.style.display = "none"
        document.querySelector("#loading-terminal-failed-container").style.display = "block"
    }

}, 5000)