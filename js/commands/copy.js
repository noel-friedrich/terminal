terminal.addCommand("copy", async function(args) {
    let file = terminal.getFile(args.file)
    if (file.isDirectory)
        throw new Error("Cannot copy a folder")
    await terminal.copy(file.content)
    terminal.printLine("Copied to Clipboard ✓")
}, {
    description: "copy the file content to the clipboard",
    args: {
        "file": "the file to copy the content of"
    }
})