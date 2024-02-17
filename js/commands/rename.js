terminal.addCommand("rename", async function(args) {
    if (!terminal.isValidFileName(args.name))
        throw new Error("invalid file name")

    if (terminal.fileExists(args.name))
        throw new Error("file already exists in folder")

    let file = terminal.getFile(args.file)
    if (terminal.rootDirectory.id == file.id)
        throw new Error("cannot rename root folder")

    file.setName(args.name)
}, {
    description: "rename a file or folder",
    args: {
        "file:f": "the file or folder to rename",
        "name:s": "the new name of the file or folder"
    }
})