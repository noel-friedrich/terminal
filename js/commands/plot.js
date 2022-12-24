terminal.addCommand("plot", async function(args) {
    await terminal.modules.load("mathenv", terminal)

    let equation = args.equation
    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(equation)) {
        terminal.printError("Invalid equation")
        terminal.printLine("Only numbers, x, *, +, -, ^, (, ), \\ and spaces are allowed")
        return
    }
    let gridSize = {
        x: 67,
        y: 30
    }
    while (/[0-9]x/g.test(equation))
        equation = equation.replace(/([0-9])x/g, "$1*x")
    while (/[0-9a-z\.]+\s*\^\s*[0-9a-z\.]+/g.test(equation))
        equation = equation.replace(/([0-9a-z\.]+)\s*\^\s*([0-9a-z\.]+)/g, "$1**$2")
    let jsEnv = await terminal.modules.load("mathenv", terminal)
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))
    let viewBound = {
        x: {min: args.xmin, max: args.xmax},
        y: {min: args.ymin, max: args.ymax}
    }
    if (viewBound.x.min >= viewBound.x.max || viewBound.y.min >= viewBound.y.max) {
        terminal.printError("Invalid bounds!")
        return
    }

    function drawIntoGrid(x, y, v) {
        if (isNaN(x) || isNaN(y)) return
        let gridX = Math.round((x - viewBound.x.min) / (viewBound.x.max - viewBound.x.min) * (gridSize.x - 1))
        let gridY = Math.round((y - viewBound.y.min) / (viewBound.y.max - viewBound.y.min) * (gridSize.y - 1))
        if (gridX < 0 || gridX >= gridSize.x || gridY < 0 || gridY >= gridSize.y) {
            return
        }
        grid[gridSize.y - 1 - gridY][gridX] = v
    }
    async function drawGrid() {
        let tempText = ""
        let tempColor = new Color(-1, -1, -1)
        for (let y = 0; y < gridSize.y; y++) {
            for (let x = 0; x < gridSize.x; x++) {
                let color = Color.WHITE
                switch(grid[y][x]) {
                    case ".":
                        color = Color.rgb(100, 100, 100)
                        break
                    case "/":
                    case "#":
                    case "\\":
                    case "]":
                    case "[":
                        color = Color.COLOR_1
                }
                if (tempColor.eq(color)) {
                    tempText += grid[y][x]
                } else {
                    if (tempText) {
                        terminal.print(tempText, tempColor)
                    }
                    tempText = grid[y][x]
                    tempColor = color
                }
            }
            if (tempText) {
                terminal.print(tempText, tempColor)
                tempText = ""
            }
            terminal.printLine()
        }
    }
    for (let y = viewBound.y.min; y <= viewBound.y.max; y += (viewBound.y.max - viewBound.y.min) / (gridSize.y - 1)) {
        drawIntoGrid(0, y, "|")
    }
    for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1)) {
        drawIntoGrid(x, 0, "~")
    }
    for (let x = ~~(viewBound.x.min); x < viewBound.x.max; x++) {
        let axisVal = (String(x).length > 1) ? String(x).slice(-1) : String(x)
        for (let y = viewBound.y.min; y <= viewBound.y.max; y += (viewBound.y.max - viewBound.y.min) / (gridSize.y - 1)) {
            if (x == 0) break
            drawIntoGrid(x, y, ".")
        }
        drawIntoGrid(x, 0, axisVal)
    }
    for (let y = ~~(viewBound.y.min); y < viewBound.y.max; y++) {
        let axisVal = (String(y).length > 1) ? String(y).slice(-1) : String(y)
        for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1)) {
            if (y == 0) break
            drawIntoGrid(x, y, ".")
        }
        drawIntoGrid(0, y, axisVal)
    }
    drawIntoGrid(0, 0, "+")

    function f(x) {
        terminal.modules.mathenv.setValue("x", x)
        let [result, error] = terminal.modules.mathenv.eval(equation)
        if (error) {
            terminal.printError(error)
            return
        } else {
            return result
        }
    }

    function slope(f, x, accuracy=0.01) {
        let minY = f(x - accuracy)
        let maxY = f(x + accuracy)
        let diff = maxY - minY
        return diff / (accuracy * 2)
    }
    const symbols = [
        ["]", 10],
        ["/", 1.5],
        ["#", -1.5],
        ["\\", -10],
        ["[", -Infinity],
    ]
    let yValues = []
    for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1) / 5) {
        terminal.modules.mathenv.setValue("x", x)
        let [y, error] = terminal.modules.mathenv.eval(equation)
        if (error) {
            throw new Error(error)
        } else {
            let printSymbol = null
            let slopeVal = slope(f, x)
            for (let [symbol, minVal] of symbols) {
                if (slopeVal > minVal) {
                    printSymbol = symbol
                    break
                }
            }
            if (!isNaN(y))
                yValues.push(y)
            if (printSymbol != null)
                drawIntoGrid(x, y, printSymbol)
        }
    }
    await drawGrid()
    terminal.scroll()
    let playTime = args.playtime * 2
    function calcFrequency(y) {
        let maxFreq = 1000
        let minFreq = 200
        let yDiffBound = viewBound.y.max - viewBound.y.min
        let yDiffMin = y - viewBound.y.min
        let freqDiff = maxFreq - minFreq
        let freq = freqDiff * (yDiffMin / yDiffBound)
        return freq
    }
    let frequencies = []
    for (let y of yValues) {
        let frequency = calcFrequency(y)
        frequency = Math.max(50, frequency)
        frequency = Math.min(20000, frequency)
        frequencies.push(frequency)
    }
    let noteTime = playTime / frequencies.length
    for (let note of frequencies) {
        playFrequency(note, noteTime)
        await sleep(noteTime * 0.5)
    }
}, {
    description: "plot a mathematical function within bounds",
    args: {
        "equation": "the equation to plot",
        "?xmin:n:-1000~1000": "the minimum x value",
        "?xmax:n:-1000~1000": "the maximum x value",
        "?ymin:n:-1000~1000": "the minimum y value",
        "?ymax:n:-1000~1000": "the maximum y value",
        "?playtime:i:0~10000": "the time to play the sound for in milliseconds"
    },
    standardVals: {
        xmin: -3, xmax: 3.1,
        ymin: -3, ymax: 3.1,
        playtime: 2500
    }
})