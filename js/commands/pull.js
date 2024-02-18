terminal.addCommand("pull", async function(args) {
    if (terminal.fileExists(args.file))
        throw new Error("file already exists in folder")

    if (!terminal.isValidFileName(args.file))
        throw new Error("invalid file name")
    await terminal.modules.load("cliapi", terminal)
    let content = await terminal.modules.cliapi.pullFile(args.file)
    if (content == "undefined") {
        throw new Error("file does not exist on server")
    }

    try {
        let file = TerminalFile.fromObject(JSON.parse(content)).setName(args.file)
        terminal.currDirectory.addChild(file)
        terminal.printSuccess("pulled file from server")
    } catch (e) {
        console.error(e)
        throw new Error("pulled file is not a valid file")
    }
}, {
    description: "pull a file from the server",
    args: {
        "file": "file to pull"
    }
})