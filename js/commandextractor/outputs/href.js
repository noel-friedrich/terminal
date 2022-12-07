terminal.addCommand("href", function(args) {
    if (!args.url.startsWith("http")) args.url = "https://" + args.url
    window.open(args.url, "_blank").focus()
}, {
    description: "open a link in another tab",
    args: ["url"]
})

