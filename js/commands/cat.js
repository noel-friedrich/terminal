terminal.addCommand("cat", async function(args) {
    const specialCases = {
        "turtlo": "no, turtlo isn't a cat"
    }

    if (args.file in specialCases) {
        terminal.printLine(specialCases[args.file])
        return
    }

    function makeCatFunc(readFunc) {
        return async function(args) {
            let file = terminal.getFile(args.file)
            if (file.type == FileType.FOLDER) 
                throw new Error("Cannot read directory data")
            if (args.file.endsWith("passwords.json")) {
                let favoriteUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                setTimeout(() => terminal.href(favoriteUrl), 1000)
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

    let func = makeCatFunc((content, _, file) => {
        if (file.type == FileType.PROGRAM) {
            terminal.printLink(content, content)
        } else {
            terminal.printLine(content.trimEnd())
        }
    })
    await func(args)
}, {
    description: "print file content",
    args: {
        "file:f": "file to display the content of"
    }
})