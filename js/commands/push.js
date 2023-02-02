terminal.addCommand("push", async function(args) {
    if (!terminal.isValidFileName(args.file))
        throw new Error("invalid file name")
    let file = terminal.getFile(args.file)
    let content = JSON.stringify(file.toJSON())

    await terminal.modules.load("cliapi", terminal)
    let result = await terminal.modules.cliapi.pushFile(args.file, content)
    if (result.ok) {
        terminal.printSuccess("pushed file to server")
    } else {
        throw new Error(result.error)
    }
}, {
    description: "push a file to the server",
    args: {
        "file": "file to push"
    }
})