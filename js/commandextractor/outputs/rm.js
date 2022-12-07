terminal.addCommand("rm", async function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot remove directory. use 'rmdir' instead")
    delete file.parent.content[file.name]
}, {
    description: "remove a file",
    args: ["file"]
})

