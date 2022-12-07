terminal.addCommand("foreground", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.foreground = OG_FOREGROUND_COLOR
        return
    }
    terminal.foreground = args.color
}, {
    description: "change the foreground color of the terminal",
    args: ["color"]
})

