terminal.addCommand("cd", function(args) {
    let targetDir = terminal.getFile(args.directory, FileType.DIRECTORY)
    terminal.fileSystem.currDirectory = targetDir
    terminal.updatePath()
}, {
    helpVisible: true,
    args: {
        "directory:f": "the directory relative to your current path"
    },
    description: "change current directory",
})