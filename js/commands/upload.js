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

    const fileSize = file.computeSize()

    terminal.currFolder.content[fileName] = file
    terminal.printLine(`upload finished (${fileSize / 1000}kb)`)
    await terminal.fileSystem.reload()
}, {
    description: "upload a file from your computer"
})

