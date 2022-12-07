terminal.addCommand("ls", function(args) {
    let targetFolder = terminal.getFile(!!args.folder ? args.folder : "", FileType.FOLDER)

    let recursive = args.r

    const CHARS = {
        LINE: "│",
        T: "├",
        L: "└",
        DASH: "─",
    }

    function listFolder(folder, indentation="") {
        let i = 0
        let printedL = false
        for (let [fileName, file] of Object.entries(folder.content)) {
            i++
            if (indentation.length > 0) {
                terminal.print(indentation)
            }
            if (i == Object.keys(folder.content).length) {
                terminal.print(CHARS.L)
                printedL = true
            } else {
                terminal.print(CHARS.T)
            }
            terminal.print(CHARS.DASH.repeat(2) + " ")
            if (file.type == FileType.FOLDER) {
                terminal.printCommand(`${fileName}/`, `cd ${file.path}/`)
                if (recursive) {
                    let indentAddition = `${CHARS.LINE}   `
                    if (printedL) {
                        indentAddition = "    "
                    }
                    listFolder(file, indentation + indentAddition)
                }
            } else {
                terminal.printLine(fileName)
            }
        }
    }

    listFolder(targetFolder)

    if (Object.entries(targetFolder.content).length == 0)
        terminal.printLine(`this directory is empty`)

}, {
    helpVisible: true,
    description: "list all files of current directory",
    args: {
        "?folder": "folder to list",
        "?r": "list recursively",
    },
    standardVals: {folder: ""}
})

terminal.addCommand("cd", function(args) {
    if (["-", ".."].includes(args.directory)) {
        if (terminal.currPath.length > 0) {
            terminal.currPath.pop()
            terminal.updatePath()
            return
        } else {
            throw new Error("You are already at ground level")
        }
    } else if (["/", "~"].includes(args.directory)) {
        if (terminal.currPath.length > 0) {
            terminal.currPath = Array()
            terminal.updatePath()
            return
        } else {
            throw new Error("You are already at ground level")
        }
    }

    let targetFolder = terminal.getFile(args.directory, FileType.FOLDER)
    terminal.currPath = targetFolder.pathArray
    terminal.updatePath()
}, {
    helpVisible: true,
    args: {
        "directory": "the directory relative to your current path"
    },
    description: "change current directory",
})

{
    function makeCatFunc(readFunc) {
        return async function(args) {
            let file = terminal.getFile(args.file)
            if (file.type == FileType.FOLDER) 
                throw new Error("Cannot read directory data")
            if (args.file.endsWith("passwords.json")) {
                let favoriteUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                setTimeout(() => window.location.href = favoriteUrl, 1000)
            }
            if (!file.content)
                throw new Error("File is empty")
            if (file.type == FileType.DATA_URL) {
                terminal.printLine()
                terminal.printImg(file.content)
                terminal.printLine()
                return
            }
            if (readFunc.constructor.name == "AsyncFunction")
                await readFunc(file.content, args.file, file)
            else 
                readFunc(file.content, args.file, file)
        }
    }

    function addCatFunc(name, func, description, helpVisible=false) {
        terminal.addCommand(name, func, {
            helpVisible,
            description: description,
            args: {
                "file": "file to display"
            },
        })
    }

    let normalCatFunc = makeCatFunc((content, _, file) => {
        if (file.type == FileType.PROGRAM) {
            terminal.printLink(content, content)
        } else {
            terminal.printLine(content.trimEnd())
        }
    })

    addCatFunc("cat", normalCatFunc, "print file content", true)

    addCatFunc("tac", makeCatFunc(function(content) {
        let lines = content.split("\n")
        for (var i = lines.length - 1; i >= 0; i--) {
            let reversedLine = lines[i].split("").reverse().join("")
            terminal.printLine(reversedLine)
        }
    }), "tnetnoc elif daer")

    addCatFunc("sort", makeCatFunc(function(content) {
        let lines = content.split("\n")
        lines.sort()
        for (var i = 0; i < lines.length; i++) {
            terminal.printLine(lines[i])
        }
    }), "display a file in sorted order")

    {

        let runFunc = makeCatFunc(async function(content, fileName, file) {
            if (fileName.endsWith(".js")) {
                let jsEnv = new JsEnvironment()
                jsEnv.setValue("console", {log: m => terminal.printLine(String(m))})
                jsEnv.setValue("terminal", terminal)
                let [_, error] = jsEnv.eval(content)
                if (error)
                    throw new Error(String(error))
            } else if (file.type != FileType.PROGRAM) {
                throw new Error("File is not executable")
            } else {
                terminal.printLine("You will be redirected to:")
                terminal.printLink(content, content)
                terminal.printf`${{[Color.COLOR_1]: "Ctrl+C"}} to abort (`
                let secondsElement = terminal.print("3")
                terminal.printLine("s)")
                await sleep(1000)
                secondsElement.textContent = "2"
                await sleep(1000)
                secondsElement.textContent = "1"
                await sleep(1000)
                secondsElement.textContent = "0"
                await sleep(1000)
                window.location.href = content
            }
        })

        addCatFunc("./", runFunc, "alias for 'run'")
        addCatFunc("run", runFunc, "run a .exe file")

    }

}

terminal.addCommand("wc", function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER) {
        throw new Error("Cannot read file of type FOLDER")
    }
    let fileInfos = {
        "lines": file.content.split("\n").length,
        "words": file.content.split(" ").length,
        "characters": file.content.length
    }
    for (let [infoName, infoContent] of Object.entries(fileInfos)) {
        terminal.print(infoContent + " ", Color.COLOR_1)
        terminal.printLine(infoName)
    }
}, {
    description: "display word and line count of file",
    args: {
        "file": "file to open"
    }
})

terminal.addCommand("compliment", function() {
    function startsWithVowel(word) {
        return (
            word.startsWith("a")
            || word.startsWith("e")
            || word.startsWith("i")
            || word.startsWith("o")
            || word.startsWith("u")
        )
    }

    const adjectives = [
        "cool", "fresh", "awesome", "beautiful",
        "fantastic", "good", "wonderful", "colorful"
    ], nouns = [
        "queen", "goddess", "person", "king",
        "god", "human", "princess", "prince"
    ], sentences = [
        "you are a<n> <adjective> <noun>. happy to have you here!",
        "<n> <adjective> <noun>. that's what you are!",
        "you, <noun>, are <adjective>!",
        "i'm going to call you <noun>, because you are <adjective>"
    ], choice = l => l[Math.floor(Math.random() * l.length)]

    let sentence = choice(sentences)
    let lastAdjective = choice(adjectives)
    while (/.*<(?:adjective|n|noun)>.*/.test(sentence)) {
        sentence = sentence.replace(/<n>/, startsWithVowel(lastAdjective) ? "n": "")
        sentence = sentence.replace(/<adjective>/, lastAdjective)
        sentence = sentence.replace(/<noun>/, choice(nouns))
        lastAdjective = choice(adjectives)
    }
    terminal.printLine(sentence)
}, {
    description: "get info about yourself"
})

terminal.addCommand("whoami", async function() {
    terminal.printLine("fetching data...")

    function capitalize(str) {
        return str[0].toUpperCase() + str.slice(1)
    }

    const infos = {
        Localtime: new Date().toLocaleString(),
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        Pageon: window.location.pathname,
        Referrer: document.referrer,
        PreviousSites: history.length,
        BrowserVersion1a: navigator.appVersion,
        BrowserVersion1b: navigator.userAgent,
        BrowserLanguage: navigator.language,
        BrowserOnline: navigator.onLine,
        BrowserPlatform: navigator.platform,
        JavaEnabled: navigator.javaEnabled(),
        DataCookiesEnabled: navigator.cookieEnabled,
        ScreenWidth: screen.width,
        ScreenHeight: screen.height,
        WindowWidth: innerWidth,
        WindowHeight: innerHeight,
        AvailWidth: screen.availWidth,
        AvailHeights: screen.availHeight,
        ScrColorDepth: screen.colorDepth,
        ScrPixelDepth: screen.pixelDepth,
    }

    try {
        let response = await (await fetch("https://api.db-ip.com/v2/free/self")).json()
        for (let [key, value] of Object.entries(response)) {
            infos[capitalize(key)] = value
        }
    } catch {}

    const longestInfoName = Math.max(...Object.keys(infos).map(k => k.length)) + 2
    for (let [infoName, infoContent] of Object.entries(infos)) {
        terminal.print(stringPadBack(infoName, longestInfoName), Color.COLOR_1)
        terminal.printLine(infoContent)
    }
}, {
    description: "get client info"
})

terminal.addCommand("eval", function(argString) {
    let [result, error] = evalJsEnv.eval(argString)
    if (error) {
        terminal.printf`${{[Color.RED]: "Error"}}: ${{[Color.WHITE]: error}}\n`
    } else if (result !== undefined) {
        terminal.printf`${{[Color.rgb(38, 255, 38)]: ">>>"}} ${{[Color.WHITE]: String(result)}}\n`
    }
}, {
    description: "evaluate javascript code",
    rawArgMode: true
})

terminal.addCommand("echo", function(args) {
    terminal.printLine(args.text)
}, {
    description: "print a line of text",
    args: ["*text"]
})

function missingPermissions() {
    terminal.printf`${{[Color.RED]: "Error"}}: You do not have permission to use this command!\n`
}

terminal.addCommand("mkdir", function(args) {
    if (args.directory_name.match(/[\\\/\.\s]/))
        throw new Error("File may not contain '/' or '\\'")
    if (terminal.fileExists(args.directory_name))
        throw new Error("File/Directory already exists")
    let newFolder = new FileElement(FileType.FOLDER, {})
    terminal.currFolder.content[args.directory_name] = newFolder
    terminal.printLine(`Created ${terminal.pathAsStr + args.directory_name}/`)
}, {
    description: "create a new directory",
    args: ["directory_name"]
})

terminal.addCommand("cp", async function(args) {
    let file = terminal.getFile(args.file)
    if (["..", "-"].includes(args.directory)) {
        if (terminal.currFolder == terminal.rootFolder)
            throw new Error("You are already at ground level")
        var directory = terminal.currFolder.parent
    } else if (["/", "~"].includes(args.directory)) {
        var directory = terminal.rootFolder
    } else {
        var directory = terminal.getFile(args.directory, FileType.FOLDER)
    }
    directory.content[file.name] = file.copy()
}, {
    description: "copy a file",
    args: ["file", "directory"]
})

terminal.addCommand("mv", async function(args) {
    let file = terminal.getFile(args.file)
    if (["..", "-"].includes(args.directory)) {
        if (terminal.currFolder == terminal.rootFolder)
            throw new Error("You are already at ground level")
        var directory = terminal.currFolder.parent
    } else if (["/", "~"].includes(args.directory)) {
        var directory = terminal.rootFolder
    } else {
        var directory = terminal.getFile(args.directory, FileType.FOLDER)
    }
    directory.content[file.name] = file.copy()
    delete file.parent.content[file.name]
}, {
    description: "move a file",
    args: ["file", "directory"]
})

terminal.addCommand("rmdir", async function(args) {
    let directory = terminal.getFile(args.directory, FileType.FOLDER)
    if (Object.keys(directory.content).length > 0) {
        let msg = "the selected directory isn't empty. Continue?"
        await terminal.acceptPrompt(msg, false)
    }
    delete directory.parent.content[directory.name]
}, {
    description: "remove a directory",
    args: ["directory"]
})

terminal.addCommand("rm", async function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot remove directory. use 'rmdir' instead")
    delete file.parent.content[file.name]
}, {
    description: "remove a file",
    args: ["file"]
})

terminal.addCommand("curl", function() {
    terminal.print("this unfortunately doesn't work due to ")
    terminal.printLink("CORS", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS")
}, {description: "download a file from the internet", args: ["**"]})

terminal.addCommand("edit", async function(args) {
    let file = terminal.getFile(args.file)
    let fileLines = file.content.split("\n")

    function createInput(width) {
        let inputElement = document.createElement("input")
        terminal.parentNode.appendChild(inputElement)
        inputElement.style.width = width
        return inputElement
    }

    return new Promise(resolve => {
        let windowWidth = args.w
        let windowHeight = args.h
        let lineSeperator = `+--${stringMul("-", windowWidth)}--+`
        let preElement = terminal.printLine(lineSeperator)
        let charWidth = preElement.getBoundingClientRect().width / lineSeperator.length
        let inputs = Array()
        let lines = Array.from(Array(Math.max(windowHeight, fileLines.length)))
            .map((_, i) => (fileLines[i]) ? fileLines[i] : "")
        let numElements = Array()
        for (let i = 0; i < windowHeight; i++) {
            let num = terminal.printf`${{[Color.COLOR_1]: stringPad(`${i}`, 3)}} `[1]
            numElements.push(num)
            inputs.push(createInput(`${charWidth * windowWidth}px`))
            terminal.printLine(" |")
        }
        terminal.printLine("+" + stringPadMiddle(" strg-s to save, esc to exit ", windowWidth + 4, "-") + "+")

        function save() {
            let content = lines.reduce((a, l) => a + l + "\n", "")
            file.content = content.trim()
            resolve()
        }

        function loadLines(startIndex) {
            for (let i = startIndex; i < startIndex + windowHeight; i++) {
                if (!lines[i]) lines.push("")
                inputs[i - startIndex].value = lines[i]
                numElements[i - startIndex].textContent = stringPad(`${i}`, 3)
            }
        }

        let currScrollIndex = 0
        loadLines(currScrollIndex)

        setTimeout(() => inputs[0].focus(), 300)
        inputs[inputs.length - 1].scrollIntoView({behavior: "smooth"})

        for (let input of inputs) {
            let i = inputs.indexOf(input)
            let lineIndex = currScrollIndex + i
            input.onkeydown = function(event) {
                if (event.key == "Backspace") {
                    if (input.value.length == 0 && inputs[i - 1]) {
                        inputs[i - 1].focus()
                        lines.splice(lineIndex, 1)
                        loadLines(currScrollIndex)
                        event.preventDefault()
                    }
                } else if (event.key == "Tab") {
                    input.value += "    "
                    event.preventDefault()
                } else if (event.key == "ArrowUp") {
                    if (inputs[i - 1]) {
                        inputs[i - 1].focus()
                        inputs[i - 1].selectionStart = inputs[i - 1].selectionEnd = 10000
                    } else if (currScrollIndex > 0) {
                        currScrollIndex--
                        loadLines(currScrollIndex)
                    }
                    event.preventDefault()
                } else if (event.key == "Enter") {
                    lines.splice(lineIndex + 1, 0, "")
                    let leadingSpaces = input.value.match(/^ */)[0].length
                    lines[lineIndex] = input.value
                    if (inputs[i + 1]) {
                        inputs[i + 1].focus()
                        if (inputs[i + 1].value.length == 0) {
                            lines[lineIndex + 1] = stringMul(" ", leadingSpaces)
                        }
                        inputs[i + 1].selectionStart = inputs[i + 1].selectionEnd = 10000
                    } else {
                        currScrollIndex++
                    }
                    loadLines(currScrollIndex)
                    event.preventDefault()
                } else if (event.key == "ArrowDown") {
                    if (inputs[i + 1]) {
                        inputs[i + 1].focus()
                        inputs[i + 1].selectionStart = inputs[i + 1].selectionEnd = 10000
                    } else {
                        currScrollIndex++
                        loadLines(currScrollIndex)
                    }
                    event.preventDefault()
                }
                if (event.ctrlKey && event.key.toLowerCase() == "s") {
                    save()
                    event.preventDefault()
                }
                if (event.key == "Escape" || (event.ctrlKey && event.key == "c")) {
                    resolve()
                }
                lines[i + currScrollIndex] = input.value
            }
        }
    })
}, {
    description: "edit a file of the current directory",
    args: {
        "file": "the file to open",
        "?w:n:10~100": "the width of the window",
        "?h:n:10~100": "the height of the window"
    },
    standardVals: {
        "w": 64,
        "h": 16
    }
})

terminal.addCommand("touch", function(args) {
    if (!terminal.isValidFileName(args.filename))
        throw new Error("Invalid filename")
    if (terminal.fileExists(args.filename))
        throw new Error("File already exists")
    let newFile = new FileElement(FileType.READABLE, "")
    terminal.currFolder.content[args.filename] = newFile
}, {
    description: "create a file in the current directory",
    args: {
        "filename": "the name of the file"
    }
})

terminal.addCommand("lsusb", function() {
    terminal.printLine(`i'm a website. Where are the USB ports supposed to be?`)
}, {
    description: "list all usb devices"
})

terminal.addCommand("exit", function() {
    terminal.printLine(`please don't exit. please.`)
}, {
    description: "exit the terminal"
})

terminal.addCommand("color-test", function() {
    let size = {x: 68, y: 31}
    for (let i = 0; i < size.y; i++) {
        for (let j = 0; j < size.x; j++) {
            let x = (j / size.x - 0.5) * 2
            let y = (i / size.y - 0.5) * 2
            if (x*x + y*y > 1) {
                terminal.print(" ")
            } else {
                let angle = Math.atan2(y, x) / Math.PI * 180
                let hue = Math.round(angle)
                let lightness = Math.round(90 - (x*x + y*y) * 90)
                let color = `hsl(${hue}, 100%, ${lightness}%)`
                terminal.print("#", color)
            }
        }
        terminal.printLine()
    }
}, {description: "test the color capabilities of the terminal"})

addAlias("tree", "ls -r")

terminal.addCommand("style", async function(args) {
    class Preset {  

        constructor(b=undefined, f=undefined, c1="yellow", c2="rgb(139, 195, 74)", btn=null) {
            this.background = b
            this.foreground = f
            this.accentColor1 = c1
            this.accentColor2 = c2
            this.btnColor = btn || b || "black"
        }

    }

    let PRESETS = {}
    PRESETS["normal"] = new Preset("rgb(3,3,6)", "white")
    PRESETS["ha©k€r"] = new Preset("black", "#4aff36", "#20C20E", "#20C20E")
    PRESETS["light"] = new Preset("#255957", "#EEEBD3")
    PRESETS["fire"] = new Preset("linear-gradient(180deg, red, yellow)", "white")
    PRESETS["phebe"] = new Preset("linear-gradient(to right, red,orange,yellow,lightgreen,blue,indigo,violet)", "white")
    PRESETS["purple"] = new Preset("#371E30", "#F59CA9", "#DF57BC", "#F6828C")
    PRESETS["slate"] = new Preset("#282828", "#ebdbb2", "#d79921", "#98971a")
    PRESETS["red"] = new Preset("#e74645", "white", "#fdfa66", "#fdfa66", "#e74645")
    PRESETS["cold"] = new Preset("#3c2a4d", "#e0f0ea", "#95adbe", "#95adbe")

    if (args.preset == undefined) {
        terminal.printLine("There are a few presets to choose from:")
        let lineWidth = 0
        for (let presetName of Object.keys(PRESETS)) {
            lineWidth += (presetName + " ").length
            terminal.printCommand(presetName + " ", `style ${presetName}`, Color.WHITE, false)
            if (lineWidth > 35) {
                terminal.printLine()
                lineWidth = 0
            }
        }
        terminal.printLine()
        return
    }
    if (!(args.preset in PRESETS))
        throw new Error(`Unknown preset "${args.preset}"`)
    let attributes = ["background", "foreground", "accentColor1", "accentColor2", "btnColor"]
    let preset = PRESETS[args.preset]
    for (let attribute of attributes) {
        if (preset[attribute] == undefined)
            continue
        terminal[attribute] = preset[attribute]
    }
}, {
    description: "change the style of the terminal",
    args: ["?preset"],
    standardVals: {
        preset: undefined
    }
})

terminal.addCommand("rate", function(args) {
    let languageEvaluations = {
        "py": "it's got everything: explicity, typing, great syntax, just speed is lacking",
        "python2": "who really uses python2 nowadays? just update to python3",
        "java": "not too fond of strict object oriented programming, but it's quite beginner friendly",
        "ruby": "let me introduce: a worse python",
        "html": "is this really supposed to be a programming language?",
        "css": "secretely a big fan but don't tell anyone",
        "js": "this one is just a mix of everything. it aged like milk",
        "javascript": "this one is just a mix of everything. it aged like milk",
        "jsx": "this one is just a mix of everything. it aged like milk",
        "php": "i hate myself for using this one",
        "lua": "i wish i could use lua more often - it's actually quite awesome",
        "go": "liked the 8 hour long tutorial but have yet to use it",
        "c": "i really want to hate it but its simplictiy and speed is just awesome",
        "c++": "use this instead of c when you want complexity",
        "c#": "java but better syntax - love it",
        "kotlin": "c# but not from microsoft lol",
        "swift": "what is this language? i don't know",
        "rust": "c but 2020 version. A person that doesn't love rust hasn't used rust",
        "hs": "functional programming requires so much brain power.\nyou automatically feel smarter when using it.\nLOVE IT!!",
    }
    
    languageEvaluations["python"] = languageEvaluations["py"]
    languageEvaluations["python3"] = languageEvaluations["py"]
    languageEvaluations["javascript"] = languageEvaluations["js"]
    languageEvaluations["jsx"] = languageEvaluations["js"]
    languageEvaluations["csharp"] = languageEvaluations["c#"]
    languageEvaluations["cpp"] = languageEvaluations["c++"]
    languageEvaluations["haskell"] = languageEvaluations["hs"]

    if (languageEvaluations[args.language]) {
        terminal.printLine(languageEvaluations[args.language])
    } else {
        terminal.printLine("i don't know that one")
    }
}, {
    description: "rate a programming language",
    args: ["language"]
})

addAlias("github", "run home/github.exe")

terminal.addCommand("clear", async function() {
    window.location.reload()
    await sleep(3000)
    throw new Error("did reloading fail?")
}, {
    description: "clear the terminal"
})

{
    async function funnyPrint(msg) {
        let colors = msg.split("").map(Color.niceRandom)
        for (let i = 0; i < msg.length; i++) {
            terminal.print(msg[i], colors[i])
            await sleep(100)
        }
        terminal.addLineBreak()
    }

    terminal.addCommand("sudo", async function() {
        let password = await terminal.prompt("[sudo] password: ", true)
        
        if (password.length < 8)
            throw new Error("Password too short")
        if (password.length > 8)
            throw new Error("Password too long")
        if (password.match(/[A-Z]/))
            throw new Error("Password must not contain uppercase letters")
        if (password.match(/[a-z]/))
            throw new Error("Password must not contain lowercase letters")
        if (password.match(/[0-9]/))
            throw new Error("Password must not contain numbers")
        if (password.match(/[^a-zA-Z0-9]/))
            throw new Error("Password must not contain special characters")

        throw new Error("Password must not be a password")
    }, {
        description: "try to use sudo",
        args: ["**"]
    })

    terminal.addCommand("hi", async () => await funnyPrint("hello there!"), {description: "say hello to the terminal"})

}

terminal.addCommand("f", function(args) {
    const customFriendScores = {
        "julius": 10.00,
        "julius16": 10.00,
        "klschlitzohr": 10.00,
        "thejana": 10.00,
        "fl0ris": 10.00,
        "floris": 10.00,
        "phebe": 10.00,
        "justus": 10.00,
        "erik": 9.80,
        "zoe": 10.00,
        "imprinzessa": 9.999
    }
    
    function randomFriendScore(friendName) {
        function cyrb128(str) {
            let h1 = 1779033703, h2 = 3144134277,
                h3 = 1013904242, h4 = 2773480762;
            for (let i = 0, k; i < str.length; i++) {
                k = str.charCodeAt(i);
                h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
                h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
                h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
                h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
            }
            h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
            h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
            h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
            h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
            return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
        }
        function mulberry32(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }
        return Math.round((mulberry32(cyrb128(friendName)[0])() * 8 + 2) * 100) / 100
    }

    let friendName = args.friend.toLowerCase()
    let friendScore = randomFriendScore(friendName)

    if (friendName in customFriendScores) friendScore = customFriendScores[friendName]

    terminal.printf`Friendship-Score with ${{[Color.ORANGE]: args.friend}}: ${{[Color.COLOR_1]: String(friendScore) + "/10"}}\n`
}, {
    description: "calculate friendship score with a friend",
    args: ["friend"]
})

terminal.addCommand("brainfuck", function(args) {
    const codeLib = {
        "test": "++++[>++++<-]>[>++++<-]",
        "helloworld": "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.",
    }

    class BrainFuckInterpreter {

        constructor(outFunc, inFunc) {
            this.outFunc = outFunc
            this.inFunc = inFunc
            this.instructionLimit = 1000000
        }

        interpret(code) {
            let memory = [0]
            let currPtr = 0
            let instructionCount = 0
            const val = () => memory[currPtr]
            let bracketsStack = Array()
            const syntaxFuncs = {
                "+": function() {
                    memory[currPtr]++
                    if (val() > 127)
                        memory[currPtr] = -128
                },
                "-": function() {
                    memory[currPtr]--
                    if (val() < -128)
                        memory[currPtr] = 127
                },
                ".": function() {
                    let char = String.fromCharCode(val())
                    if (char == "\n") {
                        terminal.addLineBreak()
                        return
                    }
                    this.outFunc(String.fromCharCode(val()))
                }.bind(this),
                ">": function() {
                    currPtr++
                    if (memory.length - 1 < currPtr) memory.push(0)
                },
                "<": () => currPtr = Math.max(0, currPtr - 1),
                "[": function(i, setI, jumpToLoopEnd) {
                    if (val() == 0) {
                        jumpToLoopEnd()
                    } else {
                        bracketsStack.push(i)
                    }
                },
                "]": function(i, setI) {
                    if (val() == 0) {
                        bracketsStack.pop()
                    } else {
                        setI(bracketsStack[bracketsStack.length - 1])
                    }
                }
            }
            
            for (let i = 0; i < code.length; i++) {
                let char = code[i]
                if (!Object.keys(syntaxFuncs).includes(char))
                    continue
                syntaxFuncs[char](i, newI => i = newI, function() {
                    let c = 1
                    while (c > 0 && i < code.length) {
                        if (code[i] == "[")
                            c++
                        if (code[i] == "]")
                            c--
                        i++
                    }
                })
                instructionCount++
                if (instructionCount > this.instructionLimit) {
                    this.outFunc(`Reached instruction-limit of ${this.instructionLimit}! Aborting...`)
                    break
                }
            }

            return memory
        }

    }

    let outputtedSomething = false

    let interpreter = new BrainFuckInterpreter(
        function(msg) {
            terminal.printf`${{[Color.rgb(38, 255, 38)]: msg}}`
            outputtedSomething = true
        }
    )

    let code = args.code
    if (Object.keys(codeLib).includes(code.toLowerCase())) {
        code = codeLib[code.toLowerCase()]
    }

    terminal.printLine("")
    let memoryResult = interpreter.interpret(code)

    function printMemory(memory) {
        let indexWidth = String(memory.length - 1).length
        let valueWidth = Math.max(String(Math.min(...memory)).length, String(Math.max(...memory)).length)
        let lineSep = `+-${stringMul("-", indexWidth)}-+-${stringMul("-", valueWidth)}-+`
        terminal.printLine(lineSep)
        for (let i = 0; i < memory.length; i++) {
            let indexStr = stringPad(String(i), indexWidth)
            let valueStr = stringPad(String(memory[i]), valueWidth)
            terminal.printf`| ${{[Color.COLOR_1]: indexStr}} | ${{[Color.WHITE]: valueStr}} |\n`
            terminal.printLine(lineSep)
        }
    }

    if (outputtedSomething) {
        terminal.printLine("")
        terminal.printLine("")
    } else {
        terminal.printf`Memory:\n`
    }
    printMemory(memoryResult)
}, {
    description: "parse given brainfuck code",
    args: ["*code"]
})

addAlias("bf", "brainfuck")

terminal.addCommand("alias", function(args) {
    let alias = args.alias, command = args.command

    if (terminal.functions.map(f => f.name.toLowerCase()).includes(alias.toLowerCase())) {
        throw new Error("Command/Alias already exists!")
    }
    if (!String(alias).match(/^[a-zA-Z][-\_0-9a-zA-Z]*$/) || alias.length > 20) {
        throw new Error("Invalid alias!")
    }

    addAlias(alias, command)
}, {
    description: "create a new alias for a given function",
    args: {
        alias: "name of the new alias",
        command: "name of the command to be aliased"
    }
})

terminal.addCommand("lscmds", async function(args) {
    let functions = [...terminal.visibleFunctions]
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.name.length - b.name.length)
    if (args.md) {
        functions.sort((a, b) => a.name.localeCompare(b.name))
        let maxFuncLength = terminal.visibleFunctions.reduce((p, c) => Math.max(p, c.name.length), 0)
        const allDescriptions = functions.map(f => f.description ? f.description : "undefined")
        let maxDescLength = allDescriptions.reduce((p, c) => Math.max(p, c.length), 0)
        let text = ""
        for (let i = 0; i < functions.length; i++) {
            let func = functions[i]
            let description = allDescriptions[i]
            let funcPart = stringPadBack("\`" + func.name + "\`", maxFuncLength + 2)
            let descpart = stringPadBack(description, maxDescLength)
            text += `| ${funcPart} | ${descpart} |\n` 
        }
        terminal.printLine(text)
        await navigator.clipboard.writeText(text)
        terminal.printLine("Copied to Clipboard ✓")
        return
    }

    function createTableData(columns) {
        let columnHeight = Math.ceil(functions.length / columns)
        let tableData = Array.from({length: columnHeight}, () => Array.from({length: columns}, () => ""))
        let columnIndex = 0
        let functionIndex = 0
        while (true) {
            let func = functions[functionIndex]
            if (!func) break
            tableData[functionIndex % columnHeight][columnIndex] = func.name
            if (functionIndex % columnHeight == columnHeight - 1) columnIndex++
            functionIndex++
        }
        return tableData
    }

    function printTable(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => c === undefined ? 0 : c.length)))
        }

        for (let row of tableData) {
            for (let i = 0; i < row.length; i++) {
                let cell = row[i]
                let width = columnWidths[i]
                terminal.printCommand(stringPadBack(cell, width + 2), cell, Color.WHITE, false)
            }
            terminal.addLineBreak()
        }
    }

    function calculateTableWidth(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => c === undefined ? 0 : c.length)))
        }

        return columnWidths.reduce((p, c) => p + c + 2, 0)
    }

    for (let tableWidth = 20; tableWidth >= 1; tableWidth--) {
        let tableData = createTableData(tableWidth)

        let width = calculateTableWidth(tableData)

        if (width <= 70 || tableWidth == 1) {
            printTable(tableData)
            break
        }
    }

    terminal.addLineBreak()
    terminal.printLine(`- in total, ${terminal.functions.length} commands have been implemented`)
    terminal.print("- use ")
    terminal.printCommand("man", "man", Color.WHITE, false)
    terminal.printLine(" <cmd> to get more information about a command")
    terminal.print("- use ")
    terminal.printCommand("whatis *", "whatis *", Color.WHITE, false)
    terminal.printLine(" to see all commands including their description")

}, {
    description: "list all available commands",
    helpVisible: true,
    args: {
        "?md": "format output as markdown table"
    }
})

terminal.addCommand("shutdown", async function() {
    terminal.printf`Preparing Shutdown`
    for (let i = 0; i < 10; i++) {
        terminal.print(".")
        await sleep(300)
    }
    terminal.printLine()
    await terminal.animatePrint("Initiating Shutdown Process......")
    for (let i = 10; i > 0; i--) {
        terminal.print(i, Color.COLOR_1)
        terminal.printLine(" Seconds left")
        await sleep(1000)
    }
    await sleep(1000)
    await terminal.animatePrint("...?")
    await sleep(1000)
    await terminal.animatePrint("Why didn't anything happen?")
    await sleep(1000)
    await terminal.animatePrint("I guess this is just a website.")
    await sleep(1000)
    await terminal.animatePrint("Let's just not shutdown. Have a good day!")
}, {
    description: "shutdown the terminal"
})

terminal.addCommand("reboot", () => window.location.reload(), {
    description: "reboot the website"
})

terminal.addCommand("reset", async function() {
    async function animatedDo(action) {
        return new Promise(async resolve => {
            terminal.print(action)
            for (let i = 0; i < 6; i++) {
                await sleep(200)
                terminal.print(".")
            }
            await sleep(500)
            terminal.printf`${{[Color.COLOR_1]: "done"}}\n`
            resolve()
        })
    }
    return new Promise(async () => {
        await animatedDo("resetting")
        localStorage.removeItem("terminal-autosave")
        setTimeout(() => window.location.reload(), 500)
    })
}, {
    description: "reset the terminal"
})

async function fileFromUpload(fileType=null) {
    return new Promise(async (resolve, reject) => {
        let input = document.createElement("input")
        input.setAttribute("type", "file")
        if (fileType)
            input.setAttribute("accept", fileType)
        input.click()

        input.onchange = function(event) {
            if (!input.value.length) {
                reject()
                return
            }
            let fileReader = new FileReader()
            let fileName = input.files[0].name
            let readAsDataURL = (
                fileName.endsWith(".jpg")
                || fileName.endsWith(".png")
                || fileName.endsWith(".jpeg")
                || fileName.endsWith(".svg")
                || fileName.endsWith(".bmp")
                || fileName.endsWith(".gif")
            )
            fileReader.onload = function(event) {
                resolve([fileName, event.target.result, readAsDataURL])
            }
            if (readAsDataURL) {
                fileReader.readAsDataURL(input.files[0])
            } else {
                fileReader.readAsText(input.files[0])
            }
        }

        document.body.onfocus = () => {if (!input.value.length) reject()}  
    })
}

async function getMP3FromUpload() {
    return new Promise(async (resolve, reject) => {
        let input = document.createElement("input")
        input.setAttribute("type", "file")
        input.setAttribute("accept", "audio/mpeg3")
        input.click()

        input.onchange = function(event) {
            if (!input.value.length) {
                reject()
                return
            }
            let fileReader = new FileReader()
            fileReader.onload = function(event) {
                let audio = document.createElement("audio")
                audio.src = event.target.result
                resolve(audio)
            }
            fileReader.readAsDataURL(input.files[0])
        }

        document.body.onfocus = () => {if (!input.value.length) reject()}  
    })
}


async function getImageFromUpload() {
    return new Promise(async (resolve, reject) => {
        let input = document.createElement("input")
        input.setAttribute("type", "file")
        input.setAttribute("accept", "image/*")
        input.click()

        input.onchange = function(event) {
            if (!input.value.length) {
                reject()
                return
            }
            let fileReader = new FileReader()
            fileReader.onload = function(event) {
                let image = document.createElement("img")
                image.onload = function() {
                    resolve(image)
                }
                image.src = event.target.result
            }
            fileReader.readAsDataURL(input.files[0])
        }

        document.body.onfocus = () => {if (!input.value.length) reject()}
    })
}

terminal.addCommand("password", async function(args) {
    function generatePassword(length, characters, repeatChars) {
        let password = String()
        let tries = 0
        const maxTries = 10000
        while (password.length < length) {
            tries++
            if (tries > maxTries) {
                terminal.printf`${{[Color.RED]: "Error"}}: Impossible Config?\n`
                return password
            }
            let char = characters[Math.floor(Math.random() * characters.length)]
            if (password.length > 0 && repeatChars) {
                let lastChar = password[password.length - 1]
                if (char == lastChar)
                    continue
            }
            password += char
        }
        return password
    }
    for (let i = 0; i < args.n; i++) {
        let password = generatePassword(args.l, args.c, args.norepeat)
        if (password.length == args.l)
            terminal.printf`${{[Color.COLOR_1]: password}}\n`
        else
            break
        if (i == 0 && args.n == 1) {
            await sleep(100)
            await navigator.clipboard.writeText(password)
            terminal.printLine("Copied to Clipboard ✓")
        }
    }
}, {
    description: "Generate a random password",
    args: {
        "?l:n:1~1000": "The length of the password",
        "?c": "The characters to use in the password",
        "?norepeat": "If present, the password will not repeat characters",
        "?n:n:1~100": "Number of passwords to generate"
    },
    standardVals: {
        l: 20,
        c: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&",
        n: 1,
        norepeat: false
    }
})

terminal.addCommand("img2ascii", async function() {
    return new Promise(async resolve => {

        try {
            var image = await getImageFromUpload()
        } catch {
            terminal.printError("Image Upload Failed")
            resolve()
            return
        }

        let outputSize = {x: 60, y: undefined}
        outputSize.y = parseInt(outputSize.x * (image.height / image.width) * 0.6)

        let asciiChars = " .:-=+*#%@"

        let tempCanvas = document.createElement("canvas")
        tempCanvas.style.display = "none"
        document.body.appendChild(tempCanvas)
        tempCanvas.width = image.width
        tempCanvas.height = image.height

        let context = tempCanvas.getContext("2d")
        context.drawImage(image, 0, 0)

        let imageData = context.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

        let xStep = parseInt(tempCanvas.width / outputSize.x)
        let yStep = parseInt(tempCanvas.height / outputSize.y)
        
        function getAverageColor(blockX, blockY) {
            let colorSum = 0
            let colorCount = 0
            let i = blockY * yStep * tempCanvas.width * 4 + blockX * 4 * xStep
            for (let y = 0; y < yStep; y++) {
                for (let x = 0; x < xStep; x++) {
                    colorSum += imageData.data[i + 0]
                    colorSum += imageData.data[i + 1]
                    colorSum += imageData.data[i + 2]
                    colorCount += 3
                    i += 4
                }
                i += tempCanvas.width * 4 - xStep * 4
            }
            return colorSum / colorCount
        }

        terminal.printLine()
        for (let i = 0; i < outputSize.y; i++) {
            for (let j = 0; j < outputSize.x; j++) {
                let averageColor = getAverageColor(j, i)
                let char = asciiChars[parseInt((asciiChars.length - 1) * (averageColor / 255))]
                terminal.print(char)
            }
            terminal.printLine()
        }

        resolve()
    })
}, {
    description: "Convert an image to ASCII art"
})

function newMathEnv() {
    let jsEnv = new JsEnvironment()
    jsEnv.setValue("sin", Math.sin)
    jsEnv.setValue("cos", Math.cos)
    jsEnv.setValue("tan", Math.tan)
    jsEnv.setValue("asin", Math.asin)
    jsEnv.setValue("acos", Math.acos)
    jsEnv.setValue("atan", Math.atan)
    jsEnv.setValue("atan2", Math.atan2)
    jsEnv.setValue("sinh", Math.sinh)
    jsEnv.setValue("cosh", Math.cosh)
    jsEnv.setValue("tanh", Math.tanh)
    jsEnv.setValue("asinh", Math.asinh)
    jsEnv.setValue("acosh", Math.acosh)
    jsEnv.setValue("atanh", Math.atanh)
    jsEnv.setValue("exp", Math.exp)
    jsEnv.setValue("log", Math.log)
    jsEnv.setValue("log10", Math.log10)
    jsEnv.setValue("sqrt", Math.sqrt)
    jsEnv.setValue("abs", Math.abs)
    jsEnv.setValue("ceil", Math.ceil)
    jsEnv.setValue("floor", Math.floor)
    jsEnv.setValue("round", Math.round)
    jsEnv.setValue("PI", Math.PI)
    jsEnv.setValue("e", Math.E)
    jsEnv.setValue("E", Math.E)
    jsEnv.setValue("LN2", Math.LN2)
    jsEnv.setValue("LN10", Math.LN10)
    jsEnv.setValue("LOG2E", Math.LOG2E)
    jsEnv.setValue("LOG10E", Math.LOG10E)
    jsEnv.setValue("SQRT1_2", Math.SQRT1_2)
    jsEnv.setValue("SQRT2", Math.SQRT2)
    return jsEnv
}

const sin = Math.sin, cos = Math.cos, tan = Math.tan, sqrt = Math.sqrt, 
      e = Math.E, pi = Math.PI, exp = Math.exp, abs = Math.abs

terminal.addCommand("solve", async function(args) {
    let equation = args.equation
    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+=[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(equation)) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid equation!\n`
        terminal.printf`An valid equation could be: ${{[Color.COLOR_1]: "2x+4=5"}}\n`
        return
    }
    while (/[0-9]x/g.test(equation)) equation = equation.replace(/([0-9])x/g, "$1*x")
    while (/[0-9a-z]\s*\^\s*[0-9a-z]/g.test(equation)) equation = equation.replace(/([0-9a-z])\s*\^\s*([0-9a-z])/g, "$1**$2")
    let [left, right] = equation.split("=")
    let iterations = args.i
    let iterationCount = 0
    let maxIterations = args.m
    let lowerBound = args.l
    let upperBound = args.u
    try {
        var [LHS, RHS] = [Function("x", `return ${left}`), Function("x", `return ${right}`)]
    } catch {
        throw new Error("Invalid equation!")
    }
    function findSolution(minX, maxX, resolution, depth) {
        let diff = maxX - minX
        let stepSize = diff / resolution
        let lastState = LHS(minX) > RHS(maxX)
        let solutions = Array()
        for (let x = minX; x <= maxX; x += stepSize) {
            iterationCount++
            if (iterationCount > maxIterations)
                return solutions
            let currState = LHS(x) > RHS(x)
            if (currState != lastState) {
                if (depth === 1) {
                    solutions.push(x)
                } else {
                    solutions = solutions.concat(findSolution(
                        x - stepSize,
                        x + stepSize,
                        resolution,
                        depth - 1
                    ))
                }
            }
            lastState = currState
        }
        return solutions
    }
    
    let solutions = findSolution(lowerBound, upperBound, Math.round((upperBound - lowerBound) * 10), iterations)
    let roundFactor = 10 ** 3
    let shownSolutions = Array()
    let solutionCount = 0
    for (let i = 0; i < solutions.length; i++) {
        let solution = String(Math.round(solutions[i] * roundFactor) / roundFactor)
        if (shownSolutions.includes(solution)) continue
        solutionCount++
        let xName = `x${solutionCount}`
        terminal.printf`${{[Color.COLOR_1]: xName}} = ${{[Color.LIGHT_GREEN]: solution}}\n`
        shownSolutions.push(solution)
    }
    if (solutions.length == 0) {
        terminal.printf`${{[Color.RED]: "Error"}}: No solution found!\n`
    }
    if (iterationCount >= maxIterations) {
        terminal.printf`${{[Color.RED]: "Error"}}: Too many Iterations!\n`
    }
}, {
    description: "solve a mathematical equation for x",
    args: {
        "*equation": "the equation to solve",
        "?i:n:1~5": "the number of iteration-steps to perform",
        "?m:n:1~100000": "the maximum number of total iterations to perform",
        "?l:n": "the lower bound of the search interval",
        "?u:n": "the upper bound of the search interval"
    },
    standardVals: {
        i: 4,
        m: 100000,
        l: -100,
        u: 100
    }
})

terminal.addCommand("plot", async function(args) {
    let equation = args.equation
    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(equation)) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid equation!\n`
        terminal.printf`An valid equation could be: ${{[Color.COLOR_1]: "x^2"}}\n`
        return
    }
    let gridSize = {
        x: 67,
        y: 30
    }
    while (/[0-9]x/g.test(equation))
        equation = equation.replace(/([0-9])x/g, "$1*x")
    while (/[0-9a-z\.]+\s*\^\s*[0-9a-z\.]+/g.test(equation))
        equation = equation.replace(/([0-9a-z\.]+)\s*\^\s*([0-9a-z\.]+)/g, "$1**$2")
    let jsEnv = newMathEnv()
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))
    let viewBound = {
        x: {min: args.xmin, max: args.xmax},
        y: {min: args.ymin, max: args.ymax}
    }
    if (viewBound.x.min >= viewBound.x.max || viewBound.y.min >= viewBound.y.max) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid bounds!\n`
        return
    }
    function drawIntoGrid(x, y, v) {
        if (isNaN(x) || isNaN(y)) return
        let gridX = Math.round((x - viewBound.x.min) / (viewBound.x.max - viewBound.x.min) * (gridSize.x - 1))
        let gridY = Math.round((y - viewBound.y.min) / (viewBound.y.max - viewBound.y.min) * (gridSize.y - 1))
        if (gridX < 0 || gridX >= gridSize.x || gridY < 0 || gridY >= gridSize.y) {
            return
        }
        grid[gridSize.y - 1 - gridY][gridX] = v
    }
    async function drawGrid() {
        for (let y = 0; y < gridSize.y; y++) {
            for (let x = 0; x < gridSize.x; x++) {
                let color = Color.WHITE
                switch(grid[y][x]) {
                    case ".":
                        color = Color.rgb(100, 100, 100)
                        break
                    case "/":
                    case "#":
                    case "\\":
                    case "]":
                    case "[":
                        color = Color.COLOR_1
                }
                terminal.print(grid[y][x], color)
            }
            terminal.printLine()
        }
    }
    for (let y = viewBound.y.min; y <= viewBound.y.max; y += (viewBound.y.max - viewBound.y.min) / (gridSize.y - 1)) {
        drawIntoGrid(0, y, "|")
    }
    for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1)) {
        drawIntoGrid(x, 0, "~")
    }
    for (let x = ~~(viewBound.x.min); x < viewBound.x.max; x++) {
        let axisVal = (String(x).length > 1) ? String(x).slice(-1) : String(x)
        for (let y = viewBound.y.min; y <= viewBound.y.max; y += (viewBound.y.max - viewBound.y.min) / (gridSize.y - 1)) {
            if (x == 0) break
            drawIntoGrid(x, y, ".")
        }
        drawIntoGrid(x, 0, axisVal)
    }
    for (let y = ~~(viewBound.y.min); y < viewBound.y.max; y++) {
        let axisVal = (String(y).length > 1) ? String(y).slice(-1) : String(y)
        for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1)) {
            if (y == 0) break
            drawIntoGrid(x, y, ".")
        }
        drawIntoGrid(0, y, axisVal)
    }
    drawIntoGrid(0, 0, "+")

    let f = new Function("x", "return " + equation)
    function slope(f, x, accuracy=0.01) {
        let minY = f(x - accuracy)
        let maxY = f(x + accuracy)
        let diff = maxY - minY
        return diff / (accuracy * 2)
    }
    const symbols = [
        ["]", 10],
        ["/", 1.5],
        ["#", -1.5],
        ["\\", -10],
        ["[", -Infinity],
    ]
    let yValues = []
    for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1) / 5) {
        jsEnv.setValue("x", x)
        let [y, error] = jsEnv.eval(equation)
        if (error) {
            throw new Error(error)
        } else {
            let printSymbol = null
            let slopeVal = slope(f, x)
            for (let [symbol, minVal] of symbols) {
                if (slopeVal > minVal) {
                    printSymbol = symbol
                    break
                }
            }
            if (!isNaN(y))
                yValues.push(y)
            if (printSymbol != null)
                drawIntoGrid(x, y, printSymbol)
        }
    }
    await drawGrid()
    terminal.scroll()
    let playTime = args.playtime * 2
    function calcFrequency(y) {
        let maxFreq = 1000
        let minFreq = 200
        let yDiffBound = viewBound.y.max - viewBound.y.min
        let yDiffMin = y - viewBound.y.min
        let freqDiff = maxFreq - minFreq
        let freq = freqDiff * (yDiffMin / yDiffBound)
        return freq
    }
    let frequencies = []
    for (let y of yValues) {
        let frequency = calcFrequency(y)
        frequency = Math.max(50, frequency)
        frequency = Math.min(20000, frequency)
        frequencies.push(frequency)
    }
    let noteTime = playTime / frequencies.length
    for (let note of frequencies) {
        playFrequency(note, noteTime)
        await sleep(noteTime * 0.5)
    }
}, {
    description: "plot a mathematical function within bounds",
    args: {
        "equation": "the equation to plot",
        "?xmin:n:-1000~1000": "the minimum x value",
        "?xmax:n:-1000~1000": "the maximum x value",
        "?ymin:n:-1000~1000": "the minimum y value",
        "?ymax:n:-1000~1000": "the maximum y value",
        "?playtime:n:0~10000": "the time to play the sound for in milliseconds"
    },
    standardVals: {
        xmin: -3, xmax: 3.1,
        ymin: -3, ymax: 3.1,
        playtime: 2500
    }
})

const OG_BACKGROUND_COLOR = "rgb(3, 3, 6)"
terminal.addCommand("background", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.background = OG_BACKGROUND_COLOR
        return
    }
    terminal.background = args.color
}, {
    description: "change the background color of the terminal",
    args: ["color"]
})

const OG_FOREGROUND_COLOR = "rgb(255, 255, 255)"
terminal.addCommand("foreground", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.foreground = OG_FOREGROUND_COLOR
        return
    }
    terminal.foreground = args.color
}, {
    description: "change the foreground color of the terminal",
    args: ["color"]
})

terminal.addCommand("whatday", function(args) {

    function dayToStr(n) {
        return [
            "first", "second", "third", "fourth",
            "fifth", "sixth", "seventh", "eigth",
            "ninth", "tenth", "eleventh", "twelfth",
            "thirteenth", "fourteenth", "fifteenth",
            "sixteenth", "seventeenth", "eighteenth",
            "nineteenth", "twentyth", "twentyfirst",
            "twentysecond", "twentythird", "twentyfourth",
            "twentyfifth", "twentysixth", "twentyseventh",
            "twentyeighth", "twentyninth", "thirtieth",
            "thirtyfirst"
        ][n - 1]
    }

    function yearToStr(n) {
        if (n == 0) return "zero"
        let out = ""
        if (n < 0) {
            out += "minus "
            n *= -1
        }
        function twoDigitNumStr(n) {
            const n1s = [
                "", "one", "two", "three", "four", "five",
                "six", "seven", "eight", "nine", "ten",
                "eleven", "twelve", "thirteen", "fourteen",
                "fifteen"
            ], n2s = [
                "", "", "twenty", "thirty", "fourty",
                "fifty", "sixty", "seventy", "eighty",
                "ninety"
            ]
            if (n1s[n]) return n1s[n]
            let n1 = n % 10
            let n2 = parseInt((n - n1) / 10)
            let out = ""
            out += n2s[n2]
            out += n1s[n1]
            if (n2 == 1) {
                out += "teen"
            }
            return out
        }
        if (String(n).length == 1) {
            return out + twoDigitNumStr(n)
        }
        if (String(n).length == 2) {
            return out + twoDigitNumStr(n)
        }
        if (String(n).length == 3) {
            let n1 = String(n)[0]
            let n2 = String(n).slice(1, 3)
            return out + twoDigitNumStr(n1) + "hundred" + twoDigitNumStr(n2)
        }
        if (String(n).length == 4) {
            let n1 = String(n).slice(0, 2)
            let n2 = String(n).slice(2, 4)
            return out + twoDigitNumStr(n1) + "-" + twoDigitNumStr(n2)
        } 
    }

    const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ], monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ]

    let dateStr = args["DD.MM.YYYY"]

    function dateEq(d1, d2) {
        return (d1.getFullYear() == d2.getFullYear()
        && d1.getMonth() == d2.getMonth()
        && d1.getDate() == d2.getDate())
    }

    function sayDay(date) {
        let day = dayToStr(date.getDate())
        let month = monthNames[date.getMonth()].toLowerCase()
        let year = yearToStr(date.getFullYear())
        let dayName = dayNames[date.getDay()].toLowerCase()
        if (dateEq(new Date(), date)) {
            terminal.printLine(`today is a ${dayName}`)
        } else {
            if (new Date() > date) {
                terminal.printLine(`the ${day} of ${month} of the year ${year} was a ${dayName}`)
            } else {
                terminal.printLine(`the ${day} of ${month} of the year ${year} will be a ${dayName}`)
            }
        }
    }

    if (dateStr.toLowerCase() == "t" || dateStr.toLowerCase() == "today") {
        sayDay(new Date())
        return
    } else if (/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,4}$/.test(dateStr)) {
        let [d, m, y] = dateStr.split(".").map(i => parseInt(i))
        let date = new Date()
        date.setFullYear(y, m - 1, d)
        if (date.getDate() != d || (date.getMonth() + 1) != m || date.getFullYear() != y) {
            throw new Error("Invalid day - doesn't exist.")
        }
        sayDay(date)
    } else {
        terminal.printLine("Date-Format: DD:MM:YYYY, e.g. 01.01.1970")
        throw new Error(`Invalid date: ${dateStr}`)
    }
    
}, {
    description: "get the weekday of a date",
    args: ["DD.MM.YYYY"]
})

terminal.addCommand("cal", async function(args) {
    const today = new Date()

    const monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ]

    function printMonth(monthIndex, year) {
        let tableData = Array.from(Array(6)).map(() => Array(7).fill("  "))
        let tableHeader = "Su Mo Tu We Th Fr Sa"
        let date = new Date()
        date.setFullYear(year, monthIndex, 1)
        let month = monthNames[date.getMonth()]
        let dayOfMonth = (new Date()).getDate()

        function printTable() {
            let headerText = `${month} ${stringPad(year, 4, "0")}`
            let paddingWidth = Math.floor((tableHeader.length - headerText.length) / 2)
            for (let i = 0; i < paddingWidth; i++) {
                headerText = " " + headerText
            }
            terminal.printf`${{[Color.COLOR_1]: headerText}}\n`
            terminal.printLine(tableHeader)
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 7; x++) {
                    if (dayOfMonth == parseInt(tableData[y][x]) &&
                        today.getMonth() == monthIndex &&
                        today.getFullYear() == year) {
                        terminal.printf`${{[Color.COLOR_1]: tableData[y][x]}} `
                    } else {
                        terminal.print(tableData[y][x] + " ")
                    }
                }
                terminal.printLine()
            }
        }

        let weekIndex = 0
        for (let i = 1;; i++) {
            date.setDate(i)
            if (date.getMonth() != monthNames.indexOf(month)) {
                break
            }
            if (date.getDay() == 0) {
                weekIndex++
            }
            tableData[weekIndex][date.getDay()] = stringPad(String(i), 2)
        }

        printTable()
    }

    let chosenYear = null
    let chosenMonth = null

    argument_loop:
    for (let argument of Object.values(args).filter(i => i != undefined)) {
        for (let month of monthNames) {
            if (month.toLowerCase().startsWith(argument.toLowerCase())) {
                chosenMonth = monthNames.indexOf(month)
                continue argument_loop
            }
        }
        if (/^[0-9]{1,4}$/.test(argument)) {
            chosenYear = parseInt(argument)
        } else if (/^[0-9]{1,2}\.[0-9]{1,4}$/.test(argument)) {
            let [month, year] = argument.split(".")
            chosenMonth = parseInt(month) - 1
            chosenYear = parseInt(year)
        } else if (/^[0-9]{1,4}\.[0-9]{1,2}$/.test(argument)) {
            let [year, month] = argument.split(".")
            chosenMonth = parseInt(month) - 1
            chosenYear = parseInt(year)
        } else {
            throw new Error(`Invalid Month/Year "${argument}"`)
        }
    }

    if (chosenYear < 0) throw new Error("Cannot look past the year 0 - sorry")
    if (chosenYear > 9999) throw new Error("Cannot look past the year 9999 - sorry")
    if (chosenMonth > 11 || chosenMonth < 0)
        throw new Error("That month doesn't exist in this world.")

    if (chosenYear == null && chosenMonth == null) {
        chosenYear = today.getFullYear()
        chosenMonth = today.getMonth()
    }

    if (chosenMonth != null && chosenYear == null) {
        chosenYear = today.getFullYear()
    }

    if (chosenMonth == null) {
        for (let month = 0; month < 12; month++) {
            printMonth(month, chosenYear)
            if (month < 12 - 1) {
                terminal.printLine()
            }
        }
    } else {
        printMonth(chosenMonth, chosenYear)
    }

}, {
    description: "print a calendar",
    args: ["?month", "?year"]
})

terminal.addCommand("bc", async function() {
    while (true) {
        let text = await terminal.prompt()
        let [result, error] = evalJsEnv.eval(text)
        if (error) {
            terminal.printf`${{[Color.rgb(38, 255, 38)]: ">"}} ${{[Color.WHITE]: error}}\n`
        } else if (result !== null) {
            terminal.printf`${{[Color.rgb(38, 255, 38)]: ">"}} ${{[Color.WHITE]: String(result)}}\n`
        }
    }
}, {
    description: "start a bc (basic calculator) session"
})

terminal.addCommand("pwd", function() {
    terminal.printLine("/" + terminal.pathAsStr)
}, {
    description: "print the current working directory"
})

terminal.addCommand("uname", function() {
    terminal.printLine("NOELOS OS 1.0.5")
}, {
    description: "print the operating system name"
})

terminal.addCommand("factor", async function(args) {

    function primeFactors(n) {
        let i = 2
        let factors = []
        while (i * i <= n) {
            if (n % i) {
                i += 1
            } else {
                n = parseInt(n / i)
                factors.push(i)
            }
        }
        if (n > 1) {
            factors.push(n)
        }
        return factors
    }

    function printFactors(num) {
        let factors = primeFactors(num).join(" ")
        if (factors.length == 0 || isNaN(parseInt(num))) {
            terminal.printLine(`${num}: Invalid number!`)
        } else {
            terminal.print(num + ": ")
            terminal.printLine(factors, Color.COLOR_1)
        }
    }

    if (args.n != undefined) {
        printFactors(args.n)
        return
    }

    terminal.printLine("Type a number to factorize it.")

    while (true) {
        let text = await terminal.prompt()
        for (let word of text.trim().split(" ").map(w => w.trim()).filter(w => w.length > 0)) {
            if (word.length == 0 || isNaN(word)) {
                terminal.printf`${{[Color.WHITE]: word}}: Invalid number!\n`
            } else {
                let num = parseInt(word)
                printFactors(num)
            }
        }
    }
}, {
    description: "print the prime factors of a number",
    args: {
        "?n:n": "number to factorize"
    },
    standardVals: {
        n: undefined
    }
})

class CliApi {

    static urlBase = "api/"

    static async get(name) {
        let url = `${CliApi.urlBase}get.php?key=${encodeURIComponent(name)}`
        return await fetch(url).then(response => response.text())
    }

    static async set(name, value) {
        let url = `${CliApi.urlBase}set.php`
        return await fetch(`${url}?key=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`)
    }

}

const KEY_REGEX = /^[a-zA-Z\_\-][a-zA-Z\_\-0-9\#\~]*$/

terminal.addCommand("get", async function(args) {
    if (!KEY_REGEX.test(args.key)) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid key format!\n`
        return
    }
    let value = await CliApi.get(args.key)
    terminal.printf`${{[Color.LIGHT_GREEN]: ">>>"}} ${{[Color.WHITE]: value}}\n`
}, {
    description: "get a value from the server",
    args: {
        key: "the key to get the value of"
    }
})

terminal.addCommand("set", async function(args) {
    if (!KEY_REGEX.test(args.key)) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid key format!\n`
        return
    }
    if (args.value.length > 255) {
        terminal.printf`${{[Color.RED]: "Error"}}: Value too large!\n`
        return
    }
    await CliApi.set(args.key, args.value)
    terminal.printf`${{[Color.LIGHT_GREEN]: "Success"}}\n`
}, {
    description: "set a value on the server",
    args: {
        key: "the key to set the value of",
        value: "the value to set"
    }
})

terminal.addCommand("head", function(args) {
    let file = terminal.getFile(args.file)
    if (file.content.length == 0)
        throw new Error("File is empty")
    let lines = file.content.split("\n")
    let result = lines.slice(0, args.l).join("\n")
    terminal.printLine(result)
}, {
    description: "display the first lines of a file",
    args: ["file", "?l:n:1~1000"],
    standardVals: {l: 10}
})

terminal.addCommand("whatis", function(args) {
    if (args.command == "*") {
        let maxFuncLength = terminal.visibleFunctions.reduce((p, c) => Math.max(p, c.name.length), 0)
        let functions = [...terminal.visibleFunctions].sort((a, b) => a.name.localeCompare(b.name))
        for (let func of functions) {
            let funcStr = stringPadBack(func.name, maxFuncLength)
            terminal.printCommand(funcStr, func.name, Color.WHITE, false)
            terminal.printLine(`  ${func.description}`)
        }
        return
    }

    if (args.command == "whatis")
        throw new Error("Recursion.")

    let func = terminal.getFunction(args.command)
    if (func == null)
        throw new Error(`command not found: ${args.command}`)

    terminal.printLine(`${func.name}: ${func.description}`)
}, {
    description: "display a short description of a command",
    args: ["command"]
})

const START_TIME = Date.now()

terminal.addCommand("w", function() {
    terminal.printf`USER   TIME_ELAPSED\n`
    terminal.printf`${{[Color.COLOR_1]: "root"}}   ${{[Color.LIGHT_GREEN]: ((Date.now() - START_TIME) / 1000) + "s"}}\n`
}, {
    description: "print the current time elapsed"
})

terminal.addCommand("history", function() {
    for (let i = Math.max(0, terminal.prevCommands.length - 1000); i < terminal.prevCommands.length; i++) {
        terminal.printCommand(stringPad(String(i + 1), 5), `!${i + 1}`, Color.COLOR_1, false)
        terminal.printLine(`  ${terminal.prevCommands[i]}`)
    }
}, "show the last 1000 commands")

{
    terminal.addCommand("!", function(args) {
        let index = args.index - 1
        let command = terminal.prevCommands[index]
        if (command == undefined) {
            terminal.printf`${{[Color.RED]: "Error"}}: Command at index not found!\n`
            return
        }
        terminal.inputLine(command, false, false)
    }, {
        description: "run a command from history",
        args: ["index:n:1~100000"]
    })

    addAlias("runfunc", "!")
}

terminal.addCommand("lscpu", function() {
    terminal.printLine("your computer probably has a cpu!")
}, {
    description: "get some helpful info about your cpu"
})

terminal.addCommand("kill", function(args) {
    if (args.process.toLowerCase() == "turtlo") {
        if (killTurtlo()) {
            terminal.printLine("done.")
        } else {
            terminal.printLine("i see no turtlo alive here")
        }
    } else {
        terminal.printLine("sorry no killing allowed here (except turtlo)")
    }
}, {
    description: "kill a process",
    args: {
        "process": "the process to kill"
    }
})

terminal.addCommand("yes", async function(args) {
    let message = args.message
    let stop = false
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.key.toLowerCase() == "c") {
            stop = true
        }
    })
    while (!stop) {
        let element = terminal.printLine(message)
        element.scrollIntoView()
        await sleep(args.f ? 0 : 100)
    }
    terminal.printLine("^C")
}, {
    description: "print a message repeatedly",
    args: {
        "?message": "the message to print",
        "?f": "fast mode"
    },
    standardVals: {message: "y"}
})

terminal.addCommand("zip", function() {
    terminal.printLine("zip it lock it put it in your pocket")
}, {
    description: "zip a file"
})

terminal.addCommand("reverse", async function(args) {
    let reversed = args.message.split("").reverse().join("")
    terminal.printLine(reversed)
    if (args.c) {
        await navigator.clipboard.writeText(reversed)
        terminal.printLine("Copied to Clipboard ✓", Color.COLOR_1)
    }
}, {
    description: "reverse a message",
    args: {
        "*message": "the message to reverse",
        "?c": "copy the reversed message to the clipboard"
    }
})

terminal.addCommand("sleep", async function(args) {
    await sleep(args.seconds * 1000)
}, {
    description: "sleep for a number of seconds",
    args: ["seconds:n:0~1000000"]
})

const COW_SAY = ` 
\\   ^__^
 \\  (oo)\\_______
    (__)\       )\\/\\
        ||----w |
        ||     ||
`
terminal.addCommand("cowsay", function(args) {
    let message = args.message
    if (message.length == 0) {
        terminal.printf`${{[Color.RED]: "Error"}}: No message provided!\n`
        return
    }
    let output = String()
    output += " " + stringMul("-", message.length + 2) + "\n"
    output += "< " + message + " >\n"
    output += " " + stringMul("-", message.length + 2)
    for (let line of COW_SAY.split("\n")) {
        output += stringMul(" ", Math.min(8, message.length + 4)) + line + "\n"
    }
    terminal.printLine(output.slice(0, -3))
}, {
    description: "let the cow say something",
    args: ["*message"]
})

const COW_THINK = ` 
o   ^__^
 o  (oo)\\_______
    (__)\       )\\/\\
        ||----w |
        ||     ||
`
terminal.addCommand("cowthink", function(args) {
    let message = args.message
    if (message.length == 0) {
        terminal.printf`${{[Color.RED]: "Error"}}: No message provided!\n`
        return
    }
    let output = String()
    output += " " + stringMul("-", message.length + 2) + "\n"
    output += "( " + message + " )\n"
    output += " " + stringMul("-", message.length + 2)
    for (let line of COW_THINK.split("\n")) {
        output += stringMul(" ", Math.min(8, message.length + 4)) + line + "\n"
    }
    terminal.printLine(output.slice(0, -3))
}, {
    description: "let the cow think something",
    args: ["*message"]
})

terminal.addCommand("cmatrix", async function(rawArgs) {
    let [canvas, intervalFunc] = makeCMatrix()
    let stopped = false
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.key.toLowerCase() == "c") {
            clearInterval(intervalFunc)
            canvas.remove()
            stopped = true
        }
    })
    while (!stopped) {
        await sleep(100)
    }
}, {
    description: "show the matrix"
})

terminal.addCommand("download", function(args) {
    function downloadFile(fileName, file) {
        let element = document.createElement('a')
        if (file.type == FileType.DATA_URL)
            var dataURL = file.content
        else
            var dataURL = 'data:text/plain;charset=utf-8,' + encodeURIComponent(file.content)
        element.setAttribute('href', dataURL)
        element.setAttribute('download', fileName)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot download directory")
    downloadFile(file.name, file)
}, {
    description: "download a file",
    args: {"file": "the file to download"}
})

function fetchWithParam(url, params) {
    let query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join("&")
    return fetch(`${url}?${query}`)
}

class TodoApi {

    static GET_LIST_API = "https://www.noel-friedrich.de/todo/api/get-list.php"
    static ADD_ITEM_API = "https://www.noel-friedrich.de/todo/api/add-item.php"
    static EDIT_ITEM_API = "https://www.noel-friedrich.de/todo/api/edit-item.php"
    static DELETE_ITEM_API = "https://www.noel-friedrich.de/todo/api/delete-item.php"
    static CHECK_ITEM_API = "https://www.noel-friedrich.de/todo/api/check-item.php"

    static async getList(owner_name) {
        let response = await fetchWithParam(TodoApi.GET_LIST_API, {
            owner_name: owner_name
        })
        return await response.json()
    }
    
    static async addItem(owner_name, text_content, due_time="-") {
        return await fetchWithParam(TodoApi.ADD_ITEM_API, {
            owner_name: owner_name,
            text_content: text_content,
            due_time: due_time
        })
    }

    static async editItem(id, text_content) {
        return await fetchWithParam(TodoApi.EDIT_ITEM_API, {
            id: id,
            text_content: text_content
        })
    }

    static async deleteItem(id) {
        return await fetchWithParam(TodoApi.DELETE_ITEM_API, {id: id})
    }

    static async checkItem(item_id, checked) {
        return await fetchWithParam(TodoApi.CHECK_ITEM_API, {
            item_id: item_id,
            check_val: checked ? 1 : 0
        })
    }

}

terminal.addCommand("todo", async function(rawArgs) {
    let parsedArgs = parseArgs(rawArgs, false)

    const commands = {
        "list": async function(name) {
            let data = await TodoApi.getList(name)
            let formattedData = []
            for (let rawItem of data) {
                let check = (rawItem.done == 1) ? "[x]" : "[ ]"
                let due = rawItem.due_time == "-" ? "" : ` (${rawItem.due_time})`
                let item = `${rawItem.text_content}${due}`
                let id = `#${rawItem.id}`
                formattedData.push({
                    check: check, item: item, id: id
                })
            }
            if (formattedData.length == 0) {
                terminal.printLine(`No items found`)
            }
            let maxItemLength = formattedData.reduce((max, item) => Math.max(max, item.item.length), 0)
            for (let item of formattedData) {
                terminal.printf`${{[Color.COLOR_1]: item.check}} ${{[Color.WHITE]: stringPadBack(item.item, maxItemLength + 1)}} ${{[Color.WHITE]: item.id}}\n`
            }
        },
        "check": async function(id) {
            await TodoApi.checkItem(id, true)
        },
        "uncheck": async function(id) {
            await TodoApi.checkItem(id, false)
        },
        "add": async function(name, text, due_date="-") {
            await TodoApi.addItem(name, text, due_date)
        },
        "edit": async function(id, text) {
            await TodoApi.editItem(id, text)
        },
        "delete": async function(id) {
            await TodoApi.deleteItem(id)
        }
    }

    const command_args = {
        "list": ["name"],
        "check": ["id"],
        "uncheck": ["id"],
        "add": ["name", "text", "due_date"],
        "edit": ["id", "text"],
        "delete": ["id"]
    }

    function showAvailableCommand(command) {
        terminal.printf`> '${{[Color.COLOR_2]: "$"}} todo ${{[Color.WHITE]: command}} ${{[Color.COLOR_1]: command_args[command].map(a => `<${a}>`).join(" ")}}'\n`
    }

    function showAvailableCommands() {
        terminal.printf`'${{[Color.COLOR_2]: "$"}} todo ${{[Color.COLOR_1]: "<command> [args...]"}}':\n`
        for (let [command, _] of Object.entries(command_args)) {
            showAvailableCommand(command)
        }
    }

    if (parsedArgs.length == 0 || (parsedArgs.length == 1 && parsedArgs[0] == "help")) {
        terminal.printLine(`You must supply at least 1 argument:`)
        showAvailableCommands()
        return
    }

    let command = parsedArgs[0]
    let args = parsedArgs.slice(1)

    if (!(command in commands)) {
        terminal.printLine(`Unknown command! Available commands:`)
        showAvailableCommands()
        return
    }

    if (args.length != command_args[command].length) {
        terminal.printLine(`Invalid number of arguments!`)
        showAvailableCommand(command)
        return
    }

    await commands[command](...args)
}, {
    description: "manage a todo list",
    rawArgMode: true
})

let audioContext = null

terminal.addCommand("morse", async function(args) {
    function mostPopularChar(string) {
        string = string.toLowerCase().trim()
        let occurences = {}
        for (let char of string) {
            if (!"abcdefghijklmnopqrstuvwxyz.-".includes(char))
                continue
            if (char in occurences) {
                occurences[char]++
            } else {
                occurences[char] = 1
            }
        }
        let mostPopularC = null
        let mostOccurences = 0
        for (let [char, count] of Object.entries(occurences)) {
            if (count > mostOccurences) {
                mostOccurences = count
                mostPopularC = char
            }
        }
        return mostPopularC
    }
    
    MORSE = {
        A: ".-", B: "-...", C: "-.-.",
        D: "-..", E: ".", F: "..-.",
        G: "--.", H: "....", I: "..",
        J: ".---", K: "-.-", L: ".-..",
        M: "--", N: "-.", O: "---",
        P: ".--.", Q: "--.-", R: ".-.",
        S: "...", T: "-", U: "..-",
        V: "...-", W: ".--", X: "-..-",
        Y: "-.--", Z: "--..",
        "0": "----", "1": ".----",
        "2": "..---", "3": "...--",
        "4": "....-", "5": ".....",
        "6": "-....", "7": "--...",
        "8": "---..", "9": "----.",
        ".": ".-.-.-", ",": "--..--",
        "?": "..--..", "'": ".----.",
        "!": "-.-.--", "/": "-..-.",
        "(": "-.--.", ")": "-.--.-",
        "&": ".-...", ":": "---...",
        ";": "-.-.-.", "=": "-...-",
        "+": ".-.-.", "-": "-....-",
        "_": "..--.-", '"': ".-..-.",
        "$": "...-..-", "@": ".--.-."
    }
    let text = args.text.trim().toUpperCase()
    const noinput = () => terminal.printf`${{[Color.RED]: "Error"}}: No input-text given!\n`
    try {
        playFrequency(0, 0)
    } catch {}
    let audioSpeed = 0.4
    if (text.length > 30) audioSpeed = 0.1
    if ([".", "-"].includes(mostPopularChar(text))) {
        text += " "
        let tempLine = "" 
        let tempChar = ""
        for (let char of text) {
            tempChar += char
            if (char == " ") {
                for (let [morseChar, morseCode] of Object.entries(MORSE)) {
                    if (tempChar.trim() == morseCode) {
                        tempLine += morseChar
                        tempChar = ""
                    }
                }
                tempLine += tempChar
                tempChar = ""
            }
            if (tempLine.length > 40) {
                terminal.printLine(tempLine)
                tempLine = ""
            }
        }
        if (tempLine) terminal.printLine(tempLine)
        if (!text) noinput()
    } else {
        for (let char of text) {
            if (char in MORSE) {
                let morseCode = `${MORSE[char].replaceAll(".", "•")}`
                for (let morseChar of morseCode) {
                    terminal.print(morseChar)
                    if (audioContext) {
                        if (morseChar == "•") {
                            playFrequency(400, 300 * audioSpeed)
                            await sleep(600 * audioSpeed)
                        } else if (morseChar == "-") {
                            playFrequency(500, 600 * audioSpeed)
                            await sleep(900 * audioSpeed)
                        }
                    }
                }
                if (audioContext) {
                    await sleep(800 * audioSpeed)
                }
                terminal.print(" ")
            } else if (char == " ") {
                if (audioContext) {
                    await sleep(1000 * audioSpeed)
                }
                terminal.printLine()
            } else {
                terminal.print(char)
            }
        }
        terminal.printLine()
        if (!text) noinput()
    }
}, {
    description: "translate latin to morse or morse to latin",
    args: {
        "*text": "text to translate"
    }
})

terminal.addCommand("fizzbuzz", function(args) {
    for (let i = 1; i <= args.max; i++) {
        let outs = ""
        if (i % 3 == 0) outs += "fizz"
        if (i % 5 == 0) outs += "buzz"
        if (outs == "") outs += i
        terminal.printLine(outs)
    }
},{
    description: "print the fizzbuzz sequence",
    args: {
        "?max:n:1~1000": "the maximum number to print"
    },
    standardVals: {
        max: 15
    }
})

terminal.addCommand("ceasar", function(args) {
    let text = args.text
    let shiftVal = args.shift
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    function betterMod(n, m) {
        while (n < 0) n += m
        return n % m
    }
    for (let char of text.toLowerCase()) {
        let index = alphabet.indexOf(char)
        if (index == -1) {
            terminal.print(char)
            continue
        }
        let newChar = alphabet[betterMod((index + shiftVal), alphabet.length)]
        terminal.print(newChar)
    }
    terminal.printLine()
}, {
    description: "shift the letters of a text",
    args: {
        "text": "the text to shift",
        "?shift:n:-26~26": "the shift value"
    },
    standardVals: {
        shift: 1
    }
})

terminal.addCommand("clock", async function(args) {
    let displayMillis = !!args.m
    let gridSize = {
        x: 20*2.2,
        y: 20
    }
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))
    let containerDiv = null
    function printGrid() {
        const customColors = {
            "x": Color.COLOR_1,
            "#": Color.WHITE,
            "w": Color.ORANGE,
            ".": Color.rgb(50, 50, 50),
            "o": Color.LIGHT_GREEN,
            "s": Color.hex("a4a4c7")
        }
        let prevContainerDiv = containerDiv
        let tempNode = terminal.parentNode
        terminal.parentNode = document.createElement("div")
        containerDiv = terminal.parentNode
        tempNode.appendChild(containerDiv)
        terminal.printLine()
        for (let row of grid) {
            for (let item of row) {
                if (Object.keys(customColors).includes(item)) {
                    terminal.print(item, customColors[item])
                } else {
                    terminal.print(item)
                }
            }
            terminal.printLine()
        }
        if (prevContainerDiv) prevContainerDiv.remove()
        terminal.parentNode = tempNode
    }
    function drawIntoGrid(x, y, v) {
        let gridX = Math.round((x - -1) / (1 - -1) * (gridSize.x - 1))
        let gridY = Math.round((y - -1) / (1 - -1) * (gridSize.y - 1))
        if (gridX < 0 || gridX >= gridSize.x || gridY < 0 || gridY >= gridSize.y) {
            return
        }
        grid[gridSize.y - 1 - gridY][gridX] = v
    }
    function drawCircle(val, radius=1) {
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            let x = Math.sin(t) * radius
            let y = Math.cos(t) * radius
            drawIntoGrid(x, y, val)
        }
    }
    function drawLine(angle, val, maxVal=1) {
        for (let t = 0; t < maxVal; t += 0.01) {
            let x = Math.sin(angle * Math.PI * 2) * t
            let y = Math.cos(angle * Math.PI * 2) * t
            drawIntoGrid(x, y, val)
        }
    }
    function update() {
        let date = new Date()
        let mins = date.getHours() * 60 + date.getMinutes()
        for (let r = 0; r < 1; r += 0.05) {
            drawCircle(".", r)
        }
        drawCircle("#")
        if (displayMillis)
            drawLine(date.getMilliseconds() / 1000, "s", 0.9)
        drawLine((mins % 720) / 720, "w", 0.75)
        drawLine(date.getMinutes() / 60, "x", 0.9)
        drawLine(date.getSeconds() / 60, "o", 0.9)
        printGrid()
        terminal.scroll("auto")
    }
    while (true) {
        update()
        await sleep(displayMillis ? 40 : 1000)
    }
}, {
    description: "display a clock",
    args: {
        "?m": "display milliseconds"
    }
})

terminal.addCommand("timer", async function(rawArgs) {
    let words = rawArgs.split(" ").filter(w => w.length > 0)
    let ms = 0
    for (let word of words) {
        if (/^[0-9]+s$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 1000
        } else if (/^[0-9]+m$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 60 * 1000
        } else if (/^[0-9]+h$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 60 * 60 * 1000
        } else {
            throw new Error(`Invalid time '${word}'`)
        }
    }

    if (ms == 0) {
        terminal.printLine("An example time could be: '1h 30m 20s'")
        throw new Error("Invalid time!")
    }

    let notes = [[800, 1], [800, 1], [800, 1], [800, 1]]
    let beep = [[400, 8]]

    try {
        var melodiesFolder = getFolder(["noel", "melodies"])[0].content
    } catch {
        throw new Error("Melodys Folder not found!")
    }
    let melodyNotes = []
    let i = 0
    for (let [fileName, file] of Object.entries(melodiesFolder)) {
        let melodyName = fileName.split(".", 1)[0]
        try {
            melodyNotes.push(JSON.parse(file.content))
            i++
            terminal.printf`${{[Color.COLOR_1]: i}}: ${{[Color.WHITE]: melodyName}}\n`
        } catch {}
    }

    if (melodyNotes.length > 0) {
        let promptMsg = `Which melody do you want to use [1-${melodyNotes.length}]? `
        let tuneSelection = await terminal.promptNum(promptMsg, {min: 1, max: melodyNotes.length})
        notes = melodyNotes[tuneSelection - 1]
    }

    let startTime = Date.now()

    function printStatus(width=50) {
        terminal.printLine()
        let status = Math.min((Date.now() - startTime) / ms, 1)
        let progressbar = stringMul("#", Math.ceil(status * (width - 4)))
        terminal.printLine("+" + stringMul("-", width - 2) + "+")
        terminal.printLine(`| ${stringPadBack(progressbar, width - 4)} |`)
        terminal.printLine("+" + stringMul("-", width - 2) + "+")
        let secondsDiff = (ms / 1000) - Math.floor((Date.now() - startTime) / 1000)
        if (secondsDiff < 0) secondsDiff = 0
        let seconds = Math.ceil(secondsDiff % 60)
        let minutes = 0
        while (secondsDiff >= 60) {
            minutes += 1
            secondsDiff -= 60
        }
        let timeStr = (minutes ? `${minutes}m ` : "") + `${seconds}s left`
        if (status != 1)
            terminal.printLine(`${Math.round(status * 100)}% - ${timeStr}`)
        else
            terminal.printf`${{[Color.LIGHT_GREEN]: "-- timer finished --"}}\n`
    }

    async function alarm() {
        await playMelody(notes)
    }

    let prevTextDiv = null
    while (Date.now() - startTime < ms) {
        textDiv = document.createElement("div")
        terminal.parentNode.appendChild(textDiv)
        terminal.setTextDiv(textDiv)
        printStatus()
        terminal.resetTextDiv()
        if (prevTextDiv) prevTextDiv.remove()
        prevTextDiv = textDiv
        terminal.scroll()
        if (Date.now() - startTime - ms > -3500) {
            await playMelody(beep)
        }
        await sleep(1000)
    }
    if (prevTextDiv) prevTextDiv.remove()
    printStatus()
    try {
        playFrequency(0, 0)
    } catch {}
    if (audioContext) {
        await alarm()
    }
}, {
    description: "set a timer",
    rawArgMode: true
})

terminal.addCommand("mandelbrot", async function(args) {
    let gridSize = {x: 0, y: 0}
    gridSize.x = ~~(terminal.approxWidthInChars - 10)
    gridSize.y = ~~(gridSize.x * 1 / 3)
    if (args.w) gridSize.x = ~~args.w
    if (args.h) gridSize.y = ~~args.h
    if (gridSize.y % 2 == 1) gridSize.y++

    let plotSize = {xmin: -1.85, xmax: 0.47, ymin: -0.95, ymax: 0.95}
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))

    let maxIteration = 1000

    function getPixelCoords(px, py) {
        let xDiff = plotSize.xmax - plotSize.xmin
        let x = plotSize.xmin + (px / gridSize.x) * xDiff
        let yDiff = plotSize.ymax - plotSize.ymin
        let y = plotSize.ymin + (py / gridSize.y) * yDiff
        return [x, y]
    }

    function calcPixel(px, py) {
        let [x0, y0] = getPixelCoords(px, py)
        let [x, y] = [0.0, 0.0]
        let i = 0
        for (; i < maxIteration; i++) {
            let temp = x**2 - y**2 + x0
            y = 2*x*y + y0
            x = temp
            if ((x**2 + y**2) >= 4)
                break
        }
        if (i == maxIteration)
            return "#"
        return "."
    }

    async function drawGrid() {
        for (let y = 0; y < gridSize.y; y++) {
            for (let x = 0; x < gridSize.x; x++) {
                terminal.print(grid[y][x])
            }
            terminal.printLine()
        }
    }

    for (let y = 0; y < gridSize.y; y++) {
        for (let x = 0; x < gridSize.x; x++) {
            grid[y][x] = calcPixel(x, y)
        }
    }
    drawGrid()
}, {
    description: "draws the mandelbrot set",
    args: {
        "?w:n:10~1000": "width of the plot",
        "?h:n:10~1000": "height of the plot"
    }
})

terminal.addCommand("hidebtns", function() {
    document.documentElement.style.setProperty("--terminal-btn-display", "none")
    localStorage.setItem("hideBtns", "true")
}, {
    description: "hides the buttons in the terminal"
})

terminal.addCommand("unhidebtns", function() {
    document.documentElement.style.setProperty("--terminal-btn-display", "block")
    localStorage.setItem("hideBtns", "false")
}, {
    description: "unhides the buttons in the terminal"
})

function hideBtns() {
    if (localStorage.getItem("hideBtns") == "true" || isMobile) {
        document.documentElement.style.setProperty("--terminal-btn-display", "none")
    }
}

hideBtns()

function fileTooLargeWarning() {
    terminal.print("Warning", Color.RED)
    terminal.printLine(": File is too large to be saved locally.")
    terminal.printLine("         Thus, it will disappear when reloading.")
}

terminal.addCommand("upload", async function() {
    try {
        var [fileName, fileContent, isDataURL] = await fileFromUpload()
    } catch {
        throw new Error("File Upload Failed")
    }
    let fileType = FileType.READABLE
    if (fileName.endsWith(".melody")) {
        fileType = FileType.MELODY
    } else if (isDataURL) {
        fileType = FileType.DATA_URL
    }
    if (fileExists(fileName)) {
        throw new Error("file already exists in folder")
    }
    terminal.currFolder.content[fileName] = new FileElement(fileType, fileContent, {})
    terminal.printLine("upload finished.")
    if (fileContent.length > MAX_FILE_SIZE) {
        fileTooLargeWarning()
    }
}, {
    description: "upload a file from your computer"
})

terminal.addCommand("letters", function(args) {
    let text = args.text.trim().toLowerCase()

    if (!text)
        throw new Error("No text given")

    for (let char of text) {
        if (!(char in AsciiArtLetters)) {
            throw new Error("Unsupported character used ('" + char + "')")
        }
    }

    function pasteHorizontal(a, b, l1, l2) {
        let lines = {a: a.split("\n").slice(0, -1), b: b.split("\n").slice(0, -1)}
        let width = {a: () => lines.a[0].length, b: () => lines.b[0].length}
        let height = {a: () => lines.a.length, b: () => lines.b.length}
        
        while (height.a() > height.b()) {
            lines.b.unshift(stringMul(" ", width.b()))
        }
        while (height.b() > height.a()) {
            lines.a.unshift(stringMul(" ", width.a()))
        }

        function eq(a, b) {
            if (a == b) return true
            if (a == " " || b == " ") return true
            if (a == "(" && b == "|") return true
            if (a == ")" && b == "|") return true
            if (b == "(" && a == "|") return true
            if (b == ")" && a == "|") return true
            return false
        }

        for (let i = 0; i < 2; i++) {
            let compressBoth = true
            for (let i = 0; i < height.a(); i++) {
                let [x, y] = [lines.a[i].slice(-1), lines.b[i][0]]
                if (!(eq(x, y))) {
                    compressBoth = false
                    break
                }
            }

            if (!compressBoth)
                break

            for (let i = 0; i < height.a(); i++) {
                let [x, y] = [lines.a[i].slice(-1), lines.b[i][0]]
                if (x == " ") {
                    lines.a[i] = lines.a[i].slice(0, -1) + lines.b[i][0]
                }
                lines.b[i] = lines.b[i].slice(1)
            }
        }

        let combined = ""
        for (let i = 0; i < height.a(); i++)
            combined += lines.a[i] + lines.b[i] + "\n"
        return combined
    }

    let output = AsciiArtLetters[text[0]]
    for (let i = 1; i < text.length; i++) {
        output = pasteHorizontal(output, AsciiArtLetters[text[i]], text[i - 1], text[i])
    }
    terminal.printLine(output)
}, {
    description: "prints the given text in ascii art",
    args: {
        "*text": "the text to print"
    }
})

terminal.addCommand("du", function(args) {
    let fileNames = []
    let fileSizes = []
    let totalSize = 0
    function getSizeStr(size) {
        if (size < 10 ** 3) return `${size}B`
        if (size < 10 ** 6) return `${Math.ceil(size / 1000)}KB`
        return `${Math.ceil(size / 1000000)}MB`
    }
    let targetFolder = terminal.currFolder
    if (args.folder) {
        targetFolder = terminal.getFile(args.folder)
    }
    for (let [fileName, file] of Object.entries(targetFolder.content)) {
        let fileContent = JSON.stringify(file.export())
        totalSize += fileContent.length
        let fileSize = getSizeStr(fileContent.length)
        if (file.type == FileType.FOLDER)
            fileName += "/"
        fileNames.push(fileName)
        fileSizes.push(fileSize)
    }
    fileNames.unshift("TOTAL")
    fileSizes.unshift(getSizeStr(totalSize))
    let longestSizeLength = fileSizes.reduce((a, e) => Math.max(a, e.length), 0) + 2
    let paddedFileSizes = fileSizes.map(s => stringPadBack(s, longestSizeLength))
    for (let i = 0; i < fileNames.length; i++) {
        if (i == 0) {
            terminal.print(paddedFileSizes[i] + fileNames[i] + "\n", Color.COLOR_1)
        } else {
            terminal.printLine(paddedFileSizes[i] + fileNames[i])
        }
    }
    if (fileNames.length == 0) {
        throw new Error("target-directory is empty")
    }
}, {
    description: "display disk usage of current directory",
    args: {folder: null}
})

terminal.addCommand("href", function(args) {
    if (!args.url.startsWith("http")) args.url = "https://" + args.url
    window.open(args.url, "_blank").focus()
}, {
    description: "open a link in another tab",
    args: ["url"]
})

terminal.addCommand("pv", async function(args) {
    await terminal.animatePrint(args.message)
}, {
    description: "print a message with a typing animation",
    args: ["*message"]
})

terminal.addCommand("cw", function(args) {
    if (args.date == "today" || !args.date) {
        args.date = "today"
        const today = new Date()
        var day = today.getDate()
        var month = today.getMonth() + 1
        var year = today.getFullYear()
    } else if (!/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,4}$/.test(args.date)) {
        throw new Error("Invalid date!")
    } else {
        var [day, month, year] = args.date.split(".").map(d => parseInt(d))
    }

    function getCalendarWeek(day, month, year, yearPlus=0) {
        let firstDay = new Date()
        firstDay.setFullYear(year, 0, 4)
        while (firstDay.getDay() != 1) {
            firstDay.setDate(firstDay.getDate() - 1)
        }
        let currDate = firstDay
        let count = 1
        while (currDate.getDate() != day
        || currDate.getMonth() != (month - 1)
        || currDate.getFullYear() != (year + yearPlus)
        ) {
            currDate.setDate(currDate.getDate() + 1)
            count++
            if (count > 400) {
                return 0
            }
        }
        return Math.ceil(count / 7)
    }

    let calendarWeek = getCalendarWeek(day, month, year)
    let iterationCount = 0

    while (calendarWeek == 0) {
        iterationCount += 1
        calendarWeek = getCalendarWeek(
            day, month, year - iterationCount, iterationCount
        )
        if (iterationCount > 3)
            throw new Error("Invalid day!")
    }

    terminal.printLine(`calenderweek of ${args.date}: ${calendarWeek}`)

}, {
    description: "get the calendar week of a date",
    args: {
        "?date": "the date to get the calendar week of"
    },
    standardVals: {date: null}
})

terminal.addCommand("donut", async function() {
    // mostly copied from original donut.c code

               let p=terminal.
           print(),A=1,B=1,f=()=>{
         let b=[];let z=[];A+=0.07;B
       +=0.03;let s=Math.sin,c=Math.cos
     ,cA=c(A),sA=s(A),cB=c(B),sB=s(B);for(
    let k=0;k<1760;k++){b[k]=k%80==79?"\n":
    " ";z[k]=0;};for        (let j=0;j<6.28;
    j+=0.07){let ct          =c(j),st=s(j);
    for(i=0;i<6.28;          i+=0.02){let sp
    =s(i),cp=c(i),h          =ct+2,D=1/(sp*h
    *sA+st*cA+5),t=sp       *h*cA-st*sA;let
    x=0|(40+30*D*(cp*h*cB-t*sB)),y=0|(12+15
     *D*(cp*h*sB+t*cB)),o=x+80*y,N=0|(8*((st
     *sA-sp*ct*cA)*cB-sp*ct*sA-st*cA-cp*ct
     *sB));if(y<22&&y>=0&&x>=0&&x<79&&D>z
       [o]){z[o]=D;b[o]=".,-~:;=!*#$@"[
          N>0?N:0];}}}p.innerHTML=b
            .join("")};while(1){f();
              await sleep(30);}

}, {
    description: "display a spinning donut"
})

terminal.addCommand("grep", async function(args) {
    let recursive = args.r ?? false
    let ignorecase = args.i ?? false
    let invert = args.v ?? false
    let linematch = args.x ?? false

    if (ignorecase)
        args.pattern = args.pattern.toLowerCase()

    let matches = []

    function processFile(file, filename, allowRecursionOnce=false) {
        if (file.type == FileType.FOLDER) {
            if (recursive || allowRecursionOnce) {
                for (let [newName, newFile] of Object.entries(file.content)) {
                    if (!recursive && newFile.type == FileType.FOLDER) continue
                    processFile(newFile, newName)
                }
            } else {
                throw new Error(`File ${filename} is a directory!`)
            }
        } else {
            for (let line of file.content.split("\n")) {
                if (linematch) {
                    let tempLine = line
                    if (ignorecase)
                        tempLine = line.toLowerCase()
                    var matching = tempLine === args.pattern
                } else if (ignorecase) {
                    var matching = line.toLowerCase().includes(args.pattern)
                } else {
                    var matching = line.includes(args.pattern)
                }
                if (matching ^ invert) {
                    if (ignorecase) {
                        var offset = line.toLowerCase().indexOf(args.pattern)
                    } else {
                        var offset = line.indexOf(args.pattern)
                    }
                    matches.push({
                        filename: filename,
                        filepath: file.path,
                        line: line,
                        offset: offset,
                    })
                }
            }
        }
    }

    if (args.file == "*") {
        processFile(terminal.currFolder, ".", true)
    } else {
        for (let filename of args.file.split(" ")) {
            let file = terminal.getFile(filename)
            processFile(file, filename)
        }
    }

    for (let match of matches) {
        terminal.printCommand(
            match.filename,
            `cat ${match.filepath}`,
            Color.COLOR_1, false
        )
        terminal.print(": ")
        if (match.offset == -1) {
            terminal.print(match.line)
        } else {
            let slicePoint = match.offset + 100
            if (slicePoint < match.line.length)
                match.line = match.line.slice(0, slicePoint) + "..."
            let prevLine = match.line.substring(0, match.offset)
            let matchLine = match.line.substring(match.offset, match.offset + args.pattern.length)
            let nextLine = match.line.substring(match.offset + args.pattern.length)
            terminal.print(prevLine)
            terminal.print(matchLine, Color.COLOR_2)
            terminal.print(nextLine)
        }
        terminal.addLineBreak()
    }

    if (matches.length == 0) {
        terminal.printLine("no matches")
    }

}, {
    description: "search for a pattern in a file",
    args: {
        "pattern": "the pattern to search for",
        "file": "the file to search in",
        "?r": "search recursively",
        "?i": "ignore case",
        "?v": "invert match",
        "?x": "match whole lines",
    }
})

terminal.addCommand("man", function(args) {
    let command = terminal.getFunction(args.command)
    if (command == null) {
        throw new Error(`No manual entry for ${args.command}`)
    }
    if (args.command == "man") {
        throw new Error("Recursion.")
    }
    terminal.printLine("description: \"" + command.description + "\"")
    if (command.args.length == 0) {
        terminal.printLine("args: doesn't accept any arguments")
    } else {
        getArgs({
            rawArgs: "--help",
            funcName: args.command,
        }, command.args, command.standardVals, command.argDescriptions)
    }
}, {
    description: "show the manual page for a command",
    args: {"command": "the command to show the manual page for"},
    helpVisible: true
})

terminal.addCommand("search", async function(args) {
    let combinedUrl = args.b + encodeURIComponent(args.query)
    window.location.href = combinedUrl
}, {
    description: "search something via google.com",
    args: {
        "*query": "the search query",
        "?b": "the base search-engine url"
    },
    standardVals: {
        b: "https://www.google.com/search?q="
    }
})

terminal.addCommand("pascal", async function(args) {
    function generate(depth) {
        let rows = []
        let prevRow = []
        for (let i = 0; i < depth; i++) {
            let row = Array(i + 1)
            row[0] = 1
            row[i] = 1
            for (let j = 1; j < i; j++)
                row[j] = prevRow[j - 1] + prevRow[j]
            rows.push(row)
            prevRow = row
        }
        return rows
    }

    args.depth = ~~args.depth

    let data = generate(args.depth)
    // highest number is the one at the bottom middle always
    let maxNumWidth = data[args.depth - 1][Math.floor(args.depth / 2)].toString().length
    let nums = data.map(row => row.map(n => stringPadMiddle(n, maxNumWidth)))
    let rows = nums.map(row => row.join(" "))

    if (args.f) {
        terminal.printLine(rows[rows.length - 1])
        return
    }

    for (let i = 0; i < rows.length; i++) {
        terminal.printLine(stringPadMiddle(rows[i], args.depth * (maxNumWidth + 1)))
    }

}, {
    description: "print a pascal triangle",
    args: {
        "?depth:n:1~100": "the depth of the triangle",
        "?f": "only show the final row"
    },
    standardVals: {
        depth: 10
    }
})

terminal.addCommand("logistic-map", async function(args) {
    const maxIterations = 100
    const startValue = 0.5
    const minR = args.min
    const maxR = args.max

    if (minR >= maxR) {
        throw new Error("max value must be greater than min value")
    }

    if (maxR - minR < 0.5) {
        throw new Error("span of values too small to plot")
    }
    
    const fieldSize = new Vector2d(args.w, args.h)

    let field = Array.from(Array(fieldSize.y), () => Array.from(Array(fieldSize.x), () => " "))

    function drawNumberLines() {
        for (let x = 0; x < 5; x++) {
            let xPos = Math.floor((x - minR) / (maxR - minR) * fieldSize.x)
            for (let y = 0; y < fieldSize.y; y++) {
                if (xPos < 0 || xPos >= fieldSize.x) continue
                field[y][xPos] = String(x)
            }
        }
    }

    function test(r) {
        let currVal = startValue
        for (let i = 0; i < maxIterations; i++) {
            currVal = r * currVal * (1 - currVal)
        }
        let findings = new Set()
        for (let i = 0; i < maxIterations; i++) {
            currVal = r * currVal * (1 - currVal)
            let rounded = Math.round(currVal * 10000) / 10000
            findings.add(rounded)
        }
        return Array.from(findings)
    }

    let ys = []
    for (let x = 0; x < fieldSize.x; x++) {
        let xVal = (x / fieldSize.x) * (maxR - minR) + minR
        ys.push(test(xVal))
    }

    let maxY = Math.max(...ys.flat()) + 0.1
    for (let x = 0; x < fieldSize.x; x++) {
        for (let yVal of ys[x]) {
            let y = Math.floor(yVal / maxY * fieldSize.y)
            let mirroredY = fieldSize.y - y - 1
            if (mirroredY < 0 || mirroredY >= fieldSize.y) continue
            field[mirroredY][x] = "#"
        }
    }

    for (let y = 0; y < field.length; y++) {
        let rowString = ""
        for (let x = 0; x < field[y].length; x++) {
            rowString += field[y][x]
        }
        terminal.printLine(rowString)
    }

}, {
    description: "draw the logistic map",
    args: {
        "?min:n:-2~4": "minimum R value",
        "?max:n:-2~4": "maximum R value",
        "?w:n:10~200": "width of display",
        "?h:n:5~100": "height of display"
    },
    standardVals: {
        min: 0,
        max: 4,
        w: 80,
        h: 20
    },
})

terminal.addCommand("rndm", async function(args) {
    args.min = ~~args.min
    args.max = ~~args.max + 1

    if (args.max - args.min <= 1)
        throw new Error("max value must be greater than min value")

    let range = args.max - args.min
    let randomNum = (Date.now() % range) + args.min
    terminal.printLine(randomNum)
}, {
    description: "generate a random number based on the current time",
    args: {
        "?min:n:0~100000": "minimum value (inclusive)",
        "?max:n:0~100000": "maximum value (inclusive)",
    },
    standardVals: {
        min: 1,
        max: 100,
    }
})

terminal.addCommand("vigenere", async function(args) {
    const getCharValue = char => char.toLowerCase().charCodeAt(0) - 97
    const getCharFromValue = value => String.fromCharCode(value + 97)
    
    if (!/^[a-zA-Z\s]+$/.test(args.message))
        throw new Error("message must only contain letters and spaces")
    else if (!/^[a-zA-Z]+$/.test(args.key))
        throw new Error("key must only contain letters")

    let output = ""

    Array.from(args.message).forEach((character, i) => {
        let charValue = getCharValue(character)
        let keyValue = getCharValue(args.key[i % args.key.length])
        let newValue = (charValue + keyValue) % 26
        if (args.d) newValue = (charValue - keyValue + 26) % 26
        output += getCharFromValue(newValue)
    })

    terminal.printLine(output)
}, {
    description: "encrypt/decrypt a message using the vigenere cipher",
    args: {
        "message": "the message to encrypt/decrypt",
        "key": "the key to use",
        "?d": "decrypt the message instead of encrypting it"
    },
})

terminal.addCommand("sha256", async function(args) {
    if (!window.crypto || !window.crypto.subtle)
        throw new Error("crypto API not supported")

    if (!args.s && !args.f) {
        terminal.printError("must specify either -s or -f")
        terminal.print("Use ")
        terminal.printCommand("man sha256")
        terminal.printLine(" for more information")
        throw new IntendedError()
    }

    if (args.s && args.f)
        throw new Error("cannot specify both -s and -f")

    let text = ""
    if (args.s) {
        text = args.s
    } else if (args.f) {
        let file = terminal.getFile(args.f, FileType.READABLE)
        text = file.content
    }

    let hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    let hashArray = Array.from(new Uint8Array(hash))
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    terminal.printLine(hashHex)
}, {
    description: "calculate the SHA-256 hash of a message",
    args: {
        "?s": "a string to hash",
        "?f": "a file to hash"
    },
    standardVals: {
        s: null,
        f: null
    }
})

terminal.addCommand("base64", async function(args) {
    let msg = args.message
    let output = ""
    if (args.d) {
        output = atob(msg)
    } else {
        output = btoa(msg)
    }
    terminal.printLine(output)
}, {
    description: "encode/decode a message using base64",
    args: {
        "*message": "the message to encode/decode",
        "?d": "decode the message instead of encoding it"
    },
})

terminal.addCommand("joke", async function(args) {
    let response = await fetch("https://official-joke-api.appspot.com/random_joke")
    let joke = await response.json()
    terminal.printLine(joke.setup)
    await sleep(3000)
    terminal.printLine(joke.punchline)
}, {
    description: "tell a joke",
})

terminal.addCommand("cheese", async function(args) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        throw new Error("Device does not support MediaDevices API")

    let stream = await navigator.mediaDevices.getUserMedia({video: true})
    let canvas = document.createElement("canvas")

    let context = canvas.getContext("2d")
    let video = document.createElement("video")
    video.srcObject = stream
    video.play()

    terminal.parentNode.appendChild(canvas)
    canvas.style.display = "none"

    await sleep(1000)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (Math.max(canvas.width, canvas.height) == 0) {
        throw new Error("Invalid image source")
    }

    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    stream.getTracks().forEach(track => track.stop())

    let imgSource = canvas.toDataURL("image/png")

    terminal.printImg(imgSource, "cheese")
    terminal.addLineBreak()

}, {
    description: "take a foto with your webcam",
})

terminal.addCommand("sorting", async function(args) {

    let array = Array.from({length: args.n}, (_, i) => i + 1)

    function shuffleArray() {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffleArray()

    let windowSize = Math.min((terminal.parentNode.clientWidth - 100) * 0.9, (terminal.parentNode.clientHeight - 100) * 0.9)

    const elementSize = Math.max(Math.floor(windowSize / array.length), 1)

    let elements = []
    
    function firstDraw() {
        let parentContainer = document.createElement("div")
        parentContainer.style.width = `${args.n * elementSize}px`
        parentContainer.style.height = `${args.n * elementSize}px`
        parentContainer.style.display = "grid"
        parentContainer.style.gridTemplateColumns = `repeat(${args.n}, 1fr)`
        parentContainer.style.alignItems = "end"
        for (let i = 0; i < array.length; i++) {
            let element = document.createElement("div")
            element.style.backgroundColor = "white"
            element.style.width = `${elementSize}px`
            element.style.height = `${array[i] * elementSize}px`
            elements.push(element)
            parentContainer.appendChild(element)
        }
        terminal.parentNode.appendChild(parentContainer)
    }

    let prevElements = []
    const swapColor = "lightgreen"

    function unmark() {
        for (let element of prevElements) {
            element.style.backgroundColor = "white"
        }
        prevElements = []
    }

    function heightToFreq(height) {
        const minFreq = 100
        const maxFreq = 1000
        return (height / args.n) * (maxFreq - minFreq) + minFreq
    }

    let waitTime = 100 / args.speed

    function swap(i, j) {
        unmark()
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
        elements[i].style.height = `${array[i] * elementSize}px`
        elements[j].style.height = `${array[j] * elementSize}px`
        elements[i].style.backgroundColor = swapColor
        elements[j].style.backgroundColor = swapColor
        prevElements = [elements[i], elements[j]]
        if (!args.s) {
            playFrequency(heightToFreq(array[i]), waitTime)
        }
    }

    function mark(i) {
        elements[i].style.backgroundColor = swapColor
        prevElements.push(elements[i])
        if (!args.s) {
            playFrequency(heightToFreq(array[i]), waitTime)
        }
    }

    function update(i) {
        elements[i].style.height = `${array[i] * elementSize}px`
    }

    async function endAnimation() {
        unmark()
        for (let i = 0; i < array.length; i++) {
            elements[i].style.backgroundColor = swapColor
            if (!args.s) {
                playFrequency(heightToFreq(array[i]), waitTime)
            }
            await sleep(waitTime)
        }
        await sleep(waitTime)
        for (let i = 0; i < array.length; i++) {
            elements[i].style.backgroundColor = "white"
        }
    }

    const algorithms = {
        "bubble": async function() {
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array.length - i - 1; j++) {
                    if (array[j] > array[j + 1]) {
                        swap(j, j + 1)
                        await sleep(waitTime)
                    }
                }
            }
        },
        "insertion": async function() {
            for (let i = 1; i < array.length; i++) {
                let j = i - 1
                let key = array[i]
                while (j >= 0 && array[j] > key) {
                    swap(j, j + 1)
                    await sleep(waitTime)
                    j--
                }
                array[j + 1] = key
            }
        },
        "selection": async function() {
            for (let i = 0; i < array.length; i++) {
                let minIndex = i
                for (let j = i + 1; j < array.length; j++) {
                    mark(j)
                    await sleep(waitTime)
                    unmark()
                    if (array[j] < array[minIndex]) {
                        minIndex = j
                    }
                }
                swap(i, minIndex)
                await sleep(waitTime)
            }
        },
        "quick": async function() {
            async function partition(min, max) {
                let pivot = array[max]
                let i = min - 1
                for (let j = min; j < max; j++) {
                    if (array[j] < pivot) {
                        i++
                        swap(i, j)
                        await sleep(waitTime)
                    }
                }
                swap(i + 1, max)
                await sleep(waitTime)
                return i + 1
            }

            async function quickSort(min, max) {
                if (min < max) {
                    let pi = await partition(min, max)
                    await quickSort(min, pi - 1)
                    await quickSort(pi + 1, max)
                }
            }

            await quickSort(0, array.length - 1)
        },
        "heap": async function() {
            async function heapify(n, i) {
                let largest = i
                let l = 2 * i + 1
                let r = 2 * i + 2
                if (l < n && array[l] > array[largest]) {
                    largest = l
                }
                if (r < n && array[r] > array[largest]) {
                    largest = r
                }
                if (largest != i) {
                    swap(i, largest)
                    await sleep(waitTime)
                    await heapify(n, largest)
                }
            }

            for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
                await heapify(array.length, i)
            }
            for (let i = array.length - 1; i >= 0; i--) {
                swap(0, i)
                await sleep(waitTime)
                await heapify(i, 0)
            }
        },
        "merge": async function() { 
            // inplace merge sort with marking
            async function merge(start, mid, end) {
                let i = start
                let j = mid + 1
                let temp = []
                while (i <= mid && j <= end) {
                    mark(i)
                    mark(j)
                    await sleep(waitTime)
                    unmark()
                    if (array[i] <= array[j]) {
                        temp.push(array[i])
                        i++
                    } else {
                        temp.push(array[j])
                        j++
                    }
                }
                while (i <= mid) {
                    temp.push(array[i])
                    i++
                }
                while (j <= end) {
                    temp.push(array[j])
                    j++
                }
                for (let i = start; i <= end; i++) {
                    array[i] = temp[i - start]
                    update(i)
                    mark(i)
                    await sleep(waitTime)
                }
            }

            async function mergeSort(start, end) {
                if (start < end) {
                    let mid = Math.floor((start + end) / 2)
                    await mergeSort(start, mid)
                    await mergeSort(mid + 1, end)
                    await merge(start, mid, end)
                }
            }

            await mergeSort(0, array.length - 1)
        }
    }

    if (args.algorithm === null) {
        terminal.printLine("Available algorithms:")
        for (let algorithm in algorithms) {
            terminal.print("- ")
            terminal.printCommand(algorithm, `sorting ${algorithm}`)
        }
        return
    }

    if (!(args.algorithm in algorithms)) {
        throw new Error("Unknown algorithm")
    }

    firstDraw()

    terminal.scroll()

    await sleep(1000)

    await algorithms[args.algorithm]()

    await endAnimation()

    unmark()

}, {
    description: "display a sorting algorithm",
    args: {
        "?algorithm": "the algorithm to display",
        "?n:n:10~1000": "the number of elements to sort",
        "?speed:n:0~100": "the speed of the sorting algorithm",
        "?s": "silent mode (deactivate sound)"
    },
    standardVals: {
        algorithm: null,
        n: 20,
        speed: 1,
    }
})

terminal.addCommand("copy", async function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("Cannot copy a folder")
    await navigator.clipboard.writeText(file.content)
    terminal.printLine("Copied to Clipboard ✓")
}, {
    description: "copy the file content to the clipboard",
    args: {
        "file": "the file to copy"
    }
})

function g(n, k) {
    let a = Array.from(n.toString())
    let b = Array.from(n.toString())

    while (a.length < k)
        a.push("0")

    while (b.length < k)
        b.push("0")

    let c = 1

    a = a.sort().join("")
    b = b.sort((a, b) => b - a).join("")

    let m = b - a

    if (n === m || m === 0)
        return c

    return c + g(m, k)
}

terminal.addCommand("kaprekar", async function(args) {
    let startNumber = ~~args.n
    let numDigits = startNumber.toString().length

    let history = new Set([startNumber])

    function f(n) {
        let a = Array.from(n.toString())
        let b = Array.from(n.toString())

        while (a.length < numDigits)
            a.push("0")

        while (b.length < numDigits)
            b.push("0")

        a = a.sort().join("")
        b = b.sort((a, b) => b - a).join("")

        let m = b - a

        terminal.printLine(`${b} - ${a} = ${stringPad(m, numDigits, "0")}`)

        if (n === m || m === 0)
            return n

        if (history.has(m)) {
            terminal.printLine("Cycle detected!")
            return m
        }

        history.add(m)

        return f(m)
    }

    f(startNumber)

}, {
    description: "display the kaprekar steps of a number",
    args: {
        "n:n:1~999999999": "the number to display the kaprekar steps of"
    }
})

terminal.addCommand("qr", async function(args) {
    
    let api = "https://chart.apis.google.com/chart?chs=500x500&cht=qr&chld=L&chl="
    let url = api + encodeURIComponent(args.text)

    terminal.addLineBreak()
    terminal.printImg(url)
    terminal.addLineBreak()

}, {
    description: "generate a qr code",
    args: {
        "*text": "the text to encode"
    }
})

function binom(n, k) {
    let res = 1
    for (let i = 1; i <= k; i++) {
        res *= n - k + i
        res /= i
    }
    return res
}

function binompdf(n, p, k) {
    return binom(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

function binomcdf(n, p, lower, upper) {
    let res = 0
    for (let i = lower; i <= upper; i++) {
        res += binompdf(n, p, i)
    }
    return res
}

terminal.addCommand("ncr", async function(args) {
    let n = ~~args.n
    let k = ~~args.k
    if (k > n) {
        throw new Error("k must be smaller than n")
    }
    terminal.printLine(binom(n, k))
}, {
    description: "calculate binomial distribution value",
    args: {
        "n:n:0~100": "the number of trials",
        "k:n:0~100": "the number of successes"
    }
})

terminal.addCommand("binompdf", async function(args) {
    let n = ~~args.n
    let k = ~~args.k
    if (k > n) {
        throw new Error("k must be smaller than n")
    }
    terminal.printLine(binompdf(n, args.p, k))
}, {
    description: "calculate binomial distribution value",
    args: {
        "n:n:0~100": "the number of trials",
        "p:n:0~1": "the probability of success",
        "k:n:0~100": "the number of successes"
    }
})

terminal.addCommand("binomcdf", function(args) {
    let n = ~~args.n
    let lower = ~~args.lower
    let upper = ~~args.upper
    terminal.printLine(binomcdf(n, args.p, lower, upper))
}, {
    description: "calculate the binomial cumulative distribution function",
    args: {
        "n:n:1~1000": "the number of trials",
        "p:n:0~1": "the probability of success",
        "lower:n:0~1000": "the lower bound",
        "upper:n:0~1000": "the upper bound"
    }
})

terminal.addCommand("pi", function(args) {
    let pi = "1415926535897932384626433832795028841971693993751058209749445923078164"
    pi += "0628620899862803482534211706798214808651328230664709384460955058223172535"
    pi += "9408128481117450284102701938521105559644622948954930381964428810975665933"
    pi += "4461284756482337867831652712019091456485669234603486104543266482133936072"
    pi += "6024914127372458700660631558817488152092096282925409171536436789259036001"
    pi += "1330530548820466521384146951941511609433057270365759591953092186117381932"
    pi += "6117931051185480744623799627495673518857527248912279381830119491298336733"
    pi += "6244065664308602139494639522473719070217986094370277053921717629317675238"
    pi += "4674818467669405132000568127145263560827785771342757789609173637178721468"
    pi += "4409012249534301465495853710507922796892589235420199561121290219608640344"
    pi += "1815981362977477130996051870721134999999837297804995105973173281609631859"
    pi += "5024459455346908302642522308253344685035261931188171010003137838752886587"
    pi += "5332083814206171776691473035982534904287554687311595628638823537875937519"
    pi += "577818577805321712268066130019278766111959092164201989"

    let digits = "3." + pi.slice(0, ~~args.n)
    terminal.printLine(digits)
}, {
    description: "calculate pi to the n-th digit",
    args: {
        "?n:n:1~1000": "the number of digits"
    },
    standardVals: {
        n: 100
    }
})

