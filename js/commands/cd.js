terminal.addCommand("cd", function(args) {
    if (["-", ".."].includes(args.directory)) {
        if (terminal.fileSystem.currPath.length > 0) {
            terminal.fileSystem.currPath.pop()
            return
        } else {
            throw new Error("You are already at ground level")
        }
    } else if (["/", "~"].includes(args.directory)) {
        if (terminal.fileSystem.currPath.length > 0) {
            terminal.fileSystem.currPath = Array()
            terminal.updatePath()
            return
        } else {
            throw new Error("You are already at ground level")
        }
    }

    let targetFolder = terminal.getFile(args.directory, FileType.FOLDER)
    terminal.fileSystem.currPath = targetFolder.pathArray
    terminal.updatePath()
}, {
    helpVisible: true,
    args: {
        "directory": "the directory relative to your current path"
    },
    description: "change current directory",
})