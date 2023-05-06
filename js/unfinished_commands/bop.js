terminal.addCommand("bop", async function(args) {
    await terminal.modules.import("game", window)

    let canvasWidth = terminal.charWidth * 50

    const canvas = document.createElement("canvas")
    canvas.width = canvasWidth
    canvas.height = canvasWidth

    const context = canvas.getContext("2d")
    const canvasSize = new Vector2d(canvasWidth, canvasWidth)
    const canvasCenter = canvasSize.scale(0.5)

    const circlePos = (alpha, radius=canvasWidth*0.4) => {
        return canvasCenter.add(Vector2d.fromAngle(alpha).scale(radius))
    }

    const drawCircle = (alpha, radius=canvasWidth*0.4) => {
        const pos = circlePos(alpha, radius)
        context.beginPath()
        context.arc(pos.x, pos.y, 10, 0, 2 * Math.PI)
        context.fill()
    }

    let numCircles = 10

    let circleMaxMs = []
    for (let i = 0; i < numCircles; i++) {
        let maxMs = 4000 + i * 100
        circleMaxMs.push(maxMs)
    }

    terminal.parentNode.appendChild(canvas)

    const startTime = Date.now()

    while (true) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = "white"
        for (let i = 0; i < numCircles; i++) {
            let ms = (Date.now() - startTime) % circleMaxMs[i]
            let alpha = ms / circleMaxMs[i] * Math.PI * 2
            drawCircle(alpha)
        }
        await sleep(40)
    }
}, {
    description: "Make a bop!",
})