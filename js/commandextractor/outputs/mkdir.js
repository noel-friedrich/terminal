terminal.addCommand("mkdir", function(args) {
    if (args.directory_name.match(/[\\\/\.\s]/))
        throw new Error("File may not contain '/' or '\\'")
    if (terminal.fileExists(args.directory_name))
        throw new Error("File/Directory already exists")
    let newFolder = new FileElement(FileType.FOLDER, {})
    terminal.currFolder.content[args.directory_name] = newFolder
    terminal.printLine(`Created ${terminal.pathAsStr + args.directory_name}/`)
}, {
    description: "create a new directory",
    args: ["directory_name"]
})

