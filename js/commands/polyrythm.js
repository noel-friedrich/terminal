terminal.addCommand("polyrythm", async function(args) {
    if (!args.numbers.match(/^(?:\d+\s)*\d+$/)) {
        terminal.printLine(`Example Use: "polyrythm 3 4 5"`)
        throw new Error("Invalid Numbers Format.")
    }

    let polyrythms = args.numbers.split(" ").map(s => parseInt(s))
    let polyrythmPrevSideProgress = polyrythms.map(() => 0)

    polyrythms.forEach(n => {
        if (n < 2) {
            throw new Error("Polyrythm cannot consist of numbers lower than 2")
        }
    })

    await terminal.modules.import("game", window)

    const canvas = printSquareCanvas({widthChars: 50})
    const context = canvas.getContext("2d")

    const canvasSize = new Vector2d(canvas.width, canvas.height)

    function circlePos(alpha, {
        radius=canvasSize.min * 0.4,
        offset=canvasSize.scale(0.5),
        applyOffset=true
    }={}) {
        alpha += Math.PI
        return new Vector2d(
            Math.sin(alpha) * radius + offset.x * applyOffset,
            Math.cos(alpha) * radius + offset.y * applyOffset
        )
    }

    function fillCircle(position, {
        radius=10,
    }={}) {
        context.beginPath()
        context.moveTo(...position.array)
        context.arc(...position.array, radius, 0, Math.PI * 2)
        context.fill()
    }

    function positionOnPolygon(numCorners, t) {
        let scaledT = t * numCorners
        let sideProgress = scaledT % 1
        let corner1Angle = Math.floor(scaledT) / numCorners * 2 * Math.PI
        let corner2Angle = Math.ceil(scaledT) / numCorners * 2 * Math.PI
        let corner1Pos = circlePos(corner1Angle)
        let corner2Pos = circlePos(corner2Angle)
        return [corner1Pos.lerp(corner2Pos, sideProgress), sideProgress]
    }

    function strokePolygon(numCorners) {
        context.beginPath()
        for (let i = 0; i <= numCorners; i++) {
            let alpha = i / numCorners * 2 * Math.PI
            let position = circlePos(alpha)
            if (i == 0) {
                context.moveTo(...position.array)
            } else {
                context.lineTo(...position.array)
            }
        }
        context.stroke()
    }

    context.strokeStyle = "white"
    context.fillStyle = "white"
    context.lineWidth = 2

    const startTime = Date.now()

    const noteFrequencies = [
        523.25,
        587.33,
        659.25,
        698.46,
        783.99,
        880.00,
        987.77,
        1046.50,
        1174.66,
        1318.51,
        1396.91,
        1567.98,
        1760.00,
        1975.53
    ]

    let running = true

    function redraw() {
        context.clearRect(0, 0, canvas.width, canvas.height)

        let t = ((Date.now() - startTime) % args.time) / args.time

        for (let i = 0; i < polyrythms.length; i++) {
            let corners = polyrythms[i]
            
            strokePolygon(corners)
            let [position, sideProgress] = positionOnPolygon(corners, t)
            let deltaSideProgress = Math.abs(sideProgress - polyrythmPrevSideProgress[i])
            fillCircle(position)

            if (deltaSideProgress > 0.5) {
                playFrequency(noteFrequencies[i % noteFrequencies.length], args.beepMs)
            }

            polyrythmPrevSideProgress[i] = sideProgress
        }

        if (running)
            requestAnimationFrame(redraw)
    }

    redraw()
    
    terminal.onInterrupt(() => running = false)

    terminal.scroll()

    while (running) {
        await sleep(1000)
    }
}, {
    description: "creates a polyrythm",
    args: {
        "*numbers": "numbers (e.g. \"3 4 5\")",
        "?t=time:n:10~99999": "time in miliseconds for full rotation",
        "?b=beepMs:n": "time in miliseconds that they beep for" 
    },
    defaultValues: {
        time: 4000,
        beepMs: 150
    }
})