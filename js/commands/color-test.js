terminal.addCommand("color-test", function(args) {
    let size = {x: args.size*2, y: args.size}
    for (let i = 0; i < size.y; i++) {
        for (let j = 0; j < size.x; j++) {
            let x = (j / size.x - 0.5) * 2
            let y = (i / size.y - 0.5) * 2
            if (x*x + y*y > 1) {
                terminal.print(" ")
            } else {
                let angle = Math.atan2(y, x) / Math.PI * 180
                let hue = Math.round(angle)
                let lightness = Math.round(90 - (x*x + y*y) * 90)
                terminal.print("#", Color.hsl(hue / 360, 1, lightness / 100))
            }
        }
        terminal.printLine()
    }
}, {
    description: "test the color capabilities of the terminal",
    args: {
        "?size:i:1~999": "the size of the test image"
    },
    defaultValues: {
        size: 60
    }
})