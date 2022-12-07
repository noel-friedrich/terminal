terminal.addCommand("mv", async function(args) {
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
    delete file.parent.content[file.name]
}, {
    description: "move a file",
    args: ["file", "directory"]
})

