terminal.addCommand("upload", async function(args) {
    if (args.filename && !terminal.isValidFileName(args.filename)) {
        throw new Error("Invalid Filename")
    }

    await terminal.modules.load("upload", terminal)

    try {
        var [fileName, fileContent, isDataURL] = await terminal.modules.upload.file()
    } catch (e) {
        throw new Error("File Upload Failed")
    }

    let construct = PlainTextFile
    if (isDataURL) {
        construct = DataURLFile
    }

    if (args.filename) {
        fileName = args.filename
    }

    if (terminal.fileExists(fileName)) {
        terminal.printError(`File "${fileName}" already exists in this folder.`)
        while (true) {
            fileName = await terminal.prompt("A new filename: ")
            if (terminal.fileExists(fileName)) {
                terminal.printError(`File "${fileName}" also already exists in this folder.`)
            } else if (!terminal.isValidFileName(fileName)) {
                terminal.printError("Invalid Filename (Contains illegal characters or is too long)")
            } else {
                break
            }
        }
    }
    const file = new (construct)(fileContent)

    file.setName(fileName)

    const fileSize = file.computeSize()

    if (!terminal.fileSystem.inSessionMode) {
        const currSystemSize = terminal.rootDirectory.computeSize()
        const maxSystemSize = terminal.data.storageSize
        const overdo = (fileSize + currSystemSize) - maxSystemSize
        if (overdo > 0) {
            terminal.print(`You have used up ${terminal.fileSystem.filesizeStr(currSystemSize)}`)
            terminal.print(`/${terminal.fileSystem.filesizeStr(maxSystemSize)} `)
            terminal.printLine(`(${Math.ceil(currSystemSize / maxSystemSize * 100)}%) of your storage.`)
            terminal.printLine(`Adding this file would exceed this limit by >${terminal.fileSystem.filesizeStr(overdo)}.`)
            throw new Error("File upload failed.")
        }
    }

    terminal.rootDirectory.addChild(file)
    terminal.printLine(`File uploaded as ${file.path} (~${terminal.fileSystem.filesizeStr(fileSize)})`)
}, {
    description: "upload a file from your computer",
    args: {
        "?f=filename:s": "name of your shiny new uploaded file",
    }
})

