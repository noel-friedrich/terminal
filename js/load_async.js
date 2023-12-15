const loadIndex = localStorage.getItem("loadIndex") || 0

let terminal = undefined

async function initalLoadScripts() {
    const loadFile = async (file) => {
        const script = document.createElement("script")
        script.src = `${file}?${loadIndex}`
        document.body.appendChild(script)
        await new Promise(resolve => script.onload = resolve)
    }

    await loadFile("js/terminal.js")

    terminal = new Terminal("main")
    terminal.clear()
    terminal.init()

    // add shortcuts
    terminal.addKeyboardShortcut(new KeyboardShortcut(
        "L", async () => {
            // wait for any pending commands to be interrupted
            // sleep to allow the interrupt to finish and print
            terminal.interrupt()
            await new Promise(resolve => setTimeout(resolve, 100))

            terminal.clear(true)
        },
        {ctrl: true, shift: undefined}
    ))

    terminal.addKeyboardShortcut(new KeyboardShortcut(
        "E", async () => {
            const eggName = "Shortcut Egg"
            terminal.printEasterEgg(eggName)
        },
        {ctrl: true, shift: true, alt: true}
    ))

    terminal.addKeyboardShortcut(new KeyboardShortcut(
        "+", async () => {
            terminal.enlargeText() 
        },
        {ctrl: true, shift: undefined}
    ))

    terminal.addKeyboardShortcut(new KeyboardShortcut(
        "-", async () => {
            terminal.shrinkText()
        },
        {ctrl: true, shift: undefined}
    ))

    // count page visits
    window.addEventListener("load", () => setTimeout(() => fetch("api/count_visit.php"), 0))
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