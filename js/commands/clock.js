terminal.addCommand("clock", async function(args) {
    let displayMillis = !!args.m
    let gridSize = {
        x: 20*1.9,
        y: 20
    }
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))
    let containerDiv = null
    function printGrid() {
        const customColors = {
            "x": Color.COLOR_1,
            "#": Color.WHITE,
            "w": Color.ORANGE,
            ".": Color.rgb(50, 50, 50),
            "o": Color.LIGHT_GREEN,
            "s": Color.hex("a4a4c7")
        }
        let prevContainerDiv = containerDiv
        let tempNode = terminal.parentNode
        terminal.parentNode = document.createElement("div")
        containerDiv = terminal.parentNode
        tempNode.appendChild(containerDiv)
        terminal.printLine()
        for (let row of grid) {
            for (let item of row) {
                if (Object.keys(customColors).includes(item)) {
                    terminal.print(item, customColors[item])
                } else {
                    terminal.print(item)
                }
            }
            terminal.printLine()
        }
        if (prevContainerDiv) prevContainerDiv.remove()
        terminal.parentNode = tempNode
    }
    function drawIntoGrid(x, y, v) {
        let gridX = Math.round((x - -1) / (1 - -1) * (gridSize.x - 1))
        let gridY = Math.round((y - -1) / (1 - -1) * (gridSize.y - 1))
        if (gridX < 0 || gridX >= gridSize.x || gridY < 0 || gridY >= gridSize.y) {
            return
        }
        grid[gridSize.y - 1 - gridY][gridX] = v
    }
    function drawCircle(val, radius=1) {
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            let x = Math.sin(t) * radius
            let y = Math.cos(t) * radius
            drawIntoGrid(x, y, val)
        }
    }
    function drawLine(angle, val, maxVal=1) {
        for (let t = 0; t < maxVal; t += 0.01) {
            let x = Math.sin(angle * Math.PI * 2) * t
            let y = Math.cos(angle * Math.PI * 2) * t
            drawIntoGrid(x, y, val)
        }
    }
    function update() {
        let date = new Date()
        let mins = date.getHours() * 60 + date.getMinutes()
        for (let r = 0; r < 1; r += 0.05) {
            drawCircle(".", r)
        }
        drawCircle("#")
        if (displayMillis)
            drawLine(date.getMilliseconds() / 1000, "s", 0.9)
        drawLine((mins % 720) / 720, "w", 0.75)
        drawLine(date.getMinutes() / 60, "x", 0.9)
        drawLine(date.getSeconds() / 60, "o", 0.9)
        printGrid()
        terminal.scroll("auto")
    }
    while (true) {
        update()
        await sleep(displayMillis ? 40 : 1000)
    }
}, {
    description: "display a clock",
    args: {
        "?m=millis:b": "display milliseconds"
    }
})

