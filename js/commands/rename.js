terminal.addCommand("rename", async function(args) {
    if (!terminal.isValidFileName(args.name))
        throw new Error("invalid file name")

    if (terminal.fileExists(args.name))
        throw new Error("file already exists in folder")

    let file = terminal.getFile(args.file)
    if (terminal.rootFolder.id == file.id)
        throw new Error("cannot rename root folder")
    let renamingCurrentFolder = file.id == terminal.currFolder.id
    delete file.parent.content[file.name]
    file.parent.content[args.name] = file
    terminal.log(`renamed ${file.path} to ${args.name}`)
    file.name = args.name

    if (renamingCurrentFolder) {
        terminal.fileSystem.currPath = file.pathArray
    }

    await terminal.fileSystem.reload()
}, {
    description: "rename a file or folder",
    args: {
        "file": "the file or folder to rename",
        "name": "the new name of the file or folder"
    }
})