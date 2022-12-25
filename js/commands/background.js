const OG_BACKGROUND_COLOR = Color.rgb(3, 3, 6)

terminal.addCommand("background", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.data.background = OG_BACKGROUND_COLOR
        return
    }
    let color = parseColor(args.color)
    let distance = terminal.data.foreground.distanceTo(color)
    if (distance >= 80) {
        terminal.data.background = color
    } else {
        throw new Error("The background color is too close to the foreground color")
    }
}, {
    description: "change the background color of the terminal",
    args: ["color"]
})
