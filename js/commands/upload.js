terminal.addCommand("upload", async function() {
    await terminal.modules.load("upload", terminal)
    try {
        var [fileName, fileContent, isDataURL] = await terminal.modules.upload.file()
    } catch (e) {
        throw new Error("File Upload Failed")
    }
    let construct = TextFile
    if (isDataURL) {
        construct = DataURLFile
    }
    if (terminal.fileExists(fileName))
        throw new Error("file already exists in folder")
    const file = new (construct)(fileContent)
    file.setName(fileName)

    const fileSize = file.computeSize()

    const currSystemSize = terminal.rootFolder.computeSize()
    const maxSystemSize = terminal.data.storageSize
    const overdo = (fileSize + currSystemSize) - maxSystemSize
    if (overdo > 0) {
        terminal.print(`You have used up ${terminal.fileSystem.filesizeStr(currSystemSize)}`)
        terminal.print(`/${terminal.fileSystem.filesizeStr(maxSystemSize)} `)
        terminal.printLine(`(${Math.ceil(currSystemSize / maxSystemSize * 100)}%) of your storage.`)
        terminal.printLine(`Adding this file would exceed this limit by ${terminal.fileSystem.filesizeStr(overdo)}.`)
        throw new Error("File upload failed.")
    }

    terminal.currFolder.addFile(file)
    terminal.printLine(`upload finished (${terminal.fileSystem.filesizeStr(fileSize)})`)
    await terminal.fileSystem.reload()
}, {
    description: "upload a file from your computer"
})

