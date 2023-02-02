terminal.addCommand("du", function(args) {
    let fileNames = []
    let fileSizes = []
    let totalSize = 0
    function getSizeStr(size) {
        if (size < 10 ** 3) return `${size}B`
        if (size < 10 ** 6) return `${Math.ceil(size / 1024)}kB`
        return `${Math.ceil(size / (1024 ** 2))}mB`
    }
    let targetFolder = terminal.getFile("")
    if (args.folder) {
        targetFolder = terminal.getFile(args.folder)
    }
    for (let [fileName, file] of Object.entries(targetFolder.content)) {
        let fileContent = JSON.stringify(file.toJSON())
        totalSize += fileContent.length
        let fileSize = getSizeStr(fileContent.length)
        if (file.type == FileType.FOLDER)
            fileName += "/"
        fileNames.push(fileName)
        fileSizes.push(fileSize)
    }
    fileNames.unshift("TOTAL")
    fileSizes.unshift(getSizeStr(totalSize))
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
        "?folder": "folder to display storage of"
    },
})

