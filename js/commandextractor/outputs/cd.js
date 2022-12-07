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

