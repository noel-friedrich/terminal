terminal.addCommand("longjump", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "LongJump", fullscreen: args.fullscreen
    })

    let canvas = terminalWindow.CANVAS
    let context = terminalWindow.CONTEXT

    let viewOffset = new Vector2d(0, 0)
    let desiredOffset = new Vector2d(0, 0)
    let groundHeight = 0.8

    function posToScreenPos(pos) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2

        return pos
            .add(viewOffset)
            .scale(meterScaleFactor)
            .add(new Vector2d(canvas.width / 2, canvas.height / 2))
    }

    function drawRect(position, size, color="white") {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2

        let drawPosition = posToScreenPos(position)
        context.fillStyle = color
        size = size.scale(meterScaleFactor)
        context.fillRect(drawPosition.x, drawPosition.y, size.x, size.y)
    }

    function drawLine(position1, position2, {
        color="white", width=0.01
    }={}) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition1 = posToScreenPos(position1)
        let drawPosition2 = posToScreenPos(position2)
        context.strokeStyle = color
        context.lineWidth = width * meterScaleFactor
        context.beginPath()
        context.moveTo(drawPosition1.x, drawPosition1.y)
        context.lineTo(drawPosition2.x, drawPosition2.y)
        context.stroke()
    }

    function drawText(position, text, {
        color="white", size=0.1, align="center", baseline="middle", bold=false
    }={}) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.fillStyle = color
        context.font = `${size * meterScaleFactor}px Courier New`
        context.textAlign = align
        context.textBaseline = baseline
        if (bold) {
            context.font = `bold ${context.font}`
        }
        context.fillText(text, drawPosition.x, drawPosition.y)
    }

    function drawCircle(position, radius, color="white") {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.fillStyle = color
        context.beginPath()
        context.arc(drawPosition.x, drawPosition.y, radius * meterScaleFactor, 0, Math.PI * 2)
        context.fill()
    }

    function drawCloud(position) {
        let random = mulberry32(Math.floor(position.x * 1000 + position.y * 1000))

        drawCircle(position, 0.1, "white")
        for (let i = 0; i < 10; i++) {
            let angle = random() * Math.PI * 2
            let offset = new Vector2d(
                Math.sin(angle) * 0.15,
                Math.cos(angle) * 0.05
            )
            drawCircle(position.add(offset), 0.1, "white")
        }
    }

    function updateViewOffset() {
        let diff = desiredOffset.sub(viewOffset)
        viewOffset = viewOffset.add(diff.scale(zoomSpeed))
    }

    let zoomSpeed = 0.1
    const gravityConstant = 0.0003
    const jumpEfficiency = 0.4

    class Player {

        constructor() {
            this.size = new Vector2d(0.08, 0.12)
            this.position = new Vector2d(0, 0)
            this.lastPosition = new Vector2d(0, 0)
            this.velocity = new Vector2d(0, 0)

            this.isSwinging = true
            this.swingAmplitude = 0.5
            this.swingLengthMs = 2000
            this.landed = false
        }

        jump() {
            this.isSwinging = false
            this.velocity = this.position.sub(this.lastPosition)
            zoomSpeed = 0.1
        }

        _drawBody() {
            drawRect(
                this.position.sub(this.size.scale(0.5)),
                this.size,
                "yellow"
            )
        }

        _drawScore() {
            drawText(
                new Vector2d(this.position.x, -0.1),
                `Your Score: ${this.score}`,
                {bold: true, color: "yellow"}
            )
            drawText(
                new Vector2d(this.position.x, 0.03),
                `Press Space to play again`,
                {color: "yellow"}
            )
            drawText(
                new Vector2d(this.position.x, 0.14),
                `Press Enter to upload your score`,
                {color: "yellow"}
            )
        }

        update() {
            this.lastPosition = this.position

            if (this.isSwinging) {
                let swingPosX = Date.now() / this.swingLengthMs % 1
                swingPosX = Math.sin(swingPosX * Math.PI * 2) * 0.7

                const posFromX = (x) => {
                    return new Vector2d(
                        Math.sin(x * Math.PI) * this.swingAmplitude,
                        Math.cos(x * Math.PI) * this.swingAmplitude
                    )
                }

                this.position = posFromX(swingPosX)
            } else if (!this.landed) {
                this.velocity.iadd(new Vector2d(0, gravityConstant))
                this.position = this.position.add(this.velocity)

                if (this.position.y > groundHeight) {
                    this.velocity = new Vector2d(this.velocity.x, -this.velocity.y).scale(jumpEfficiency)
                    this.position = new Vector2d(this.position.x, groundHeight)
                }

                if (this.velocity.length < 0.001) {
                    this.landed = true
                    zoomSpeed = 0.03
                }
            }
        }

        draw() {
            if (this.isSwinging) {
                this._drawBody()
                drawLine(this.position, new Vector2d(0, 0))
            } else if (!this.landed) {
                desiredOffset = this.position.scale(-1)
                this._drawBody()
            } else {
                desiredOffset = this.position.scale(-1).add(new Vector2d(0, 0.6))
                this._drawBody()
                this._drawScore()
            }
        }

        get score() {
            return Math.ceil(this.position.x * 10)
        }

    }

    let running = true
    let player = new Player()
    let randomSeed = Math.floor(Math.random() * 1000000)
    let selectedUpload = false

    const groundStartX = -20
    const groundWidth = 40

    function drawGround() {
        drawRect(
            new Vector2d(groundStartX, groundHeight),
            new Vector2d(groundWidth, 10),
        )

        for (let x = groundStartX; x < groundStartX + groundWidth; x += 0.04) {
            let grassHeight = Math.sin(x * 201) * 0.025 + 0.07
            drawLine(
                new Vector2d(x, groundHeight - grassHeight),
                new Vector2d(x, groundHeight)
            )
        }

        for (let x = groundStartX; x < groundStartX + groundWidth; x += 1) {
            drawText(
                new Vector2d(x, groundHeight + 0.1),
                `${x * 10}m`,
                {
                    color: "black"
                }
            )
        }
    }

    function drawSky() {
        let random = mulberry32(randomSeed)
        for (let x = groundStartX; x < groundStartX + groundWidth;) {
            x += random() * 2 + 1
            let cloudPosY = random() * -3
            drawCloud(new Vector2d(x, cloudPosY))
        }
    }

    function drawSwing() {
        drawLine(new Vector2d(0, 0), new Vector2d(0.4, groundHeight + 0.1), {
            width: 0.02
        })

        drawLine(new Vector2d(0, 0), new Vector2d(-0.4, groundHeight + 0.1), {
            width: 0.02
        })

        drawCircle(new Vector2d(0, 0), 0.03)

        drawText(new Vector2d(0, -0.7), "Press Space to jump", { color: "yellow", bold: true })
    }

    addEventListener("keydown", function(event) {
        if (!running) return

        if (event.key == " " && player.isSwinging) {
            player.isSwinging = false
            player.jump()
        }

        if (event.key == " " && player.landed) {
            player = new Player()
            zoomSpeed = 0.05
            desiredOffset = new Vector2d(0, 0)
        }

        if (event.key == "Enter" && player.landed) {
            selectedUpload = true
            running = false
        }
    })

    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height)

        drawGround()
        drawSky()
        drawSwing()
        player.update()
        player.draw()

        updateViewOffset()

        if (running) {
            requestAnimationFrame(gameLoop)
        }
    }

    gameLoop()

    terminal.onInterrupt(() => {
        running = false
        terminalWindow.close()
    })

    while (running) {
        await sleep(100)
    }

    terminalWindow.close()

    if (selectedUpload) {
        await HighscoreApi.registerProcess("longjump", {ask: false})
        await HighscoreApi.uploadScore(player.score)
    }
}, {
    description: "Play a game of longjump",
    isGame: true,
    args: {
        "?f=fullscreen:b": "Play in fullscreen"
    }
})