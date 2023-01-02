const changePromptCode = `from js import terminalPrompt
input = terminalPrompt
__builtins__.input = terminalPrompt`

function load(addStyling=false) {
    return new Promise(resolve => {
        let script = document.createElement("script")
        script.src = "https://pyscript.net/latest/pyscript.js"
        script.onload = async function() {
            while (!terminal.window.loadPyodide) {
                await sleep(100)
            }
            terminal.modules.pyscript.pyodide = await terminal.window.loadPyodide({
                stdout: (msg) => {
                    terminal.printLine(msg)
                },
                stderr: (msg) => {
                    terminal.printError(msg)
                },
                fullStdLib: false
            })

            terminal.window.terminalPrompt = prompt
            terminal.modules.pyscript.pyodide.runPython(changePromptCode)

            terminal.modules.pyscript.hasLoaded = true
            resolve()
        }
        terminal.document.head.appendChild(script)
        terminal.modules.pyscript.script = script
    
        if (addStyling) {
            let link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = "https://pyscript.net/latest/pyscript.css"
            terminal.document.head.appendChild(link)
            terminal.modules.pyscript.link = link
        }
    })
}


terminal.modules.pyscript = {
    hasLoaded: false,
    load,
    pyodide: null,
    script: null,
    link: null
}