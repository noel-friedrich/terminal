terminal.addCommand("background", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.background = OG_BACKGROUND_COLOR
        return
    }
    terminal.background = args.color
}, {
    description: "change the background color of the terminal",
    args: ["color"]
})

const OG_FOREGROUND_COLOR = "rgb(255, 255, 255)"
