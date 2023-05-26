terminal.addCommand("flaci-to-turing", async function(args) {
    const file = terminal.getFile(args.file)
    const code = file.content
    let outputCode = ""

    const write = (str, endline=true) => {
        outputCode += str
        if (endline)
            outputCode += "\n"
    }

    try {
        const json = JSON.parse(code)
        const name = json.name
        if (json.type != "TM")
            throw new Error("Not a Turing Machine")

        write(`// ${name} converted from flaci.com`)
        write(`// Converter by noel-friedrich.de\n`)

        const automaton = json.automaton

        const states = automaton.States

        if (automaton.simulationInput) {
            const inputs = automaton.simulationInput
            if (inputs.length > 0) {
                let input = inputs.join("")
                write(`; Start Tape Content: "${input}"`)
            }
        }

        const getState = id => {
            return states.find(state => state.ID == id)
        }

        for (let state of states) {
            let stateName = state.Name
            if (state.Start)
                write(`; Start State: "${stateName}"\n`)

            for (let transition of state.Transitions) {
                let targetState = getState(transition.Target)
                for (let label of transition.Labels) {

                    let [
                        content,
                        newContent,
                        direction
                    ] = label

                    if (direction == "R")
                        direction = "r"
                    else if (direction == "L")
                        direction = "l"
                    else if (direction == "N")
                        direction = "*"
                    else
                        throw new Error("Invalid Direction")

                    write(`${stateName} ${content} ${newContent} ${direction} ${targetState.Name}`)
                }
            }

            write("")
        }
    } catch (e) {
        terminal.printError("Invalid Flaci.com File")
        console.error(e)
        return
    }

    if (args.s) { // save
        await terminal.createFile(args.s, TextFile, outputCode)
        terminal.printLine(`Saved as ${args.s}`)
    } else {
        terminal.printLine(outputCode)
    }
}, {
    description: "Converts a flaci.com JSON File of a turing machine to a turing machine file",
    args: {
        "file": "file to convert",
        "?s=save:b": "save the converted file"
    },
    isSecret: true,
    helpFunc() {
        terminal.addLineBreak()
        terminal.printLink("flaci.com", "https://flaci.com/", undefined, false)
        terminal.printItalic(" lets you create Turing Machines")
        terminal.printItalic("graphically. This command converts the")
        terminal.printItalic("JSON file of a Turing Machine to a Turing")
        terminal.printItalic("Machine file that can be used in this")
        terminal.printItalic("terminal using the 'turing' command.")
    }
})