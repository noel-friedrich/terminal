class Color {

    constructor(r, g, b, a) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a ?? 1
    }

    static fromHex(hex) {
        if (!hex.startsWith("#"))
            hex = "#" + hex
        let r = parseInt(hex.substring(1, 3), 16)
        let g = parseInt(hex.substring(3, 5), 16)
        let b = parseInt(hex.substring(5, 7), 16)
        return new Color(r, g, b)
    }

    static fromHSL(h, s, l) {
        let r, g, b
        if (s == 0) {
            r = g = b = l
        } else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1
                if (t > 1) t -= 1
                if (t < 1/6) return p + (q - p) * 6 * t
                if (t < 1/2) return q
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
                return p
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s
            let p = 2 * l - q
            r = hue2rgb(p, q, h + 1/3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1/3)
        }
        return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
    }

    static hsl(h, s, l) {
        return Color.fromHSL(h, s, l)
    }

    static hsla(h, s, l, a) {
        let color = Color.fromHSL(h, s, l)
        color.a = a
        return color
    }

    static hex(hex) {
        return Color.fromHex(hex)
    }

    static rgb(r, g, b) {
        return new Color(r, g, b)
    }

    static niceRandom() {
        const f = () => Math.floor(Math.random() * 100) + 150
        return new Color(f(), f(), f())
    }

    static random() {
        const f = () => Math.floor(Math.random() * 255)
        return new Color(f(), f(), f())
    }

    eq(color) {
        return this.r == color.r && this.g == color.g && this.b == color.b && this.a == color.a
    }

    equals(color) {
        return this.eq(color)
    }

    distanceTo(color) {
        let r = this.r - color.r
        let g = this.g - color.g
        let b = this.b - color.b
        let a = this.a - color.a
        return Math.sqrt(r * r + g * g + b * b + a * a)
    }

    get hsl() {

        let h = 0
        let s = 0
        let l = 0

        let r = this.r / 255
        let g = this.g / 255
        let b = this.b / 255

        let max = Math.max(r, g, b)
        let min = Math.min(r, g, b)

        if (max == min) h = 0
        else if (max == r) h = 60 * ((g - b) / (max - min))
        else if (max == g) h = 60 * (2 + (b - r) / (max - min))
        else if (max == b) h = 60 * (4 + (r - g) / (max - min))

        if (h < 0) h += 360

        l = (max + min) / 2
        
        if (max == min) s = 0
        else if (l <= 0.5) s = (max - min) / (max + min)
        else if (l > 0.5) s = (max - min) / (2 - max - min)

        return {
            h: h,
            s: s,
            l: l
        }

    }

    get string() {
        let self = this
        return {

            get rgb() {
                return `rgb(${self.r}, ${self.g}, ${self.b})`
            },

            get rgba() {
                return `rgba(${self.r}, ${self.g}, ${self.b}, ${self.a})`
            },

            get hex() {
                let r = self.r.toString(16).padStart(2, "0")
                let g = self.g.toString(16).padStart(2, "0")
                let b = self.b.toString(16).padStart(2, "0")
                return `#${r}${g}${b}`
            },

            get hsl() {
                let h = self.hsl.h
                let s = self.hsl.s * 100
                let l = self.hsl.l * 100
                return `hsl(${h}, ${s}%, ${l}%)`
            }

        }
    }

    toString() {
        return this.string.rgba
    }

    static get COLOR_1() {
        return terminal.data.accentColor1
    }

    static get COLOR_2() {
        return terminal.data.accentColor2
    }

    static get WHITE() {return new Color(255, 255, 255)}
    static get BLACK() {return new Color(0, 0, 0)}
    static get LIGHT_GREEN() {return new Color(0, 255, 0)}
    static get PURPLE() {return new Color(79, 79, 192)}

}

class IntendedError extends Error {
    constructor(message) {
        super(message)
        this.name = "IntendedError"
    }
}

class DeveloperError extends Error {
    constructor(message) {
        super(message)
        this.name = "DeveloperError"
    }
}

class ParserError extends Error {
    constructor(message) {
        super(message)
        this.name = "ParserError"
    }
}

class TerminalParser {

    static tokenize(input) {
        let tokens = []
        let tempToken = ""

        let apostropheCharacters = ["'", '"']
        let spaceCharacters = [" ", "\t", "\n"]

        let activeApostrophe = null

        for (let char of input) {
            if (activeApostrophe) {
                if (char == activeApostrophe) {
                    tokens.push(tempToken)
                    tempToken = ""
                    activeApostrophe = null
                } else {
                    tempToken += char
                }
            } else if (apostropheCharacters.includes(char)) {
                activeApostrophe = char
            } else if (spaceCharacters.includes(char)) {
                if (tempToken != "") {
                    tokens.push(tempToken)
                    tempToken = ""
                }
            } else {
                tempToken += char
            }
        }

        if (tempToken != "")
            tokens.push(tempToken)

        return tokens
    }

    static extractCommandAndArgs(tokens) {
        let args = [...tokens]
        let command = args[0]
        args.shift()
        return [command, args]
    }

    static parseArgOptions(argString) {
        // ?a is an optional argument
        // a is a required argument
        // abc is a required argument
        // ?abc is an optional argument
        // a:n is a required argument that is a number
        // ?a:n is an optional argument that is a number
        // a:n:1~100 is a required argument that is a number between 1 and 100
        // ?a:n:1~100 is an optional argument that is a number between 1 and 100
        // *a is a required argument that is a string and expands to the rest of the arguments
        // ?*a is an optional argument that is a string and expands to the rest of the arguments
        // a:b is a required argument that is a boolean

        let argOptions = {
            name: null,
            type: "string",
            optional: false,
            min: null,
            max: null,
            expanding: false,
            numtype: undefined,
            default: undefined,
            forms: [],
            get fullName() {
                if (this.forms.length > 0)
                    return this.forms.join("|")
                return this.name
            },
            isHelp: false,
            description: ""
        }

        let name = argString

        if (name.startsWith("?")) {
            argOptions.optional = true
            name = name.substring(1)
        }

        if (name.startsWith("*")) {
            argOptions.expanding = true
            name = name.substring(1)
        }

        if (name.includes(":")) {
            let parts = name.split(":")
            name = parts[0]
            let type = parts[1]
            if (type == "n") {
                argOptions.type = "number"
            } else if (type == "i") {
                argOptions.type = "number"
                argOptions.numtype = "integer"
            } else if (type == "b") {
                argOptions.type = "boolean"
            } else if (type == "s") {
                argOptions.type = "string"
            } else {
                throw new DeveloperError(`Invalid argument type: ${type}`)
            }

            if (parts.length > 2) {
                let range = parts[2]
                if (range.includes("~")) {
                    let rangeParts = range.split("~")
                    argOptions.min = parseFloat(rangeParts[0])
                    argOptions.max = parseFloat(rangeParts[1])
                } else {
                    argOptions.min = parseFloat(range)
                    argOptions.max = parseFloat(range)
                }
            }
        }

        argOptions.name = name
        argOptions.description = ""

        if (argOptions.name.includes("=")) {
            argOptions.forms = argOptions.name.split("=")
            argOptions.name = argOptions.forms[0]
        }

        if (argOptions.name == "help" || argOptions.name == "h") {
            argOptions.isHelp = true
        }

        return argOptions
    }

    static getArgOption(argOptions, argName) {
        return argOptions.find(arg => arg.name == argName || arg.forms.includes(argName))
    }

    static parseNamedArgs(tokens, argOptions, error, disableEquals) {
        let namedArgs = {}
        let deleteIndeces = []

        if (!disableEquals) {
            let i = 0
            for (let token of tokens) {
                if (token.match(/^[^=]+=[^=]+$/)) {
                    let parts = token.split("=").filter(p => p != "")
                    if (parts.length != 2) {
                        throw new Error(`Unexpected token "${token}"`)
                    }
                    let name = parts[0]
                    let value = parts[1]
                    namedArgs[name] = value
                    deleteIndeces.push(i)
                    let argOption = this.getArgOption(argOptions, name)
                    if (!argOption) {
                        error(`Unexpected property "${name}" (E142)`)
                    } else if (argOption.type == "boolean") {
                        error(`Property "${name}" is a boolean and cannot be assigned a value`)
                    }
                }
                i++
            }
        }

        for (let i = 0; i < tokens.length; i++) {
            let currToken = tokens[i]
            let nextToken = tokens[i + 1]
            let deleteNext = true
            const handleArg = name => {
                let argOption = this.getArgOption(argOptions, name)
                if (!argOption) {
                    error(`Unexpected property "${name}" (E212)`)
                } else if (argOption.type == "boolean") {
                    namedArgs[name] = true
                    deleteNext = false
                } else {
                    namedArgs[name] = nextToken ?? true
                }
            }
            if (currToken.match(/^--?[a-zA-Z][a-zA-Z0-9:_\-:.]*$/g)) {
                if (currToken.startsWith("--")) {
                    let name = currToken.slice(2)
                    handleArg(name)
                } else if (currToken.length == 2) {
                    let name = currToken.slice(1)
                    handleArg(name)
                } else {
                    for (let j = 0; j < currToken.length; j++) {
                        let char = currToken[j]
                        if (char == "-") continue
                        namedArgs[char] = true
                        if (j == currToken.length - 1) {
                            handleArg(char)
                        } else {
                            let argOption = this.getArgOption(argOptions, char)
                            if (!argOption) {
                                error(`Unexpected property "${char}" (E312)`)
                            } else if (argOption.type != "boolean") {
                                error(`Property "${char}" is not a boolean and cannot be assigned no value`)
                            }
                        }
                    }
                }
                deleteIndeces.push(i)
                if (deleteNext)
                    deleteIndeces.push(i + 1)
            }
        }

        let tokensCopy = tokens.map((t, i) => [i, t])
            .filter(([i, t]) => !deleteIndeces.includes(i))
            .map(([i, t]) => t)

        return [tokensCopy, namedArgs]
    }

    static parseArgs(tempTokens, command) {
        let args = command.args, defaultValues = command.defaultValues ?? {}
        if (args.length == 0 && tempTokens.length == 0)
            return {}

        let argsArray = (args.toString() == "[object Object]") ? Object.keys(args) : args
        let argOptions = argsArray.map(this.parseArgOptions).flat()
            .concat([this.parseArgOptions("?help:b"), this.parseArgOptions("?h:b")])

        Object.entries(defaultValues).forEach(([name, value]) => {
            this.getArgOption(argOptions, name).default = value
        })

        if (args.toString() == "[object Object]")
            Object.entries(args).map(([arg, description], i) => {
                argOptions[i].description = description
            })

        function error(errMessage) {
            let tempArgOptions = argOptions.filter(arg => !arg.isHelp)

            terminal.print("$ ", terminal.data.accentColor2)
            terminal.print(command.name + " ")
            if (tempArgOptions.length == 0)
                terminal.print("doesn't accept any arguments")
            terminal.printLine(tempArgOptions.map(arg => {
                let name = arg.name
                if (arg.optional) name = "?" + name
                return `<${name}>`
            }).join(" "), terminal.data.accentColor1)
            
            let maxArgNameLength = Math.max(...tempArgOptions.map(arg => arg.fullName.length))
            for (let argOption of tempArgOptions) {

                let autoDescription = ""

                if (argOption.default) {
                    autoDescription += ` [default: ${argOption.default}]`
                } else if (argOption.optional) {
                    autoDescription += " [optional]"
                }

                if (argOption.type == "number") {
                    autoDescription += " [numeric"
                    if (argOption.min != null) {
                        autoDescription += `: ${argOption.min}`
                        autoDescription += ` to ${argOption.max}`
                    }
                    autoDescription += "]"
                }

                let combinedDescription = autoDescription.trim() + " " + argOption.description

                if (combinedDescription.trim().length == 0)
                    continue

                terminal.print(" > ")
                terminal.print(argOption.fullName.padEnd(maxArgNameLength + 1), terminal.data.accentColor1)

                if (combinedDescription.length > 50) {
                    terminal.printLine(autoDescription)
                    terminal.print(" ".repeat(maxArgNameLength + 5))
                    terminal.printLine(argOption.description)
                } else if (combinedDescription.length > 0) {
                    terminal.printLine(combinedDescription)
                }

            }

            if (errMessage)
                terminal.printError(errMessage, "ParseError")

            throw new IntendedError()
        }

        let argValues = Object.fromEntries(argOptions.map(arg => [arg.name, undefined]))
        let [tokens, namedArgs] = this.parseNamedArgs(tempTokens, argOptions, error, command.info.disableEqualsArgNotation)

        if (namedArgs.help || namedArgs.h) {
            error()
        }

        let requiredCount = argOptions.filter(arg => !arg.optional).length
        if (tokens.length < requiredCount) {
            let s = requiredCount == 1 ? "" : "s"
            error(`Expected at least ${requiredCount} argument${s}, got ${tokens.length}`)
        }

        function parseValue(value, argOption) {
            function addVal(name, value) {
                if (argOption.expanding && argValues[name]) {
                    value = argValues[name] + " " + value
                }
                argValues[name] = value
            } 

            if (argOption.type == "number") {
                let num = parseFloat(value)
                if (argOption.numtype == "integer") {
                    if (!Number.isInteger(num)) {
                        error(`At property "${argOption.name}": Expected an integer, got "${value}"`)
                    }
                }

                if (isNaN(num) || isNaN(value)) {
                    error(`At property "${argOption.name}": Expected a number, got "${value}"`)
                }

                if (argOption.min != null && num < argOption.min) {
                    error(`At property "${argOption.name}": Number must be at least ${argOption.min}, got ${num}`)
                }

                if (argOption.max != null && num > argOption.max) {
                    error(`At property "${argOption.name}": Number must be at most ${argOption.max}, got ${num}`)
                }

                addVal(argOption.name, num)
            } else if (argOption.type == "boolean") {
                if (value != "true" && value != "false") {
                    error(`At property "${argOption.name}": Expected a boolean, got "${value}"`)
                }
                addVal(argOption.name, value == "true")
            } else {
                addVal(argOption.name, value)
            }
        }

        for (let i = 0;; i++) {
            let token = tokens.shift()
            if (token == undefined) break

            
            let argOption = argOptions[i]
            if (i > 0 && argOptions[i - 1].expanding) {
                argOption = argOptions[i - 1]
                i--
            }
            if (argOption == undefined) {
                error(`Unexpected Argument`)
            }

            if (argOption.isHelp) {
                error(`Too many arguments`)
            }

            parseValue(token, argOption)
        }

        for (let [name, value] of Object.entries(namedArgs)) {
            let argOption = this.getArgOption(argOptions, name)
            if (argOption == undefined) {
                error(`Unknown argument "${name}"`)
            }
            parseValue(value.toString(), argOption)
        }

        for (let [key, value] of Object.entries(defaultValues)) {
            if (argValues[key] == undefined) {
                argValues[key] = value
            }
        }

        for (let argOption of argOptions) {
            let value = argValues[argOption.name]
            if (value == undefined) continue
            argOption.forms.forEach(form => {
                argValues[form] = value
            })
        }

        return argValues

    }

}

class Command {

    constructor(name, callback, info) {
        this.name = name
        this.callback = callback
        this.info = info
        this.args = info.args ?? {}
        this.description = info.description ?? ""
        this.defaultValues = info.defaultValues ?? info.standardVals ?? {}
    }

    processArgs(args, rawArgs) {
        if (this.info.rawArgMode)
            return rawArgs
        return TerminalParser.parseArgs(args, this)
    }

    async run(args, rawArgs) {
        terminal.expectingFinishCommand = true
        try {
            let argObject = this.processArgs(args, rawArgs)
            if (this.callback.constructor.name === 'AsyncFunction') {
                await this.callback(argObject)
            } else {
                this.callback(argObject)
            }
            terminal.finishCommand()
        } catch (error) {
            if (!(error instanceof IntendedError)) {
                terminal.printError(error.message, error.name)
                console.error(error)
            }
            terminal.finishCommand()
        }
    }

}

const UtilityFunctions = {

    stringPad(string, length, char=" ") {
        return string.toString().padStart(length, char)
    },

    stringPadBack(string, length, char=" ") {
        return string.toString().padEnd(length, char)
    },

    stringPadMiddle(string, length, char=" ") {
        string = string.toString()
        while (string.length < length) {
            string = char + string + char
        }
        while (string.length > length) {
            string = string.slice(1)
        }
        return string
    },

    stringMul(string, count) {
        return string.toString().repeat(count)
    },

    strRepeat(string, count) {
        return string.toString().repeat(count)
    },

    Color: Color,

    FileType: {
        FOLDER: "directory",
        READABLE: "text",
        PROGRAM: "executable",
        MELODY: "melody",
        DATA_URL: "dataurl"
    },

    async playFrequency(f, ms, volume=0.5, destination=null, returnSleep=true) {
        if (!terminal.audioContext) {
            terminal.audioContext = new(window.AudioContext || window.webkitAudioContext)()
            if (!terminal.audioContext)
                throw new Error("Browser doesn't support Audio")
        }
    
        let oscillator = terminal.audioContext.createOscillator()
        oscillator.type = "square"
        oscillator.frequency.value = f
    
        let gain = terminal.audioContext.createGain()
        gain.connect(destination || terminal.audioContext.destination)
        gain.gain.value = volume
    
        oscillator.connect(gain)
        oscillator.start(terminal.audioContext.currentTime)
        oscillator.stop(terminal.audioContext.currentTime + ms / 1000)
    
        if (returnSleep)
            return terminal.sleep(ms)
    },

    parseColor(input) {
        // very slow but works
        // (creates a canvas element and draws the color to it
        //  then reads the color back as RGB)

        let canvas = document.createElement("canvas")
        canvas.width = 1
        canvas.height = 1
        let ctx = canvas.getContext("2d")
        ctx.fillStyle = input
        ctx.fillRect(0, 0, 1, 1)
        let data = ctx.getImageData(0, 0, 1, 1).data
        return new Color(data[0], data[1], data[2])
    },

    TerminalParser: TerminalParser,
    TextFile: TextFile,
    Directory: Directory,
    ExecutableFile: ExecutableFile,
    DataURLFile: DataURLFile,
    Command: Command,
    IntendedError: IntendedError,

    addAlias(alias, command) {
        terminal.aliases[alias] = command
        console.log(`Added alias "${alias}" for command "${command}"`)
    }

}

class TerminalModules {

    modulePath = "js/modules"

    constructor() {}

    async load(name) {
        if (this[name])
            return this[name]
        let url = `${this.modulePath}/${name}.js`
        await terminal._loadScript(url)
        return this[name]
    }

    async import(name, window) {
        await this.load(name)
        for (let [key, value] of Object.entries(this[name])) {
            window[key] = value
        }
    }

}

class Terminal {

    parentNode = document.getElementById("terminal")
    commandListURL = "js/load-commands.js"
    defaultFileystemURL = "js/defaultFilesystem.js"

    currInputElement = null
    expectingFinishCommand = false
    commandCache = {}

    data = new TerminalData()
    fileSystem = new FileSystem()
    modules = new TerminalModules()

    aliases = {}

    scroll(behavior="smooth") {
        this.parentNode.scrollTo({
            top: 10 ** 10, // sufficiently large number
            behavior
        })
    }

    _interruptSTRGC() {
        terminal.printError("Pressed [^c]", "\nInterrupt")
        terminal.expectingFinishCommand = true
        for (let callback of this._interruptCallbackQueue)
            callback()
        this._interruptCallbackQueue = []
        terminal.finishCommand()
    }

    getFile(path, fileType=undefined) {
        // throws error if file not found
        if (path == ".") path = ""
        let file = this.fileSystem.getFile(path)
        if (file == null) {
            throw new Error(`File "${path}" not found`)
        }
        return file
    }

    fileExists(path) {
        if (path == ".") path = ""
        return this.fileSystem.getFile(path) != null
    }

    updatePath() {
        // legacy
    }

    isValidFileName(name) {
        return name.match(/^[a-zA-Z0-9_\-\.]+$/)
    }

    async copy(text) {
        return await navigator.clipboard.writeText(text)
    }

    async sleep(ms) {
        let running = true
        let aborted = false
        const intervalFunc = () => {
            if (!running) return
            if (terminal.pressed.Control && terminal.pressed.c || terminal._interruptSignal) {
                terminal._interruptSignal = false
                running = false
                clearInterval(interval)
                aborted = true
                terminal._interruptSTRGC()
            }
        }

        let interval = setInterval(intervalFunc, 50)
        intervalFunc()

        return new Promise(resolve => {
            setTimeout(() => {
                running = false
                clearInterval(interval)
                if (!aborted) resolve()
            }, ms)
        })
    }

    interrupt() {
        this._interruptSignal = true
    }

    onInterrupt(callback) {
        this._interruptCallbackQueue.push(callback)
    }

    reload() {
        location.reload()
    }

    href(url) {
        window.location.href = url
    }

    getAutoCompleteOptions(text) {
        let lastWord = text.split(" ").pop()
        const allRelativeFiles = terminal.fileSystem.allFiles()
            .map(file => file.path)
            .concat(terminal.fileSystem.currFolder.relativeChildPaths)
        let possibleMatches = Object.keys(terminal.allCommands)
            .concat(allRelativeFiles)
            .filter(f => f.startsWith(lastWord))

        possibleMatches.sort()
        possibleMatches.sort((a, b) => a.length - b.length)

        return possibleMatches.map(match => {
            let words = text.split(" ")
            words.pop()
            words.push(match)
            return words.join(" ")
        })
    }

    refurbishInput(text) {
        text = text.replaceAll(/![0-9]+/g, match => {
            let index = parseInt(match.slice(1))
            if (terminal.data.history[index])
                return terminal.data.history[index]
            return match
        })
        text = text.replaceAll(/!!/g, () => {
            return terminal.data.history[terminal.data.history.length - 1] ?? ""
        }) 
        text = text.trim()
        for (let [alias, command] of Object.entries(terminal.aliases)) {
            text = text.replaceAll(RegExp(`^${alias}`, "g"), command)
        }
        return text
    }

    async prompt(msg, {password=false}={}) {
        if (msg) terminal.print(msg)

        function createInput() {
            let input = document.createElement("input")
            input.type = "text"
            input.className = "terminal-input"
            input.autocomplete = "off"
            input.autocorrect = "off"
            input.autocapitalize = "off"
            input.spellcheck = "false"
            if (password) input.type = "password"
            return input
        }

        let inputElement = createInput()
        this.parentNode.appendChild(inputElement)
        let rect = inputElement.getBoundingClientRect()
        inputElement.style.width = `${this.parentNode.clientWidth - rect.left - rect.width}px`
        inputElement.focus({preventScroll: true})

        this.scroll()
        this.currInputElement = inputElement

        return new Promise(resolve => {

            let keyListeners = {}

            keyListeners["Enter"] = event => {
                let text = this.refurbishInput(inputElement.value)
                this.printLine(password ? "•".repeat(text.length) : text)
                resolve(text)
                inputElement.remove()
                this.currInputElement = null
            }

            let tabIndex = 0
            let suggestions = []
            keyListeners["Tab"] = event => {
                event.preventDefault()
                if (suggestions.length == 0)
                    suggestions = this.getAutoCompleteOptions(inputElement.value)
                if (suggestions.length > 0) {
                    inputElement.value = suggestions[tabIndex]
                    tabIndex = (tabIndex + 1) % suggestions.length
                }
            }

            let historyIndex = this.data.history.length
            keyListeners["ArrowUp"] = event => {
                event.preventDefault()
                let history = this.data.history
                if (historyIndex >= 0) {
                    historyIndex--
                    inputElement.value = history[historyIndex]
                }
            }

            keyListeners["ArrowDown"] = event => {
                event.preventDefault()
                let history = this.data.history
                historyIndex++
                if (historyIndex > history.length - 1) {
                    historyIndex = history.length
                    inputElement.value = ""
                } else {
                    inputElement.value = history[historyIndex]
                }
            }

            inputElement.addEventListener("keydown", event => {
                if (keyListeners[event.key])
                    keyListeners[event.key](event)
                else {
                    tabIndex = 0
                    suggestions = []
                }

                if (event.key == "c" && event.ctrlKey) {
                    inputElement.remove()
                    terminal.currInputElement = undefined
                    terminal._interruptSTRGC()
                }
            })

        })

    }

    async acceptPrompt(msg, standardYes=true) {
        const nope = () => {throw new IntendedError("Nope")}
        let extraText = ` [${standardYes ? "Y/n" : "y/N"}] `
        let text = await this.prompt(msg + extraText)

        if (text == "" && standardYes) return true
        if (text.toLowerCase().startsWith("y")) return true

        nope()
    }

    async promptNum(msg=null, {min=null, max=null}={}) {
        min = min ?? -Infinity
        max = max ?? Infinity
        while (true) {
            let inp = await this.prompt(msg)
            if (isNaN(inp) || inp.length == 0) {
                this.printError("You must supply a valid number")
                continue
            }
            let num = parseFloat(inp)
            if (min > num) {
                this.printError(`The number must be larger than ${min - 1}`)
            } else if (max < num) {
                this.printError(`The number must be smaller than ${max + 1}`)
            } else {
                return num
            }
        }
    }

    print(text, color=undefined, {forceElement=false, element="span"}={}) {
        text ??= ""
        let output = undefined
        if (color === undefined && !forceElement) {
            let textNode = document.createTextNode(text)
            this.parentNode.appendChild(textNode)
            output = textNode
        } else {
            let span = document.createElement(element)
            span.textContent = text
            if (color !== undefined) span.style.color = color.string.hex
            terminal.parentNode.appendChild(span)
            output = span
        }
        return output
    }

    printImg(src, altText="") {
        let img = this.parentNode.appendChild(document.createElement("img"))
        img.src = src
        img.alt = altText
        img.classList.add("terminal-img")
        img.onload = function() {
            img.style.aspectRatio = img.naturalWidth / img.naturalHeight
            if (img.clientHeight < img.clientWidth) {
                img.style.width = "auto"
                img.style.height = `${img.clientHeight}px`
            } else {
                img.style.height = "auto"
                img.style.width = `${img.clientWidth}px`
            }
        }
        return img
    }

    printTable(inRows, headerRow=null) {
        let rows = inRows.map(r => r.map(c => (c == undefined) ? " " : c))
        if (headerRow != null) rows.unshift(headerRow)
        const column = i => rows.map(row => row[i])
        const columnWidth = i => Math.max(...column(i)
            .map(e => String((e == undefined) ? " " : e).length))
        for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
            if (rowIndex == 0
                || (rowIndex == 1 && headerRow != null)
                || (rowIndex == rows.length)) {
                let line = ""
                for (let columnIndex = 0; columnIndex < rows[0].length; columnIndex++) {
                    let item = UtilityFunctions.stringMul("-", columnWidth(columnIndex))
                    line += `+-${item}-`
                }
                line += "+"
                terminal.printLine(line)
            }
            if (rowIndex == rows.length) break
            let line = ""
            for (let columnIndex = 0; columnIndex < rows[0].length; columnIndex++) {
                let itemVal = rows[rowIndex][columnIndex]
                if (itemVal == undefined) itemVal = " "
                let padFunc = (rowIndex == 0 && headerRow != null) ? UtilityFunctions.stringPadMiddle : UtilityFunctions.stringPadBack
                let item = padFunc(itemVal, columnWidth(columnIndex))
                line += `| ${item} `
            }
            line += "|  "
            terminal.printLine(line)
        }
    }

    async animatePrint(text, interval=50, {newLine=true}={}) {
        for (let char of text) {
            this.print(char)
            await terminal.sleep(interval)
        }
        if (newLine) this.printLine()
    }

    printLine(text, color, opts) {
        text ??= ""
        return this.print(text + "\n", color, opts)
    }

    printError(text, name="Error") {
        terminal.print(name, new Color(255, 0, 0))
        terminal.printLine(": " + text)
    }

    printSuccess(text) {
        terminal.printLine(text, new Color(0, 255, 0))
    }

    addLineBreak() {
        this.printLine()
    }

    printCommand(commandText, command, color, endLine=true) {
        let element = terminal.print(commandText, color, {forceElement: true})
        element.onclick = this.makeInputFunc(command ?? commandText)
        element.classList.add("clickable")
        if (color) element.style.color = color.string.hex
        if (endLine) terminal.printLine()
    }

    printLink(msg, url, color, endLine=true) {
        let element = terminal.print(msg, color, {forceElement: true, element: "a"})
        element.href = url
        if (endLine) terminal.printLine()
    }

    async standardInputPrompt() {
        let element = this.print(this.fileSystem.pathStr + " ", undefined, {forceElement: true})
        element.style.marginLeft = "-2em"
        this.print("$ ", this.data.accentColor2)
        let text = await this.prompt()
        await this.input(text)
    }

    async input(text) {
        let tokens = TerminalParser.tokenize(text)
        if (tokens.length == 0) {
            this.standardInputPrompt()
            return
        }

        if (text !== this.data.lastItemOfHistory)
            this.data.addToHistory(text)

        let [commandText, args] = TerminalParser.extractCommandAndArgs(tokens)
        if (this.commandExists(commandText)) {
            let rawArgs = text.slice(commandText.length)
            let command = await this.getCommand(commandText)
            await command.run(args, rawArgs)
        } else {
            let cmdnotfound = await this.getCommand("cmdnotfound")
            await cmdnotfound.run([commandText], commandText)
        }
    }

    commandExists(commandName) {
        return Object.keys(this.allCommands).includes(commandName)
    }

    addCommand(name, callback, info) {
        this.commandCache[name] = new Command(name, callback, info)
    }

    get functions() {
        return Object.entries(this.allCommands).map(d => {
            return {name: d[0], description: d[1]}
        })
    }

    get visibleFunctions() {
        return this.functions
    }

    get currFolder() {
        return this.fileSystem.currFolder
    }

    get lastPrintedChar() {
        return this.parentNode.textContent[this.parentNode.textContent.length - 1]
    }

    get rootFolder() {
        return this.fileSystem.root
    }

    get prevCommands() {
        return this.data.history
    }

    get widthPx() {
        let computedStyle = getComputedStyle(this.parentNode)
        let elementWidth = this.parentNode.clientWidth
        elementWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)
        return elementWidth
    }

    get approxWidthInChars() {
        let firstSpan = terminal.parentNode.querySelector("span")
        let firstSpanWidth = firstSpan.getBoundingClientRect().width
        let textWidth = firstSpan.textContent.length
        let charWidth = firstSpanWidth / textWidth
        return Math.floor(this.widthPx / charWidth) - 5
    }

    async _loadScript(url, extraData={}) {
        // make a new iframe to load the script in
        // to prevent the script from accessing the global scope
        // instead, it will access the iframe's global scope
        // in which i place the terminal object
        
        // this way, command scripts each have their own scope
        // and cannot access each other's variables
        // which is good because it prevents command scripts
        // from interfering with each other (name conflicts, etc.)

        // to make sure the browser doesn't cache the script

        let iframe = document.createElement("iframe")
        let script = document.createElement("script")
        script.src = `${url}?${loadIndex}`
        iframe.style.display = "none"
        document.body.appendChild(iframe)
        let iframeDocument = iframe.contentDocument || iframe.contentWindow.document

        iframe.contentWindow.terminal = this
        for (let key in extraData)
            iframe.contentWindow[key] = extraData[key]
        for (let key in UtilityFunctions)
            iframe.contentWindow[key] = UtilityFunctions[key]
        iframe.contentWindow["sleep"] = this.sleep
        iframe.contentWindow["audioContext"] = this.audioContext
        iframe.contentWindow["loadIndex"] = loadIndex

        iframeDocument.body.appendChild(script)
        await new Promise(resolve => script.onload = resolve)

        console.log(`Loaded Script: ${url}`)
    }

    async loadCommand(name, {force=false}={}) {
        if (this.commandCache[name] && !force)
            return this.commandCache[name]
        await this._loadScript(`js/commands/${name}.js`)
        return this.commandCache[name]
    }

    async getCommand(name) {
        if (!this.commandCache[name]) {
            try {
                await this.loadCommand(name)
            } catch {}
        }
        return this.commandCache[name]
    }

    async finishCommand({force=false}={}) {
        if (!this.expectingFinishCommand && !force)
            return
        this.expectingFinishCommand = false
        
        if (this.lastPrintedChar !== "\n")
            this.print("\n")
        this.print("\n")

        this.fileSystem.save()

        this.standardInputPrompt()
    }

    reset() {
        this.data.resetAll()
        localStorage.removeItem("terminal-filesystem")
    }

    makeInputFunc(text) {
        return () => {
            if (this.currInputElement) {
                this.currInputElement.remove()
                this.currInputElement = undefined
                this.printLine(text)
                this.input(text)
            }
        }
    }

    async init() {
        this._loadScript(this.commandListURL)
        await this.fileSystem.load()
        let helloworld = await this.getCommand("helloworld")
        helloworld.run()
    }

    constructor() {
        this.startTime = Date.now()

        // when the user clicks on the terminal, focus the input element
        this.parentNode.addEventListener("click", () => {
            function getSelectedText() {
                let text = ""
                if (typeof window.getSelection != "undefined") {
                    text = window.getSelection().toString()
                } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
                    text = document.selection.createRange().text
                }
                return text
            }

            // if the user has selected text, don't focus the input element
            if (this.currInputElement && !getSelectedText())
                this.currInputElement.focus()
        })

        // save the keys pressed by the user
        // so that they can be used in the keydown event listener
        // to detect key combinations
        this.pressed = {}

        document.addEventListener("keydown", event => {
            this.pressed[event.key] = true
        })

        document.addEventListener("keyup", event => {
            this.pressed[event.key] = false
        })

        this.body = document.body
        this.document = document
        this.window = window

        this._interruptSignal = false
        this._interruptCallbackQueue = []
    }

}

const terminal = new Terminal()
terminal.init() // can't use async constructor
// and parts of init() rely on terminal being defined
// e.g. the fileSystem initialization/loading