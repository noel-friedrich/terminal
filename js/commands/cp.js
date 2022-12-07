terminal.addCommand("cp", async function(args) {
    let file = terminal.getFile(args.file)
    if (["..", "-"].includes(args.directory)) {
        if (terminal.currFolder == terminal.rootFolder)
            throw new Error("You are already at ground level")
        var directory = terminal.currFolder.parent
    } else if (["/", "~"].includes(args.directory)) {
        var directory = terminal.rootFolder
    } else {
        var directory = terminal.getFile(args.directory, FileType.FOLDER)
    }
    directory.content[file.name] = file.copy()
    await terminal.fileSystem.reload()
}, {
    description: "copy a file",
    args: ["file", "directory"]
})

