terminal.addCommand("rmdir", async function(args) {
    let directory = terminal.getFile(args.directory, FileType.FOLDER)
    if (Object.keys(directory.content).length > 0) {
        let msg = "the selected directory isn't empty. Continue?"
        await terminal.acceptPrompt(msg, false)
    }
    delete directory.parent.content[directory.name]
    await terminal.fileSystem.reload()
}, {
    description: "remove a directory",
    args: ["directory"]
})

