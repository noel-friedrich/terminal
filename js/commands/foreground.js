const OG_FOREGROUND_COLOR = Color.rgb(255, 255, 255)

terminal.addCommand("foreground", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.data.foreground = OG_FOREGROUND_COLOR
        return
    }
    let color = parseColor(args.color)
    let distance = terminal.data.background.distanceTo(color)
    if (distance >= 80) {
        terminal.data.foreground = color
    } else {
        throw new Error("The foreground color is too close to the background color")
    }
}, {
    description: "change the foreground color of the terminal",
    args: {
        "color": "the color to change the foreground to"
    }
})