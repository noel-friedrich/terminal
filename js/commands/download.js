terminal.addCommand("download", function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot download directory")
    downloadFile(file)
}, {
    description: "download a file",
    args: {"file:f": "the file to download"}
})