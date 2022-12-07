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

