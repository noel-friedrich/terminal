terminal.addCommand("logistic-map", async function(args) {
    const maxIterations = 100
    const startValue = 0.5
    const minR = args.min
    const maxR = args.max

    const Vector2d = (await terminal.modules.load("game", terminal)).Vector2d

    if (minR >= maxR) {
        throw new Error("max value must be greater than min value")
    }

    if (maxR - minR < 0.5) {
        throw new Error("span of values too small to plot")
    }
    
    const fieldSize = new Vector2d(args.w, args.h)

    let field = Array.from(Array(fieldSize.y), () => Array.from(Array(fieldSize.x), () => " "))

    function drawNumberLines() {
        for (let x = 0; x < 5; x++) {
            let xPos = Math.floor((x - minR) / (maxR - minR) * fieldSize.x)
            for (let y = 0; y < fieldSize.y; y++) {
                if (xPos < 0 || xPos >= fieldSize.x) continue
                field[y][xPos] = String(x)
            }
        }
    }

    function test(r) {
        let currVal = startValue
        for (let i = 0; i < maxIterations; i++) {
            currVal = r * currVal * (1 - currVal)
        }
        let findings = new Set()
        for (let i = 0; i < maxIterations; i++) {
            currVal = r * currVal * (1 - currVal)
            let rounded = Math.round(currVal * 10000) / 10000
            findings.add(rounded)
        }
        return Array.from(findings)
    }

    let ys = []
    for (let x = 0; x < fieldSize.x; x++) {
        let xVal = (x / fieldSize.x) * (maxR - minR) + minR
        ys.push(test(xVal))
    }

    let maxY = Math.max(...ys.flat()) + 0.1
    for (let x = 0; x < fieldSize.x; x++) {
        for (let yVal of ys[x]) {
            let y = Math.floor(yVal / maxY * fieldSize.y)
            let mirroredY = fieldSize.y - y - 1
            if (mirroredY < 0 || mirroredY >= fieldSize.y) continue
            field[mirroredY][x] = "#"
        }
    }

    for (let y = 0; y < field.length; y++) {
        let rowString = ""
        for (let x = 0; x < field[y].length; x++) {
            rowString += field[y][x]
        }
        terminal.printLine(rowString)
    }

}, {
    description: "draw the logistic map",
    args: {
        "?min:n:-2~4": "minimum R value",
        "?max:n:-2~4": "maximum R value",
        "?w:n:10~200": "width of display",
        "?h:n:5~100": "height of display"
    },
    standardVals: {
        min: 0,
        max: 4,
        w: 80,
        h: 20
    },
})

