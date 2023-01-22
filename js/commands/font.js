const OG_FONT = 

terminal.addCommand("font", function(args) {
    if (args.font.toLowerCase() == "reset") {
        terminal.data.font = terminal.data.getDefault("font")
        return
    }
    terminal.data.font = args.font
}, {
    description: "change the font of the terminal",
    args: ["*font"]
})
