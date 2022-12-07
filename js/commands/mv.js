terminal.addCommand("mv", async function(args) {
    let file = terminal.getFile(args.file)
    if (["..", "-"].includes(args.directory)) {
        if (terminal.currFolder == terminal.rootFolder)
            throw new Error("You are already at ground level")
        var directory = terminal.currFolder.parent
    } else if (["/", "~"].includes(args.directory)) {
        var directory = terminal.rootFolder
    } else if ("." == args.directory) {
        var directory = terminal.currFolder
    } else {
        var directory = terminal.getFile(args.directory, FileType.FOLDER)
    }
    let fileCopy = file.copy()
    directory.content[file.name] = fileCopy
    fileCopy.parent = directory
    delete file.parent.content[file.name]
    await terminal.fileSystem.reload()
}, {
    description: "move a file",
    args: ["file", "directory"]
})

