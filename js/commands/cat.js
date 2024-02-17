terminal.addCommand("cat", async function(args) {
    const specialCases = {
        "turtlo": "no, turtlo isn't a cat"
    }

    if (args.file in specialCases) {
        terminal.printLine(specialCases[args.file])
        return
    }

    let file = terminal.getFile(args.file)

    if (file.isDirectory) {
        throw new Error("Cannot read directory data")
    }

    if (args.file.name == "passwords.json") {
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

    const isUrl = str => {
        try {
            new URL(str)
            return true
        } catch {
            return false  
        }
    }

    if (isUrl(file.content)) {
        terminal.printLink(file.content)
    } else {
        terminal.printLine(file.content)
    }
}, {
    description: "print file content",
    args: {
        "file:f": "file to display the content of"
    }
})