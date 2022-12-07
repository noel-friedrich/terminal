terminal.addCommand("mandelbrot", async function(args) {
    let gridSize = {x: 0, y: 0}
    gridSize.x = ~~(terminal.approxWidthInChars)
    gridSize.y = ~~(gridSize.x * 1 / 3)
    if (args.x) gridSize.x = ~~args.x
    if (args.y) gridSize.y = ~~args.y
    if (gridSize.y % 2 == 1) gridSize.y++

    let plotSize = {xmin: -1.85, xmax: 0.47, ymin: -0.95, ymax: 0.95}
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))

    let maxIteration = 1000

    function getPixelCoords(px, py) {
        let xDiff = plotSize.xmax - plotSize.xmin
        let x = plotSize.xmin + (px / gridSize.x) * xDiff
        let yDiff = plotSize.ymax - plotSize.ymin
        let y = plotSize.ymin + (py / gridSize.y) * yDiff
        return [x, y]
    }

    function calcPixel(px, py) {
        let [x0, y0] = getPixelCoords(px, py)
        let [x, y] = [0.0, 0.0]
        let i = 0
        for (; i < maxIteration; i++) {
            let temp = x**2 - y**2 + x0
            y = 2*x*y + y0
            x = temp
            if ((x**2 + y**2) >= 4)
                break
        }
        if (i == maxIteration)
            return "#"
        return "."
    }

    async function drawGrid() {
        let output = ""
        for (let y = 0; y < gridSize.y; y++) {
            for (let x = 0; x < gridSize.x; x++) {
                output += grid[y][x]
            }
            output += "\n"
        }
        terminal.printLine(output)
    }

    for (let y = 0; y < gridSize.y; y++) {
        for (let x = 0; x < gridSize.x; x++) {
            grid[y][x] = calcPixel(x, y)
        }
    }
    drawGrid()
}, {
    description: "draws the mandelbrot set",
    args: {
        "?x:i:10~1000": "width of the plot",
        "?y:i:10~1000": "height of the plot"
    }
})

