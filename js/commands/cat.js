terminal.addCommand("cat", async function(args) {
    const file = terminal.getFile(args.file)

    if (file.name.toLowerCase() == "turtlo") {
        terminal.printLine("no, turtlo isn't a cat.\n")
        terminal.printEasterEgg("Turtlo-Cat-Egg")
        return
    }

    if (file.isDirectory) {
        throw new Error("Cannot read directory data")
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

    if (file.name == "passwords.json") {
        const favouriteUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        setTimeout(() => terminal.href(favouriteUrl), 1000)
        terminal.addLineBreak()
        terminal.printEasterEgg("Secret-Passwords-Egg")
    }
}, {
    description: "print file content",
    args: {
        "file:f": "file to display the content of"
    },
    category: "terminal-manipulation"
})