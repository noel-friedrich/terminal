terminal.addCommand("flappy", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({name: "Flappy Turtlo", fullscreen: args.f})

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT
    context.imageSmoothingEnabled = false
    
    const fps = 44

    let gameRunning = true

    const gravity = canvas.height / 700
    const jump = canvas.height / -40

    function clearCanvas() {
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    class Turtlo {

        constructor() {
            this.y = 0
            this.velY = 0
            this.imageSrc = "res/img/turtlo/walking-0.png"
            this.image = null
            this.imageX = 64
            this.dead = false
        }

        get rotation() {
            if (this.dead) return Math.PI
            return Math.min(Math.max(this.velY / 10, -1), 1) + Math.PI / 2
        }

        get points() {
            return [
                new Vector2d(this.x - this.imageX / 2, this.y - this.imageY / 2),
                new Vector2d(this.x + this.imageX / 2, this.y - this.imageY / 2),
                new Vector2d(this.x + this.imageX / 2, this.y + this.imageY / 2),
                new Vector2d(this.x - this.imageX / 2, this.y + this.imageY / 2)
            ]
        }

        jump() {
            if (this.dead) return
            this.velY = jump
            if (!args.silent) {
                playFrequency(400, 100, 0.5)
                setTimeout(() => playFrequency(500, 50, 0.5), 50)
            }
        }

        get x() {
            return canvas.width * (1 / 5)
        }

        async loadImage() {
            let image = new Image()
            image.src = this.imageSrc
            await new Promise(resolve => image.onload = resolve)
            this.image = image
            this.imageY = this.imageX * (image.height / image.width)
        }

        update() {
            this.velY += gravity
            this.y += this.velY

            if (this.y > canvas.height) {
                this.y = canvas.height
                this.velY = 0
            }

            if (this.y < 0) {
                this.y = 0
                this.velY = 0
            }

            if (this.dead && this.y == canvas.height) {
                gameRunning = false
            }
        }

        draw() {
            context.save()
            context.translate(this.x, this.y)
            context.rotate(this.rotation)
            context.drawImage(this.image, -this.imageX / 2, -this.imageY / 2, this.imageX, this.imageY)
            context.restore()
        }

        die() {
            this.dead = true
            if (!args.silent)
                playFrequency(300, 1000)
        }

    }

    const turtlo = new Turtlo()
    await turtlo.loadImage()

    class Wall {

        generateHole() {
            this.holeStartRelative = Math.random()
            this.holeSizeRelative = 0.4
        }

        constructor(n) {
            this.number = n
            this.x = canvas.width
            this.generateHole()
            while (this.holeStartRelative + this.holeSizeRelative > 1) {
                this.generateHole()
            }
        }

        get velX() {
            return -4
        }

        get width() {
            return 100
        }

        get height() {
            return canvas.height
        }

        get holeStart() {
            return this.holeStartRelative * this.height
        }

        get holeSize() {
            return this.holeSizeRelative * this.height
        }

        get touching() {
            return turtlo.touching(this.x, this.y) || turtlo.touching(this.x, this.y + this.height)
        }

        update() {
            this.x += this.velX
        }

        draw() {
            context.fillStyle = "white"
            context.fillRect(this.x, 0, this.width, this.holeStart)
            context.fillRect(
                this.x,
                this.holeStart + this.holeSize,
                this.width,
                this.height
            )
        }

        drawNumber() {
            context.fillStyle = "white"
            context.font = "48px monospace"
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillText(this.number, this.x + this.width / 2, this.holeStart + this.holeSize / 2)
        }

        collision() {
            for (let point of turtlo.points) {
                if (point.x > this.x && point.x < this.x + this.width) {
                    if (point.y < this.holeStart || point.y > this.holeStart + this.holeSize) {
                        turtlo.die()
                    }
                }
            }
        }

    }

    let walls = []

    let wallSpawnCount = 0
    let wallSpawnInterval = 100
    let score = 0

    const intervalKey = setInterval(() => {
        if (!gameRunning)
            return

        clearCanvas()

        for (let wall of walls) {
            wall.update()
            wall.drawNumber()
        }

        turtlo.update()
        turtlo.draw()

        for (let wall of walls) {
            wall.draw()
            wall.collision()
        }

        wallSpawnCount++
        if (wallSpawnCount >= wallSpawnInterval) {
            walls.push(new Wall(score++))
            wallSpawnCount = 0
        }

        walls = walls.filter(wall => wall.x > -wall.width)
    }, 1000 / fps)

    addEventListener("keydown", e => {
        if (!gameRunning) return
        if (e.key == " ")
            turtlo.jump()
    })

    addEventListener("touchstart", e => {
        if (!gameRunning) return
        turtlo.jump()
    })

    terminal.onInterrupt(() => {
        terminalWindow.close()
        gameRunning = false
        clearInterval(intervalKey)
    })

    while (gameRunning) {
        await sleep(100)
    }

    terminalWindow.close()
    clearInterval(intervalKey)

    terminal.printLine(`Your score: ${score}`)
    await HighscoreApi.registerProcess("flappy")
    await HighscoreApi.uploadScore(score)

}, {
    description: "play a game of flappy turtlo",
    args: {
        "?f=fullscreen:b": "fullscreen",
        "?s=silent:b": "silent mode"
    },
    isGame: true
})