terminal.addCommand("pi-blocks", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    function loadSound(url) {
        return new Promise((resolve, reject) => {
            const audio = terminal.document.createElement("audio")
            audio.src = url
            audio.style.display = "none"
            terminal.parentNode.appendChild(audio)
            audio.addEventListener('canplaythrough', () => resolve(audio), { once: true })
            audio.addEventListener('error', err => {
                reject(err)
            }, { once: true })
        })
    }

    const tickAudios = []
    const numTickAudios = 10
    try {
        for (let i = 0; i < numTickAudios; i++) {
            tickAudios.push(await loadSound("./res/sounds/tick.mp3"))
        }
        terminal.printLine("Loaded audios.")
    } catch (e) {
        console.error(e)
        terminal.printError("Couldn't load audios.")
    }

    let tickSoundIndex = 0
    function tickSound() {
        const audio = tickAudios[(tickSoundIndex++) % numTickAudios]
        if (audio) audio.play()
    }

    let terminalWindow = terminal.modules.window.make({
        name: "Simulathon Challenge Colliding Blocks", fullscreen: true
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const canvasSize = () => new Vector2d(canvas.width, canvas.height)

    let gameRunning = true
    let collisionCount = 0

    const updatesPerFrame = 1000

    terminal.onInterrupt(() => {
        gameRunning = false
        terminalWindow.close()
    })

    function drawBackground() {
        context.fillStyle = "white"
        const size = canvasSize()
        context.fillRect(0, 0, size.x, size.y)
    }

    function worldPosToScreenPos(pos) {
        pos = new Vector2d(pos.x, pos.y * -1)
        const screen = canvasSize()
        pos = pos.add(new Vector2d(0.1, 0.6))
        return new Vector2d(pos.x * screen.x, pos.y * screen.y)
    }

    function drawTextAt(text, pos, size) {
        const fontSize = canvasSize().y * size
        context.font = `${fontSize}px serif`
        const screenPos = worldPosToScreenPos(pos)
        context.textBaseline = "middle"
        context.textAlign = "left"
        context.fillStyle = "black"
        context.fillText(text, screenPos.x, screenPos.y)
    }

    const initialSpeed = 0.0015 * args.speed / updatesPerFrame

    const collisionPoints = []
    const collisionPointSpeeds = []

    class Cube {

        constructor(pos, vel, weight, size, color) {
            this.pos = pos
            this.vel = vel
            this.weight = weight
            this.size = size
            this.color = color
            this.hasCollided = false
        }

        get corners() {
            return [
                this.pos.add(new Vector2d(0, 0)),
                this.pos.add(new Vector2d(this.size.x, 0)),
                this.pos.add(new Vector2d(this.size.x, this.size.y)),
                this.pos.add(new Vector2d(0, this.size.y)),
                this.pos.add(new Vector2d(0, 0)),
            ]
        }

        render() {
            context.fillStyle = this.color
            context.strokeStyle = "black"
            
            context.beginPath()
            let i = 0
            for (const corner of this.corners) {
                const screenPos = worldPosToScreenPos(corner)
                if (i == 0) {
                    context.moveTo(screenPos.x, screenPos.y)
                } else {
                    context.lineTo(screenPos.x, screenPos.y)
                }
                i++
            }
            
            const lastScreenPos = worldPosToScreenPos(this.corners[3])
            context.lineTo(lastScreenPos.x, lastScreenPos.y)

            context.fill()
            context.stroke()
        }

        update(otherCubes) {
            this.pos.iadd(this.vel)
            if (this.pos.x < 0) {
                this.vel.x *= -1
                collisionCount++
                tickSound()
                collisionPoints.push(this.pos.x)
                collisionPointSpeeds.push(this.vel.length)
            }

            for (const cube of otherCubes) {
                if (this.collides(cube)) {
                    this.calcCollision(cube)
                }
            }
        }

        calcCollision(other, e=1.0) {
            if (this.hasCollided) {
                return
            }

            const velPrime = (this.vel.x * (this.weight - e * other.weight) + 2 * other.weight * other.vel.x) / (this.weight + other.weight)
            other.vel.x = (other.vel.x * (other.weight - e * this.weight) + 2 * this.weight * this.vel.x) / (this.weight + other.weight)
            this.vel.x = velPrime

            this.hasCollided = true
            other.hasCollided = true
            collisionCount++
            collisionPoints.push(this.pos.x)
            collisionPointSpeeds.push(this.vel.length)
            tickSound()
        }

        getMinX() {
            return this.pos.x
        }

        getMaxX() {
            return this.pos.x + this.size.x
        }

        collides(otherCube) {
            const minSelfX = this.getMinX()
            const maxSelfX = this.getMaxX()
            const minOtherX = otherCube.getMinX()
            const maxOtherX = otherCube.getMaxX()

            return (minOtherX >= minSelfX && minOtherX <= maxSelfX) || (maxOtherX >= minSelfX && maxOtherX <= maxSelfX) 
        }

    }

    const widthFactor = 1 / (canvasSize().x / canvasSize().y)

    const cubes = [
        new Cube(new Vector2d(0.1, 0), new Vector2d(0, 0), 1, new Vector2d(0.1 * widthFactor, 0.1), "red"),
        new Cube(new Vector2d(0.5, 0), new Vector2d(-initialSpeed, 0), args.factor, new Vector2d(0.2 * widthFactor, 0.2), "blue")
    ]

    const backgroundLines = [
        [new Vector2d(0, 0), new Vector2d(1, 0)],
        [new Vector2d(0, 0), new Vector2d(0, 0.35)]
    ]

    function update() {
        for (const cube of cubes) {
            cube.update(cubes.filter(c => c !== cube))
        }
        for (const cube of cubes) {
            cube.hasCollided = false
        }
    }

    function draw() {
        context.lineWidth = 1

        for (const [start, end] of backgroundLines) {
            const startScreen = worldPosToScreenPos(start)
            const endScreen = worldPosToScreenPos(end)
            context.beginPath()
            context.moveTo(startScreen.x, startScreen.y)
            context.lineTo(endScreen.x, endScreen.y)
            context.strokeStyle = "black"
            context.stroke()
        }

        for (const cube of cubes) {
            cube.render()
        }

        let i = 0
        for (const point of collisionPoints) {
            const start = new Vector2d(point, 0)
            const end = new Vector2d(point, - collisionPointSpeeds[i] * 3000)


            const startScreen = worldPosToScreenPos(start)
            const endScreen = worldPosToScreenPos(end)
            context.beginPath()
            context.moveTo(startScreen.x, startScreen.y)
            context.lineTo(endScreen.x, endScreen.y)
            context.strokeStyle = "red"
            context.stroke()

            i++
        }

        drawTextAt(`${collisionCount} collisions`, new Vector2d(0.015, 0.3), 0.05)
    }

    function loop() {
        drawBackground()
        draw()

        for (let i = 0; i < updatesPerFrame; i++) {
            update()
        }

        if (gameRunning)
            terminal.window.requestAnimationFrame(loop)
    }

    loop()
    while (gameRunning) {
        await terminal.sleep(100)
    }

}, {
    description: "simulate the bouncy blocks from 3b1b",
    args: {
        "f=factor:i": "the factor of the two blocks",
        "?s=speed:n:0~10": "the speed factor"
    },
    defaultValues: {
        speed: 1
    }
})