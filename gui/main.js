const mainElement = document.querySelector("main")
const inputsContainer = document.querySelector("#inputs-container")
const runButton = document.querySelector("#runButton")
const mainErrorOutput = document.querySelector("#mainErrorOutput")

let inputElements = []

function makeCommand() {
    let commandText = `${command_data['name']}`

    for (let input of inputElements) {
        const argOption = command_data.argOptions.find(o => o.name == input.dataset.name)
        if (!argOption) continue

        let inputValue = input.dataset.value
        if (!inputValue || (argOption.type == "boolean" && inputValue == "false")) continue

        if (argOption.optional && argOption.type == "enum" && inputValue == "< no selection >") {
            continue
        }


        let brackets = inputValue.includes(" ") ? (inputValue.includes('"') ? "'" : '"') : ""
        if (argOption.optional) {
            commandText += ` ${argOption.name.length > 1 ? "--" : "-"}${argOption.name}`
        }

        if (argOption.type != "boolean") {
            commandText += ` ${brackets}${inputValue}${brackets}`
        }
    }

    if (command_data.rawArgMode) {
        commandText += " " + inputElements[0].value
    }

    return commandText
}

function updateError() {
    if (command_data.rawArgMode) {
        return false
    }

    let command = makeCommand()

    let tempCommand = new Command(command_data.name, () => undefined, command_data)
    tempCommand.windowScope = this.window
    tempCommand.terminal = terminal

    let tokens = TerminalParser.tokenize(command)
    let {parsingError} = TerminalParser.parseArguments(tokens, tempCommand)

    if (parsingError.message) {
        mainErrorOutput.textContent = parsingError.message
        return true
    } else {
        mainErrorOutput.textContent = ""
        return false
    }
}

runButton.onclick = async () => {
    if (!terminal || !terminal.hasInitted) {
        return
    }

    if (updateError()) {
        return
    }

    let command = makeCommand()

    terminal.clear()

    let startTime = performance.now()

    terminal.print("$", Color.COLOR_1)
    terminal.printLine(` ${command}`)
    await terminal.input(command, true)

    let timeDelta = (performance.now() - startTime) / 1000
    timeDelta = Math.round(timeDelta * 1000) / 1000

    terminal.addLineBreak()
    terminal.print("$", Color.COLOR_1)
    terminal.printLine(` Finished in ${timeDelta}s`)
}

async function createHTML() {
    const urlParams = new URLSearchParams(window.location.search)

    command_data.args ??= []
    if (Array.isArray(command_data.args)) {
        command_data.args = Object.fromEntries(command_data.args.map(c => [c, ""]))
    }

    command_data.argOptions = Object.keys(command_data.args).map(TerminalParser.parseArgOptions)

    let args = Object.entries(command_data.args)
    args.sort((a, b) => {
        let o1 = TerminalParser.parseArgOptions(a[0])
        let o2 = TerminalParser.parseArgOptions(b[0])

        let x = o1.type == "boolean"
        let y = o2.type == "boolean"

        if (x && !y) return 1
        if (!x && y) return -1

        return 0
    })
    
    for (let [argumentName, description] of args) {
        let argOptions = TerminalParser.parseArgOptions(argumentName)

        description ||= ""
        if (!argOptions.optional) {
            description += " *"
        }

        const input = document.createElement("input")
        input.name = argOptions.name
        input.title = description
        input.dataset.value = ""
        input.dataset.name = argOptions.name

        let select = null

        if (argOptions.type == "enum") {
            select = document.createElement("select")

            if (argOptions.optional) {
                const option = document.createElement("option")
                option.textContent = "< no selection >"
                option.value = "< no selection >"
                select.appendChild(option)
            }

            for (let optionText of argOptions.enumOptions) {
                const option = document.createElement("option")
                option.textContent = optionText
                option.value = optionText
                select.appendChild(option)
            }
            inputsContainer.appendChild(select)

            select.onchange = () => {
                input.dataset.value = select.value
            }

            input.dataset.value = select.value

        } else if (argOptions.type == "boolean") {

            const checkboxContainer = document.createElement("div")
            checkboxContainer.classList.add("checkbox-container")

            input.type = "checkbox"
            checkboxContainer.appendChild(input)

            input.onclick = () => {
                input.dataset.value = input.checked
            }

            if (description) {
                const inputLabel = document.createElement("label")
                inputLabel.textContent = description
                inputLabel.style.fontSize = "1em"
                inputLabel.for = input.name
                checkboxContainer.appendChild(inputLabel)
            }

            inputsContainer.append(checkboxContainer)

        } else {

            input.type = "text"
            input.placeholder = argOptions.forms.slice(-1)[0]
            if (argOptions.optional) {
                input.placeholder += " (optional)"
            }
    
            input.dataset.hasError = !argOptions.optional
        
            input.oninput = () => {
                input.dataset.value = input.value

                updateError()
    
                if (input.value.length == 0) {
                    input.dataset.hasError = !argOptions.optional
                    return
                }
        
                let parserError = {message: undefined}
                TerminalParser._parseArgumentValue(argOptions, input.value, parserError)
                if (parserError.message) {
                    input.dataset.hasError = true
                } else {
                    input.dataset.hasError = false
                }
            }

            inputsContainer.appendChild(input)

            if (description) {
                const inputLabel = document.createElement("label")
                inputLabel.textContent = "↪ " + description
                inputLabel.style.marginLeft = "1em"
                inputsContainer.appendChild(inputLabel)
            }   
        }

        let urlParamValue = urlParams.get(argOptions.name)
        if (urlParamValue && urlParamValue != "undefined" && urlParamValue != "null") {
            input.value = urlParamValue

            if (argOptions.type == "boolean" && urlParamValue == "true") {
                input.checked = true
                setTimeout(() => input.onclick(), 0)
            } else if (argOptions.type == "enum") {
                select.value = urlParamValue
                setTimeout(() => select.onchange(), 0)
            } else {
                setTimeout(() => input.oninput(), 0)
            }
            
        }

        inputElements.push(input)
    
    }

    if (command_data.rawArgMode) {
        const input = document.createElement("input")
        input.name = "input"
        input.placeholder = "input"
        inputsContainer.appendChild(input)
        inputElements.push(input)
    }
}

terminal = null
let loadIndex = 0
async function main() {
    terminal = new Terminal("main", {
        parentNode: document.querySelector("#terminal"),
        baseUrl: "../../",
        guiMode: true
    })

    terminal.init({
        runInput: false,
        loadSidePanel: false,
        runStartupCommands: false,
        loadPath: false,
        ignoreMobile: true
    })

    terminal.makeInputFunc = (inputText) => {
        let tokens = TerminalParser.tokenize(inputText)
        let [commandText, argTokens] = TerminalParser.extractCommandAndArgs(tokens)
        if (terminal.commandExists(commandText)) {
            return async () => {
                let url = `../${commandText}/index.html?`
                let command = await terminal.getCommand(commandText)
                let {argOptions, parsingError} = TerminalParser.parseArguments(tokens, command)

                for (let argOption of argOptions) {
                    url += encodeURIComponent(argOption.name) + "="
                    url += encodeURIComponent(argOption.value) + "&"
                }

                window.location.href = url
            }
        } else {
            return () => {}
        }
    }

    terminal.printLine("Click on 'Run' to execute")
    terminal.printLine("the command.")

    terminal.finishCommand = () => {}
    terminal.standardInputPrompt = () => {}
    terminal.scroll = () => {
        window.scrollTo(0, document.body.scrollHeight)
    }

    await createHTML()
}

main()