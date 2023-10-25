terminal.addCommand("scarpet", async function(args) {
	await terminal.modules.import("game", window)

	function initDisplay() {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let widthPx = Math.floor(terminal.charWidth * args.size)
        let heightPx = widthPx
        canvas.width = widthPx
        canvas.height = heightPx
        canvas.style.width = widthPx + "px"
        canvas.style.height = heightPx + "px"
        terminal.parentNode.appendChild(canvas)
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        terminal.addLineBreak()
        return [context, canvas]
	}

	const [context2d, canvas] = initDisplay()

    const possibleGoals = [
        new Vector2d(0, 0),
        new Vector2d(0.5, 0),
        new Vector2d(1, 0),
        new Vector2d(1, 0.5),
        new Vector2d(1, 1),
        new Vector2d(0.5, 1),
        new Vector2d(0, 1),
        new Vector2d(0, 0.5)
    ]

    function drawDot(position) {
        context2d.fillStyle = "black"
        context2d.fillRect(
            position.x * canvas.width,
            position.y * canvas.height,
            1, 1
        )
    }

    let currPosition = Vector2d.fromFunc(Math.random)
    for (let i = 0; true; i++) {
        const randomGoal = possibleGoals[Math.floor(Math.random() * 8)]
        const delta = randomGoal.sub(currPosition)
        currPosition.iadd(delta.scale(2 / 3))

        drawDot(currPosition)

        if (i % args.speed == 0) {
            await sleep(0)
        }
    }

}, {
	description: "draws the Sierpinski carpet using the chaos game",
    args: {
        "?s=speed:i:1~99999": "the speed of dots placed. The higher the faster.",
        "?size:i:10~1000": "size of output canvas in characters",
    },
    defaultValues: {
        speed: 30,
        size: 50
    }
})