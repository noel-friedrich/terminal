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
    static get ERROR() {return new Color(255, 128, 128)}

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
            } else if (type == "f") {
                argOptions.type = "file"
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

    static parseArgs(tempTokens, command={
        defaultValues: {},
        args: {},
        name: "",
        helpFunc: null,
        info: {}
    }, silent=false) {
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

        function error(errMessage, isHelp=false) {
            if (silent) throw new IntendedError()

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

            if (isHelp && command.helpFunc) {
                command.helpFunc()
            }

            if (errMessage)
                terminal.printError(errMessage, "ParseError")

            throw new IntendedError()
        }

        let argValues = Object.fromEntries(argOptions.map(arg => [arg.name, undefined]))
        let [tokens, namedArgs] = this.parseNamedArgs(tempTokens, argOptions, error, command.info.disableEqualsArgNotation)

        if (namedArgs.help || namedArgs.h) {
            if (silent) {
                return
            }
            error(undefined, true)
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
            } else if (argOption.type == "file") {
                if (!terminal.fileExists(value)) {
                    error(`File not found: "${value}"`)
                }
                addVal(argOption.name, value)
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
        this.helpFunc = info.helpFunc ?? null
        this.description = info.description ?? ""
        this.defaultValues = info.defaultValues ?? info.standardVals ?? {}
        this.windowScope = null
    }

    get terminal() {
        return this.windowScope.terminal
    }

    set terminal(newTerminal) {
        this.windowScope.terminal = newTerminal
    }

    checkArgs(args) {
        if (this.info.rawArgMode)
            return true
        try {
            TerminalParser.parseArgs(args, this, true)
            return true
        } catch (error) {
            return false
        }
    }

    processArgs(args, rawArgs) {
        if (this.info.rawArgMode)
            return rawArgs
        return TerminalParser.parseArgs(args, this, this.terminal.inTestMode)
    }

    async run(args, rawArgs, {callFinishFunc=true, terminalObj=undefined}={}) {
        if (terminalObj)
            this.terminal = terminalObj
        if (callFinishFunc)
            this.terminal.expectingFinishCommand = true

        try {
            let argObject = this.processArgs(args, rawArgs)
            if (this.callback.constructor.name === 'AsyncFunction') {
                await this.callback(argObject)
            } else {
                this.callback(argObject)
            }
            this.terminal.finishCommand()
            return true
        } catch (error) {
            if (!(error instanceof IntendedError))
                this.terminal.printError(error.message, error.name)
            this.terminal.finishCommand()

            // if the sleep command was called a max number
            // of times, it's considered to be a success
            return this.terminal.tempActivityCallCount === this.terminal.tempMaxActivityCallCount
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
        if (terminal.inTestMode) return
        terminal.aliases[alias] = command
        console.log(`Added alias "${alias}" for command "${command}"`)
    }

}

class TerminalModules {

    modulePath = "js/modules"

    constructor() {}

    async load(name, terminalObj) {
        if (terminalObj.inTestMode) {
            terminalObj.tempActivityCallCount = terminalObj.tempMaxActivityCallCount
            throw new IntendedError()
        }

        if (this[name])
            return this[name]

        let url = `${this.modulePath}/${name}.js`
        await terminalObj._loadScript(url)
        return this[name]
    }

    async import(name, window) {
        await this.load(name, window.terminal)
        for (let [key, value] of Object.entries(this[name])) {
            window[key] = value
        }
    }

}

let ALL_TERMINALS = {}
let CORRECTNESS_CACHE = {}

const OutputChannel = {
    USER: "user",
    NONE: "none"
}

class Terminal {

    parentNode = document.getElementById("terminal")
    containerNode = document.querySelector(".terminal-container")
    commandListURL = "js/load-commands.js"
    defaultFileystemURL = "js/defaultFilesystem.js"

    currInputElement = null
    currSuggestionElement = null
    currInputContainer = null
    correctIndicator = null
    expectingFinishCommand = false
    commandCache = {}
    testProcessID = 0
    tempActivityCallCount = 0
    tempMaxActivityCallCount = Infinity
    debugMode = false

    name = ""
    data = new TerminalData()
    fileSystem = new FileSystem()
    modules = new TerminalModules()

    aliases = {}

    outputChannel = OutputChannel.USER

    scroll(behavior="smooth") {
        const opts = {
            top: 10 ** 10, // sufficiently large number
            left: 0,
            behavior
        }
        this.parentNode.scrollTo(opts)
        this.containerNode.scrollTo(opts)
    }

    get inTestMode() {
        return this.outputChannel == OutputChannel.NONE
    }

    removeCurrInput() {
        if (this.currInputContainer)
            this.currInputContainer.remove()
        this.currInputContainer = null
        this.currInputElement = null
        this.currSuggestionElement = null
    }

    _interruptSTRGC() {
        if (this.inTestMode)
            return
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
        if (fileType && file.type != fileType)
            throw new Error(`File "${path}" is not a ${fileType}`)
        return file
    }

    async createFile(fileName, fileType, data) {
        if (!terminal.isValidFileName(fileName))
            throw new Error("Invalid filename")
        if (terminal.fileExists(fileName))
            throw new Error("File already exists")
        let newFile = new (fileType)(data)
        if (!terminal.inTestMode) {
            terminal.currFolder.content[fileName] = newFile
            await terminal.fileSystem.reload()
        }
        return newFile
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
        if (terminal.inTestMode)
            return
        return await navigator.clipboard.writeText(text)
    }

    async sleep(ms) {
        terminal.tempActivityCallCount++
        if (terminal.tempActivityCallCount === terminal.tempMaxActivityCallCount)
            throw new IntendedError()

        if (terminal.outputChannel == OutputChannel.NONE)
            return

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
        if (terminal.inTestMode)
            return
        window.location.href = url
    }

    setInputCorrectness(correct) {
        if (!this.correctIndicator)
            return
        if (correct) {
            this.correctIndicator.style.color = Color.LIGHT_GREEN.toString()
        } else {
            this.correctIndicator.style.color = Color.ERROR.toString()
        }
    }

    getAutoCompleteOptions(text) {
        let lastWord = text.split(/\s/g).pop()
        const allRelativeFiles = terminal.fileSystem.allFiles()
            .map(file => file.path)
            .concat(terminal.fileSystem.currFolder.relativeChildPaths)

        const configMatches = ms => ms.filter(f => f.startsWith(lastWord))
            .sort().sort((a, b) => a.length - b.length)

        const exportMatches = ms => ms.map(match => {
            let words = text.split(" ")
            words.pop()
            words.push(match)
            return words.join(" ")
        })

        let commandMatches = configMatches(Object.keys(terminal.allCommands))
        let fileMatches = configMatches(allRelativeFiles)
        let allMatches = configMatches(commandMatches.concat(fileMatches))

        text = this.refurbishInput(text)
        let tokens = TerminalParser.tokenize(text)
        let [commandText, args] = TerminalParser.extractCommandAndArgs(tokens)

        let matchingFirstWord = lastWord === text.trim()
        if (matchingFirstWord) {
            return exportMatches(commandMatches)
        }

        return exportMatches(allMatches)
    }

    refurbishInput(text) {
        text = text.replaceAll(/![0-9]+/g, match => {
            let index = parseInt(match.slice(1)) - 1
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

    turnToTestMode() {
        this.outputChannel = OutputChannel.NONE
    }

    async updateInputCorrectnessDebug(text) {
        // experimental feature
        // this is a very hacky way to do this
        // and produces a lot of side effects and bugs
        // (for now hidden in debug mode)

        this.testProcessID++

        let virtualTerminal = new Terminal(`v${this.testProcessID}`)
        await virtualTerminal.initFrom(this)
        virtualTerminal.turnToTestMode()
        virtualTerminal.testProcessID = this.testProcessID

        virtualTerminal.tempActivityCallCount = 0
        virtualTerminal.tempMaxActivityCallCount = 1
        
        let wentWell = true

        try {
            wentWell = await virtualTerminal.input(text, true)
        } catch {
            wentWell = false
        }

        if (!wentWell) {
            wentWell = virtualTerminal.tempActivityCallCount === virtualTerminal.tempMaxActivityCallCount
        }

        if (virtualTerminal.testProcessID == this.testProcessID) {
            this.setInputCorrectness(wentWell)
        }

        CORRECTNESS_CACHE[text] = wentWell
    }

    async updateInputCorrectness(text) {
        if (text.trim().length == 0) {
            this.setInputCorrectness(true)
            return
        }

        if (this.debugMode)
            return await this.updateInputCorrectnessDebug(text)

        if (text in CORRECTNESS_CACHE) {
            this.setInputCorrectness(CORRECTNESS_CACHE[text])
            return
        }

        let tokens = TerminalParser.tokenize(text)
        let [commandText, args] = TerminalParser.extractCommandAndArgs(tokens)
        if (!this.commandExists(commandText)) {
            this.setInputCorrectness(false)
            return
        }

        let commandData = this.commandData[commandText]
        this.setInputCorrectness(true)

        let tempCommand = new Command(commandText, () => undefined, commandData)
        tempCommand.windowScope = this.window
        tempCommand.terminal = this
        this.setInputCorrectness(tempCommand.checkArgs(args))
    }

    async prompt(msg, {password=false, affectCorrectness=false,
        getHistory = () => this.data.history,
        addToHistory = (data) => this.data.addToHistory(data),
        inputCleaning=true,
        inputSuggestions=true,
    }={}) {
        if (this.inTestMode) {
            this.tempActivityCallCount++
            return ""
        }

        function lastItemOfHistory() {
            let history = getHistory()
            return history[history.length - 1]
        }

        if (msg) terminal.print(msg)

        const createInput = () => {
            let inputContainer = document.createElement("div")
            inputContainer.className = "terminal-input-container"

            let input = document.createElement("input")
            input.type = "text"
            input.className = "terminal-input"
            input.autocomplete = "off"
            input.autocorrect = "off"
            input.autocapitalize = "off"
            input.spellcheck = "false"
            input.name = "terminal-input"

            let label = document.createElement("label")
            label.className = "terminal-input-label"
            label.textContent = "Input a terminal command"
            label.style.display = "none"
            label.htmlFor = "terminal-input"
            inputContainer.appendChild(label)

            let suggestion = document.createElement("div")
            suggestion.className = "terminal-suggestion"
            
            inputContainer.appendChild(input)
            inputContainer.appendChild(suggestion)

            if (password) input.type = "password"
            return [input, suggestion, inputContainer]
        }

        let [inputElement, suggestionElement, inputContainer] = createInput()
        this.parentNode.appendChild(inputContainer)
        let rect = inputElement.getBoundingClientRect()
        let inputMinWidth = `${window.innerWidth - rect.left - rect.width}`
        inputContainer.style.width = `${inputMinWidth}px`
        inputElement.focus({preventScroll: true})

        this.scroll()
        this.currInputElement = inputElement
        this.currSuggestionElement = suggestionElement
        this.currInputContainer = inputContainer

        return new Promise(resolve => {
            let inputValue = ""
            let keyListeners = {}

            keyListeners["Enter"] = event => {
                let text = inputElement.value
                if (inputCleaning) {
                    text = this.refurbishInput(inputElement.value)
                }
                this.printLine(password ? "•".repeat(text.length) : text)
                if (text !== lastItemOfHistory())
                    addToHistory(text)
                this.removeCurrInput()
                resolve(text)
            }

            let tabIndex = 0
            let suggestions = []
            keyListeners["Tab"] = event => {
                event.preventDefault()
                if (!inputSuggestions) {
                    inputElement.value += "    "
                    inputElement.oninput()
                    return
                }
                if (suggestions.length == 0)
                    suggestions = this.getAutoCompleteOptions(inputValue)
                if (suggestions.length > 0) {
                    inputElement.value = suggestions[tabIndex]
                    tabIndex = (tabIndex + 1) % suggestions.length
                    inputValue = ""
                }
                inputElement.oninput()
            }

            let historyIndex = getHistory().length
            keyListeners["ArrowUp"] = event => {
                event.preventDefault()
                let history = getHistory()
                if (historyIndex > 0) {
                    historyIndex--
                    inputElement.value = history[historyIndex]
                }
                inputElement.oninput()
            }

            keyListeners["ArrowDown"] = event => {
                event.preventDefault()
                let history = getHistory()
                historyIndex++
                if (historyIndex > history.length - 1) {
                    historyIndex = history.length
                    inputElement.value = ""
                } else {
                    inputElement.value = history[historyIndex]
                }
                inputElement.oninput()
            }

            inputElement.oninput = async event => {
                if (!inputSuggestions) {
                    suggestionElement.textContent = ""
                    return
                }

                const replaceAlreadywritten = (oldText, replacement=" ") => {
                    let newText = ""
                    for (let i = 0; i < oldText.length; i++) {
                        if (inputElement.value[i]) {
                            newText += replacement
                        } else {
                            newText += oldText[i]
                        }
                    }
                    return newText
                }

                if (suggestions.length > 0 && inputElement.value.trim().length > 0) {
                    suggestionElement.textContent = replaceAlreadywritten(suggestions[0])
                } else {
                    suggestionElement.textContent = ""
                }

                if (affectCorrectness)
                    this.updateInputCorrectness(inputElement.value)
            }

            inputElement.addEventListener("keydown", async event => {
                if (event.key.length == 1) // a, b, c, " "
                    inputValue = inputElement.value + event.key
                else if (event.key == "Backspace")
                    inputValue = inputElement.value.slice(0, -1)
                else // Tab, Enter, etc.
                    inputValue = inputElement.value

                if (keyListeners[event.key])
                    keyListeners[event.key](event)
                else {
                    tabIndex = 0
                    suggestions = this.getAutoCompleteOptions(inputValue)
                }

                if (event.key == "c" && event.ctrlKey) {
                    this.removeCurrInput()
                    this._interruptSTRGC()
                }

                let textLength = inputElement.value.length
                // (textLength + 1) to leave room for the next character
                let inputWidth = (textLength + 1) * this.charWidth
                inputContainer.style.width = `max(${inputMinWidth}px, ${inputWidth}px)`
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

    print(text, color=undefined, {forceElement=false, element="span", fontStyle=undefined, background=undefined}={}) {
        text ??= ""
        let output = undefined
        if (color === undefined && !forceElement && fontStyle === undefined && background === undefined) {
            let textNode = document.createTextNode(text)
            if (!this.inTestMode)
                this.parentNode.appendChild(textNode)
            output = textNode
        } else {
            let span = document.createElement(element)
            span.textContent = text
            if (color !== undefined) span.style.color = color.string.hex
            if (fontStyle !== undefined) span.style.fontStyle = fontStyle
            if (background !== undefined) {
                span.style.backgroundColor = background.string.hex
            }

            if (!this.inTestMode) {
                this.parentNode.appendChild(span)
            }
            output = span
        }
        return output
    }

    printItalic(text, color=undefined, opts) {
        return this.printLine(text, color, {...opts, fontStyle: "italic"})
    }

    printImg(src, altText="") {
        if (this.inTestMode)
            return

        let img = this.parentNode.appendChild(document.createElement("img"))
        img.src = src
        img.alt = altText
        img.classList.add("terminal-img")
        img.onload = this._styleImgElement
        return img
    }

    _styleImgElement(img, invertSetting=false) {
        img.style.aspectRatio = img.width / img.height
        let changeCondition = img.clientHeight < img.clientWidth
        if (invertSetting) changeCondition = !changeCondition
        if (changeCondition) {
            img.style.width = "auto"
            img.style.height = `${img.clientHeight}px`
        } else {
            img.style.height = "auto"
            img.style.width = `${img.clientWidth}px`
        }
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
                this.printLine(line)
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
            this.printLine(line)
        }
    }

    async animatePrint(text, interval=50, {newLine=true}={}) {
        if (interval == 0) {
            this.print(text)
        } else {
            for (let char of text) {
                this.print(char)
                await this.sleep(interval)
            }
        }
        if (newLine) this.printLine()
    }

    printLine(text, color, opts) {
        text ??= ""
        return this.print(text + "\n", color, opts)
    }

    printError(text, name="Error") {
        this.print(name, new Color(255, 0, 0))
        this.printLine(": " + text)
    }

    printSuccess(text) {
        this.printLine(text, new Color(0, 255, 0))
    }

    addLineBreak() {
        this.printLine()
    }

    printCommand(commandText, command, color, endLine=true) {
        let element = this.print(commandText, color, {forceElement: true})
        element.onclick = this.makeInputFunc(command ?? commandText)
        element.classList.add("clickable")
        if (color) element.style.color = color.string.hex
        if (endLine) this.printLine()
    }

    printLink(msg, url, color, endLine=true) {
        let element = this.print(msg, color, {forceElement: true, element: "a"})
        element.href = url
        if (endLine) this.printLine()
    }

    async standardInputPrompt() {
        let element = this.print(this.fileSystem.pathStr + " ", undefined, {forceElement: true})
        element.style.marginLeft = "-2em"
        this.correctIndicator = this.print("$ ", Color.LIGHT_GREEN)
        let text = await this.prompt("", {affectCorrectness: true})
        await this.input(text)
    }

    async input(text, testMode=false) {
        let tokens = TerminalParser.tokenize(text)
        if (tokens.length == 0) {
            this.standardInputPrompt()
            return
        }

        let [commandText, args] = TerminalParser.extractCommandAndArgs(tokens)
        if (this.commandExists(commandText)) {
            let rawArgs = text.slice(commandText.length)
            let command = await this.getCommand(commandText)
            return await command.run(args, rawArgs, {callFinishFunc: !testMode, terminalObj: this})
        } else {
            let cmdnotfound = await this.getCommand("cmdnotfound")
            await cmdnotfound.run([commandText], commandText, {callFinishFunc: !testMode, terminalObj: this})
            return false
        }
    }

    get allCommands() {
        return Object.fromEntries(Object.entries(this.commandData).map(([cmd, data]) => {
            return [cmd, data["description"]]
        }))
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

    get charWidth() {
        let firstSpan = this.parentNode.querySelector("span")
        let firstSpanWidth = firstSpan.getBoundingClientRect().width
        let textWidth = firstSpan.textContent.length
        return firstSpanWidth / textWidth
    }

    get approxWidthInChars() {
        return Math.floor(this.widthPx / this.charWidth) - 5
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

        return iframe.contentWindow
    }

    async loadCommand(name, {force=false}={}) {
        if (this.commandCache[name] && !force)
            return this.commandCache[name]
        let commandWindow = await this._loadScript(`js/commands/${name}.js`)
        this.commandCache[name].windowScope = commandWindow
        for (let terminalInstance of Object.values(ALL_TERMINALS)) {
            terminalInstance.commandCache[name] = this.commandCache[name]
        }
        return this.commandCache[name]
    }

    async getCommand(name) {
        if (!this.commandExists(name))
            throw new Error(`Command not found: ${name}`)
        if (!this.commandCache[name]) {
            return await this.loadCommand(name)
        } else {
            return this.commandCache[name]
        }
    }

    async finishCommand({force=false}={}) {
        if ((!this.expectingFinishCommand && !force) || this.currInputElement)
            return
        this.expectingFinishCommand = false
        
        if (this.lastPrintedChar !== "\n")
            this.print("\n")
        this.print("\n")

        this._interruptCallbackQueue = []
        this._interruptSignal = false

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
                this.removeCurrInput()
                this.printLine(text)
                this.input(text)
            }
        }
    }

    async init() {
        await this._loadScript(this.commandListURL)
        await this.fileSystem.load()
        let helloworld = await this.getCommand("helloworld")
        helloworld.run()
    }

    async initFrom(otherTerminal) {
        this.commandData = otherTerminal.commandData
        this.fileSystem.loadJSON(otherTerminal.fileSystem.toJSON()) 
        this.commandCache = otherTerminal.commandCache
        this.startTime = otherTerminal.startTime 
    }

    constructor(terminalName="none") {
        this.startTime = Date.now()

        this.name = terminalName

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

        ALL_TERMINALS[terminalName] = this
    }

}

const terminal = new Terminal("main")
terminal.init() // can't use async constructor
// and parts of init() rely on terminal being defined
// e.g. the fileSystem initialization/loading