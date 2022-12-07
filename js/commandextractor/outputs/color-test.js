terminal.addCommand("color-test", function() {
    let size = {x: 68, y: 31}
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
                let color = `hsl(${hue}, 100%, ${lightness}%)`
                terminal.print("#", color)
            }
        }
        terminal.printLine()
    }
}, {description: "test the color capabilities of the terminal"})

addAlias("tree", "ls -r")

