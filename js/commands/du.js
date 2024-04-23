terminal.addCommand("du", function(args) {
    let fileNames = []
    let fileSizes = []
    let totalSize = 0

    let targetFolder = terminal.getFile("")
    if (args.folder) {
        targetFolder = terminal.getFile(args.folder)
    }

    for (let file of targetFolder.children) {
        let fileBytes = file.computeSize()
        totalSize += fileBytes
        let fileSize = terminal.fileSystem.filesizeStr(fileBytes)

        let fileName = file.name
        if (file.type == FileType.FOLDER)
            fileName += "/"
        fileNames.push(fileName)
        fileSizes.push(fileSize)
    }
    
    fileNames.unshift("TOTAL")
    fileSizes.unshift(terminal.fileSystem.filesizeStr(totalSize))
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
    description: "display storage of current directory",
    args: {
        "?folder:f": "folder to display storage of"
    },
})