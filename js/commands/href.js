terminal.addCommand("href", function(args) {
    function href(url) {
        if (!url.includes(".")) url = `noel-friedrich.de/${url}`
        if (!url.startsWith("http")) url = "https://" + url
        terminal.window.open(url, "_blank").focus()
    }

    if (args.url && args.file) {
        throw new Error("Too many arguments provided. Please provide either a url or a file.")
    }

    if (args.url) {
        href(args.url)
    } else if (args.file) {
        let file = terminal.getFile(args.file, FileType.PROGRAM)
        href(file.content)
    } else {
        throw new Error("Please provide either a url or a file.")
    }
}, {
    description: "open a link in another tab",
    args: {
        "?u=url:s": "url to open",
        "?f=file:s": "file to open"
    }
})

