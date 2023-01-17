terminal.addCommand("mkdir", async function(args) {
    if (args.directory_name.match(/[\\\/\.\s]/))
        throw new Error("File may not contain '/' or '\\'")
    if (terminal.fileExists(args.directory_name))
        throw new Error("File/Directory already exists")
    let newFolder = new Directory({})
    terminal.currFolder.content[args.directory_name] = newFolder
    await terminal.fileSystem.reload()
    terminal.printLine(`Created ${terminal.fileSystem.pathStr}/${args.directory_name}/`)
}, {
    description: "create a new directory",
    args: ["directory_name"]
})

