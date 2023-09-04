terminal.addCommand("longjump", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    terminal.printLine("Loading Highscores...")

    let allHighscores = []
    try {
        allHighscores = await HighscoreApi.getHighscores("longjump")
    } catch (e) {
        terminal.log("Failed to load highscores.")
    }

    let turtloImage = new Image()
    turtloImage.src = "res/img/turtlo/walking-0.png"
    await new Promise((resolve) => {
        turtloImage.onload = resolve
    })

    let turtloImageLanded = new Image()
    turtloImageLanded.src = "res/img/turtlo/hidden.png"
    await new Promise((resolve) => {
        turtloImageLanded.onload = resolve
    })

    let terminalWindow = terminal.modules.window.make({
        name: "LongJump", fullscreen: args.fullscreen
    })

    let canvas = terminalWindow.CANVAS
    let context = terminalWindow.CONTEXT

    let viewOffset = new Vector2d(0, 0)
    let desiredOffset = new Vector2d(0, 0)
    let groundHeight = 0.8

    let touchModeActive = false

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
        color="white", size=0.1, align="center", baseline="middle", bold=false, rotation=0
    }={}) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.save()
        context.translate(drawPosition.x, drawPosition.y)
        context.rotate(rotation)
        context.fillStyle = color
        context.font = `${bold ? "bold " : ""}${size * meterScaleFactor}px sans-serif`
        context.textAlign = align
        context.textBaseline = baseline
        context.fillText(text, 0, 0)
        context.restore()
    }

    function drawCircle(position, radius, color="white") {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.fillStyle = color
        context.beginPath()
        context.arc(drawPosition.x, drawPosition.y, radius * meterScaleFactor, 0, Math.PI * 2)
        context.fill()
    }

    function drawCloud(position, color) {
        let random = mulberry32(Math.floor(position.x * 1000 + position.y * 1000))

        drawCircle(position, 0.1, color)
        for (let i = 0; i < 10; i++) {
            let angle = random() * Math.PI * 2
            let offset = new Vector2d(
                Math.sin(angle) * 0.15,
                Math.cos(angle) * 0.05
            )
            drawCircle(position.add(offset), 0.1, color)
        }
    }

    function drawImage(position, size, image, rotation=0) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.save()
        context.translate(drawPosition.x, drawPosition.y)
        context.rotate(rotation)
        let sizeX = size * meterScaleFactor
        let sizeY = (size * image.height / image.width) * meterScaleFactor
        context.imageSmoothingEnabled = false
        context.drawImage(
            image,
            -sizeX / 2,
            -sizeY / 2,
            sizeX,
            sizeY
        )
        context.restore()
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
            this.size = 0.2
            this.position = new Vector2d(0, 0)
            this.velocity = new Vector2d(0, 0)

            this.isSwinging = true
            this.swingAmplitude = 0.5
            this.swingLengthMs = 2000
            this.landed = false
            this._lastPosition = null

            this.spawnTime = Date.now()
        }

        get canJump() {
            if (this.isSwinging) {
                let msSinceSpawn = Date.now() - this.spawnTime
                if (msSinceSpawn > 1000) {
                    return true
                }
            }
            return false
        }

        get lastPosition() {
            if (!this._lastPosition) return this.position
            return this._lastPosition
        }

        jump() {
            this.isSwinging = false

            let swingPosX = Date.now() / this.swingLengthMs % 1
            swingPosX = Math.cos(swingPosX * Math.PI * 2) * 0.7
            let speed = Math.abs(swingPosX)

            function gaussianRandom(mean=0, stdev=1) {
                const u = 1 - Math.random()
                const v = Math.random()
                const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
                return z * stdev + mean
            }

            let randomFactor = gaussianRandom(1, 0.05)

            this.velocity = this.position.sub(this.lastPosition).normalized.scale(0.1 * speed * randomFactor)
            zoomSpeed = 0.1
        }

        _drawBody() {
            drawImage(
                this.position,
                this.size,
                this.landed ? turtloImageLanded : turtloImage,
                this.angle + Math.PI / 2 * 3
            )
        }

        get angle() {
            if (!this.lastPosition) return 0
            if (this.landed) return Math.PI / 2 * 3
            return this.position.angleTo(this.lastPosition)
        }

        _drawScore() {
            drawText(
                new Vector2d(this.position.x, -0.1),
                `Your Score: ${this.score}`,
                {bold: true, color: "yellow"}
            )
            drawText(
                new Vector2d(this.position.x, 0.03),
                touchModeActive ? `Tap to restart` : `Press Space to play again`,
                {color: "yellow"}
            )
            drawText(
                new Vector2d(this.position.x, 0.14),
                touchModeActive ? `Swipe to upload score` : `Press Enter to upload your score`,
                {color: "yellow"}
            )
        }

        update() {
            this._lastPosition = this.position

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
                particles.push(new FlyParticle(this.position))
            } else if (!this.landed) {
                this.velocity.iadd(new Vector2d(0, gravityConstant))
                this.position = this.position.add(this.velocity)

                if (this.position.y > groundHeight) {
                    this.velocity = new Vector2d(this.velocity.x, -this.velocity.y).scale(jumpEfficiency)
                    this.position = new Vector2d(this.position.x, groundHeight)
                    spawnExplosion(this.position.add(new Vector2d(0, -0.01)), this.velocity.length * 20)
                }

                if (this.velocity.length < 0.001 && Math.abs(this.position.y - groundHeight) < 0.01) {
                    this.landed = true
                    zoomSpeed = 0.03
                }

                particles.push(new FlyParticle(this.position))
            }
        }

        draw() {
            if (this.isSwinging) {
                drawLine(this.position, new Vector2d(0, 0))
                this._drawBody()
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

    class Particle {

        constructor(position) {
            this.color = [
                "#90ed68",
                "#7ae34d",
                "#4e9131"
            ][Math.floor(Math.random() * 3)]
            this.position = position
            let sizeFactor = Math.random() * 0.02 + 0.01
            this.size = new Vector2d(sizeFactor, sizeFactor)
            this.velocity = new Vector2d(Math.random() - 0.5, Math.random() - 0.5).scale(0.005)
            this.readyToDie = false
        }

        get volume() {
            return this.size.x * this.size.y
        }

        update() {
            this.velocity.iadd(new Vector2d(0, gravityConstant * this.volume * 1000).scale(3))
            this.position.iadd(this.velocity)
            if (this.position.y > groundHeight) {
                this.readyToDie = true
            }
        }

        draw() {
            if (this.readyToDie) return
            drawRect(this.position.add(this.size.scale(-0.5)), this.size, this.color)
        }

    }

    class FlyParticle extends Particle {

        constructor(position) {
            super(position)
            this.velocity = new Vector2d(0, 0)
            this.color = "#90ed68"
            this.originalSize = 0.03
            this.originalDieCounter = 25
            this.size = new Vector2d(this.originalSize, this.originalSize)
            this.dieCounter = this.originalDieCounter
        }

        update() {
            this.dieCounter--
            if (this.dieCounter < 0) {
                this.readyToDie = true
            }

            let sizeDecrease = -1 / this.originalDieCounter * this.originalSize
            this.size.iadd(new Vector2d(sizeDecrease, sizeDecrease))
        }

    }

    function spawnExplosion(position, strength=1) {
        for (let i = 0; i < strength * 100; i++) {
            let particle = new Particle(position.copy())
            particle.velocity = Vector2d.fromAngle(Math.PI / -2 - 0.5 + Math.random()).scale(0.007)
            particles.push(particle)
        }
    }

    let running = true
    let player = new Player()
    let particles = []
    let randomSeed = Math.floor(Math.random() * 1000000)
    let selectedUpload = false

    const groundStartX = -20
    const groundWidth = 60

    function drawParticles() {
        for (let particle of particles) {
            particle.draw()
        }
        particles = particles.filter(p => !p.readyToDie)
    }

    function updateParticles() {
        for (let particle of particles) {
            particle.update()
        }
    }

    function drawGround() {
        drawRect(
            new Vector2d(groundStartX, groundHeight),
            new Vector2d(groundWidth, 10),
        )

        let randomGrassHeight = mulberry32(randomSeed + 100)
        for (let x = groundStartX; x < groundStartX + groundWidth;) {
            let grassHeight = randomGrassHeight() * 0.07 + 0.03
            drawLine(
                new Vector2d(x, groundHeight - grassHeight),
                new Vector2d(x, groundHeight),
                {color: "#7ae34d"}
            )

            if (randomGrassHeight() < 0.05) {
                // draw flower
                drawRect(
                    new Vector2d(x - 0.015, groundHeight - grassHeight - 0.015),
                    new Vector2d(0.03, 0.03),
                    [
                        "#ff0000",
                        "#ff00ff",
                        "#ffff00",
                        "#00ffff",
                        "#0000ff",
                        "#ff7f00"
                    ][Math.floor(randomGrassHeight() * 6)]
                )
            }

            x += randomGrassHeight() * 0.03 + 0.01
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

        let prevScore = -1
        for (let highscore of allHighscores) {
            if (highscore.score === prevScore) continue

            let x = highscore.score / 10
            drawText(
                new Vector2d(x, groundHeight + 0.15),
                `- ${highscore.name} (${highscore.score}m)`,
                {
                    color: "black",
                    rotation: Math.PI / 2,
                    size: 0.05,
                    align: "left"
                }
            )
            prevScore = highscore.score
        }
    }

    function drawSky() {
        let random = mulberry32(randomSeed)
        for (let x = groundStartX; x < groundStartX + groundWidth;) {
            x += random() * 2 + 1
            let cloudPosY = random() * -3
            drawCloud(new Vector2d(x, cloudPosY), "rgba(255, 255, 255, 0.5)")
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

        if (event.key == " " && player.canJump) {
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

    let touchStartPos = null

    addEventListener("touchstart", function(event) {
        if (!running) return

        let touch = event.touches[0] || event.changedTouches[0]
        touchStartPos = new Vector2d(
            touch.pageX,
            touch.pageY
        )

        touchModeActive = true

        if (player.canJump) {
            player.isSwinging = false
            player.jump()
        }
    })

    addEventListener("touchend", function(event) {
        if (touchStartPos == null || !player.landed) return

        let touch = event.touches[0] || event.changedTouches[0]
        let touchEndPos = new Vector2d(
            touch.pageX,
            touch.pageY
        )

        let delta = touchStartPos.sub(touchEndPos).length
        if (delta < 50) {
            if (player.landed) {
                player = new Player()
                zoomSpeed = 0.05
                desiredOffset = new Vector2d(0, 0)
            }
        } else {
            selectedUpload = true
            running = false
        }
    })

    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height)

        drawSky()
        updateParticles()
        drawParticles()
        drawGround()
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