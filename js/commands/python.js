terminal.addCommand("python", async function(args) {
    if (args.file)
        terminal.getFile(args.file)

    if (!terminal.modules.pyscript) {
        terminal.printLine("Initializing Python...")
        await terminal.modules.load("pyscript", terminal)
        await terminal.modules.pyscript.load()
        terminal.modules.pyscript.history = []
    }

    const runInterpreter = async () => {
        const pyodide = terminal.modules.pyscript.pyodide
        let version = pyodide.runPython("import sys; sys.version").split("[")
        terminal.printLine(`Python ${version[0]}`)

        let shiftPressed = false
        terminal.window.addEventListener("keydown", (e) => {
            if (e.key === "Shift") {
                shiftPressed = true
            }
        })
        terminal.window.addEventListener("keyup", (e) => {
            if (e.key === "Shift") {
                shiftPressed = false
            }
        })

        while (true) {
            try {
                let pythonPrompt = ""
                let result = null

                while (pythonPrompt === "" || shiftPressed) {
                    let promptStart = (pythonPrompt === "") ? ">>> " : "... "
                    pythonPrompt += await terminal.prompt(promptStart, {
                        addToHistory: item => terminal.modules.pyscript.history.push(item),
                        getHistory: () => terminal.modules.pyscript.history,
                        inputCleaning: false,
                        inputSuggestions: false
                    })
                    pythonPrompt += "\n"
                }

                result = pyodide.runPython(pythonPrompt)
                if (pythonPrompt === "exit()" || pythonPrompt === "quit()" || pythonPrompt === "exit" || pythonPrompt === "quit")
                    break
                if (result) {
                    terminal.printLine(result)
                }
            } catch (pythonError) {
                terminal.printLine(pythonError)
            }
        }
    }

    if (args.file) {
        let file = terminal.getFile(args.file)
        if (file instanceof Directory) {
            throw new Error("Cannot run a directory")
        }
        let code = file.content
        terminal.modules.pyscript.pyodide.runPython(code)
    } else {
        await runInterpreter()
    }

}, {
    description: "run a script or open a python shell",
    args: {
        "?file": "the script to run"
    }
})