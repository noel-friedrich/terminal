terminal.addCommand("curl", async function(args) {
    function corsError() {
        terminal.printError("Cross-origin requests are not allowed")
        terminal.print("What is ")
        terminal.printLink("CORS (Cross-Origin Resource Sharing)", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", undefined, false)
        terminal.printLine("?")
        terminal.printLine("You may only download files from a website that allows it.")
        terminal.print("If you are trying to download a file from a website that you own, you may need to ")
        terminal.printLink("enable CORS", "https://enable-cors.org/server.html", undefined, false)
        terminal.printLine(".")
        terminal.print("An example of a website that allows CORS is ")
        terminal.printLink("wikipedia.org", "https://wikipedia.org", undefined, false)
        terminal.printLine(".\n")
        terminal.printLine("It's also possible that the resource you are requesting does not exist.")
        terminal.printLine("> It may be worth checking the URL for typos.")
        throw new IntendedError()
    }

    try {
        var result = await fetch(args.url)
    } catch (e) {
        if (e instanceof TypeError) {
            corsError()
        } else {
            throw e
        }
    }

    if (result.status !== 200) {
        terminal.printError("Error: " + result.status)
        throw new IntendedError()
    }

    let contentType = result.headers.get("content-type")
    if (!contentType) {
        terminal.printError("No content type")
        throw new IntendedError()
    }

    let dataUrl = await result.blob()
    dataUrl = URL.createObjectURL(dataUrl)
    let fileName = args.url.split("/").pop()
    let file = new DataURLFile(dataUrl)

    if (terminal.fileExists(fileName))
        throw new Error("file already exists in folder")

    terminal.currFolder.content[fileName] = file
    await terminal.fileSystem.reload()

    terminal.printSuccess("download finished.") 
}, {
    description: "download a file from the internet",
    args: {
        "url:s": "the url to download the file from"
    },
    disableEqualsArgNotation: true
})