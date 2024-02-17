terminal.addCommand("mkdir", async function(args) {
    if (!terminal.isValidFileName(args.name))
        throw new Error("Invalid filename")
    if (terminal.fileExists(args.name))
        throw new Error("File/Directory already exists")

    let newFolder = new DirectoryFile().setName(args.name)
    terminal.currDirectory.addChild(newFolder)
    terminal.printLine(`Created ${newFolder.path}`)
}, {
    description: "create a new directory",
    args: {
        "name:s": "name for your shiny new directory"
    }
})

