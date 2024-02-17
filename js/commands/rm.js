terminal.addCommand("rm", async function(args) {
    let file = terminal.getFile(args.file)
    if (file == terminal.rootDirectory) {
        throw new Error("Cannot remove root directory!")
    }

    file.parent.deleteChild(file)

    let filePath = FilePath.from(terminal.data.path)
    if (!terminal.fileExists(filePath)) {
        terminal.fileSystem.currDirectory = terminal.fileSystem.root
        terminal.updatePath()
        terminal.printLine("You just cut an active filetree and have been moved back to root/")
    }
}, {
    description: "remove a file",
    args: {
        "file:f": "file to remove"
    }
})