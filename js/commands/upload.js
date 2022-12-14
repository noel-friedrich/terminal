terminal.addCommand("upload", async function() {
    await terminal.modules.load("upload", terminal)
    try {
        var [fileName, fileContent, isDataURL] = await terminal.modules.upload.file()
    } catch {
        throw new Error("File Upload Failed")
    }
    let construct = TextFile
    if (fileName.endsWith(".melody")) {
        construct = MelodyFile
    } else if (isDataURL) {
        construct = DataURLFile
    }
    if (terminal.fileExists(fileName))
        throw new Error("file already exists in folder")
    terminal.currFolder.content[fileName] = new (construct)(fileContent, {})
    terminal.printLine("upload finished.")
    await terminal.fileSystem.reload()
}, {
    description: "upload a file from your computer"
})

