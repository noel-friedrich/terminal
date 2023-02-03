terminal.addCommand("href", function(args) {
    if (!args.url.includes(".")) args.url = `noel-friedrich.de/${args.url}`
    if (!args.url.startsWith("http")) args.url = "https://" + args.url
    terminal.window.open(args.url, "_blank").focus()
}, {
    description: "open a link in another tab",
    args: {
        "url": "url to open"
    }
})

