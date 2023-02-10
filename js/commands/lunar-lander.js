terminal.window.secretShip = null
terminal.addCommand("lunar-lander", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({name: "Lunar Lander", fullscreen: args.f})
    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT
    const clearWindow = () => context.clearRect(0, 0, canvas.width, canvas.height)

    const KEY = {
        UP_ARROW: "ArrowUp",
        LEFT_ARROW: "ArrowLeft",
        RIGHT_ARROW: "ArrowRight",
        UP: "up",
        DOWN: "down",
    }

    let levelFuels = [1000, 800, 600, 400, 200, 100]

    function getLevelFuel(level) {
        return levelFuels[Math.min(level, levelFuels.length - 1)]
    }

    const startTime = Date.now()

    const gravityConstant = 0.00001
    const gravity = new Vector2d(0, gravityConstant)

    class KeyListener {

        constructor() {
            this.keys = {}
            this.onCtrlCCallback = null
            this.onTouchStartCallback = null
            this.onTouchMoveCallback = null
            this.onTouchEndCallback = null

            function pos(event) {
                let rect = canvas.getBoundingClientRect()
                return new Vector2d(event.clientX - rect.left, event.clientY - rect.top)
            }

            function addListener(evt, callback) {
                addEventListener(evt, event => {
                    if (!game.running) return
                    return callback(event)
                })
            }

            this.keyup = addListener("keyup", event => {
                this.keys[event.key] = false
            })

            this.keydown = addListener("keydown", event => {
                if (Object.values(KEY).includes(event.key))
                    event.preventDefault()

                this.keys[event.key] = true

                if (event.key == "c" && event.ctrlKey) {
                    if (this.onCtrlCCallback != null)
                        this.onCtrlCCallback(event)
                }
            })

            this.touchDown = addListener("touchstart", event => {
                if (this.onTouchStartCallback != null) {
                    this.onTouchStartCallback(event, pos(event.touches[0]))
                }
            })

            this.touchMove = addListener("touchmove", event => {
                if (this.onTouchMoveCallback != null) {
                    this.onTouchMoveCallback(event, pos(event.touches[0]))
                }
            })

            this.touchUp = addListener("touchend", event => {
                if (this.onTouchEndCallback != null) {
                    this.onTouchEndCallback(event)
                    event.preventDefault()
                }
            })

            this.onContextMenu = addListener("contextmenu", event => {
                event.preventDefault()
            })

            this.upRules = {}
            this.downRules = {}
        }

        onCtrlC(callback) {
            this.onCtrlCCallback = callback
        }

        onTouchStart(callback) {
            this.onTouchStartCallback = callback
        }

        onTouchMove(callback) {
            this.onTouchMoveCallback = callback
        }

        onTouchEnd(callback) {
            this.onTouchEndCallback = callback
        }

        remove() {
            removeEventListener("keyup", this.keyup)
            removeEventListener("keydown", this.keydown)
            removeEventListener("touchstart", this.touchDown)
            removeEventListener("touchmove", this.touchMove)
            removeEventListener("touchend", this.touchUp)
            removeEventListener("contextmenu", this.onContextMenu)
        }

        isDown(key) {
            return this.keys[key] === true
        }

        isUp(key) {
            return !this.keys[key]
        }

        addRule(key, callback, type=undefined) {
            type ??= KEY.DOWN
            if (type == KEY.DOWN) {
                this.downRules[key] = callback
            } else if (type == KEY.UP) {
                this.upRules[key] = callback
            }
        }

        runRules() {
            for (let key in this.downRules) {
                if (this.isDown(key)) {
                    this.downRules[key]()
                }
            }
            for (let key in this.upRules) {
                if (this.isUp(key)) {
                    this.upRules[key]()
                }
            }
        }

        clearRules() {
            this.downRules = {}
            this.upRules = {}
        }

    }

    class Particle {

        constructor(x, y, ms=1000, color=null, vel) {
            this.pos = new Vector2d(x, y)
            this.velocity = vel ?? new Vector2d(0, 0)
            this.size = 2
            this.prevPos = this.pos.copy()

            this.ms = ms
            this.startTime = Date.now()
            this.c = color ?? {r: 255, g: 255, b: 255}
        }

        get alive() {
            return Date.now() - this.startTime < this.ms
        }

        get color() {
            let alpha = 1 - (Date.now() - this.startTime) / this.ms
            return `rgba(${this.c.r}, ${this.c.g}, ${this.c.b}, ${alpha})`
        }

        get realPos() {
            return this.pos.mul(new Vector2d(canvas.width, canvas.height))
        }

        update(deltaTime, landscape) {
            this.velocity.iadd(gravity.scale(deltaTime))
            this.pos.iadd(this.velocity.scale(deltaTime)
                .div(new Vector2d(canvas.width / canvas.height, 1)))

            if (landscape.checkCollision(this.realPos)) {
                let newAngle = this.velocity.angle + Math.PI
                let surfaceNormal = landscape.getSurfaceNormal(this.pos)
                let angleDiff = surfaceNormal.angle - newAngle
                this.velocity = Vector2d.fromAngle(newAngle)
                    .scale(this.velocity.length)
                    .rotate(-angleDiff * 2)
            } else {
                this.prevPos = this.pos.copy()
            }

        }

        draw(zoomPos) {
            context.fillStyle = this.color
            let pos = zoomPos(this.pos)
            let zoom = 1 / zoomPos("getZoomFactor")
            let size = this.size * zoom
            context.fillRect(pos.x - size / 2, pos.y - size / 2, size, size)
        }

    }

    class Player {

        constructor() {
            this.pos = new Vector2d(0.5, 0.1)
            let startXVelocity = Math.random() * 0.003 - 0.0015
            this.velocity = new Vector2d(startXVelocity, 0)
            this.startSize = 15
            this.size = this.startSize
            this.fuel = getLevelFuel(0)
            
            this.rotationSpeed = 0.1
            this.rotation = 0

            this.score = 0
            this.currLevel = 0
            this.crashed = false
            this.particles = []

            this.thrustIncrease = 0.03
            this.thrust = 0
            this.thrustAcceleration = gravityConstant * 2

            this.hasLanded = false
        }

        reset() {
            this.hasLanded = false
            this.crashed = false
            this.pos = new Vector2d(0.5, 0.1)
            this.velocity = new Vector2d(0, 0)
            this.rotation = 0
        }

        get canLand() {
            let landingMaxSpeed = 4
            let landingMaxAngle = Math.PI / 8

            while (this.rotation < 0) this.rotation += Math.PI * 2
            while (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2
            let angle = (this.rotation > Math.PI) ? (this.rotation - Math.PI * 2) : (this.rotation)
            return this.speedY <= landingMaxSpeed && Math.abs(angle) < landingMaxAngle
        }

        get midPoint() {
            return this.pos.mul(new Vector2d(canvas.width, canvas.height))
        }

        calcScreenPos(zoomPos) {
            return zoomPos(this.pos)
        }

        get speedX() {
            return Math.round(Math.abs(this.velocity.x) * 10000)
        }

        get speedY() {
            return Math.round(Math.abs(this.velocity.y) * 10000)
        }

        get speed() {
            return Math.sqrt(this.speedX ** 2 + this.speedY ** 2)
        }

        get points() {
            let points = [
                new Vector2d(0, -this.size),
                new Vector2d(this.size, this.size),
                new Vector2d(0, this.size / 2),
                new Vector2d(-this.size, this.size)
            ]
            for (let point of points) {
                point.irotate(this.rotation)
                point.iadd(this.midPoint)
            }
            return points
        }

        crash() {
            if (this.crashed)
                return
            this.crashed = true
            this.crashTime = Date.now()
            for (let i = 0; i < args.particles * 100; i++) {
                let particle = new Particle(this.pos.x, this.pos.y, 3000)
                particle.velocity = Vector2d.random().scale((this.speed + 0.1) * 0.0005 * Math.random())
                this.particles.push(particle)
            }
        }

        spawnThrustParticles() {
            const spawnParticle = () => {
                let angleDiff = (Math.random() - 0.5) * 2 * (Math.PI / 20)
                let particleDirection = Vector2d.fromAngle(
                    this.rotation + Math.PI / 2 + angleDiff)
                const normalSpeed = 0.003
                let particleSpeed = (1 + Math.random()) * normalSpeed + this.velocity.length
                let particle = new Particle(
                    this.pos.x,
                    this.pos.y,
                    Math.random() * 4000, {r: 192, g: 105, b: 64},
                    particleDirection.scale(particleSpeed)
                )
                particle.size = 5
                this.particles.push(particle)
            }

            for (let i = 0; i < args.particles; i++)
                if (Math.random() < this.thrust)
                    spawnParticle()
        }

        update(deltaTime, landscape) {
            if (!this.crashed) {
                if (this.thrust > 0) {
                    let direction = Vector2d.fromAngle(this.rotation - Math.PI / 2)
                    if (this.fuel > 0)
                        this.velocity.iadd(direction
                            .scale(this.thrustAcceleration)
                            .scale(this.thrust))
                    else
                        this.thrust = 0
                    this.fuel = Math.max(this.fuel - this.thrust * deltaTime, 0)

                    this.spawnThrustParticles()
                }
    
                this.velocity.iadd(gravity.scale(deltaTime))
                this.pos.iadd(this.velocity.scale(deltaTime)
                    .div(new Vector2d(canvas.width / canvas.height, 1)))
            }

            for (let point of this.points) {
                if (landscape.checkPlatform(point) && this.canLand) {
                    this.velocity.x = 0
                    this.velocity.y = -0.003
                    this.hasLanded = true
                    this.score += 10
                    this.currLevel++
                    this.fuel += getLevelFuel(this.currLevel)
                    break
                }
                if (landscape.checkCollision(point)) {
                    this.crash()
                    break
                }
            }

            if (this.pos.x < 0) {
                this.pos.x = 0
                this.velocity.x *= -1
            } else if (this.pos.x > 1) {
                this.pos.x = 1
                this.velocity.x *= -1
            } else if (this.pos.y < 0) {
                this.pos.y = 0
                this.velocity.y *= -1
            }

            for (let particle of this.particles) {
                particle.update(deltaTime, landscape)
            }
            this.particles = this.particles.filter(particle => particle.alive)
        }

        draw(zoomPos) {
            function drawPoints(points, color, method) {
                context.fillStyle = color
                context.strokeStyle = color
                context.beginPath()
                context.moveTo(points[0].x, points[0].y)
                for (let i = 0; i < points.length; i++) {
                    let pos = zoomPos(new Vector2d(
                        points[i].x,
                        points[i].y
                    ), true)
                    if (i == 0) context.moveTo(pos.x, pos.y)
                    else context.lineTo(pos.x, pos.y)
                }
                context.closePath()
                context[method]()
            }

            for (let particle of this.particles) {
                particle.draw(zoomPos)
            }

            if (this.crashed)
                return
            drawPoints(this.points, "white", "fill")
        }

        get screenPos() {
            return this.pos.mul(new Vector2d(canvas.width, canvas.height))
        }

    }

    class Platform {

        constructor(xStart, width) {
            this.xStart = xStart
            this.width = width
            this.height = 50
        }

        get xEnd() {
            return this.xStart + this.width
        }

        get pos() {
            return game.landscape.platformPos
        }

        draw(zoomPos) {
            let xStart = zoomPos(new Vector2d(this.xStart, 0)).x
            let xEnd = zoomPos(new Vector2d(this.xEnd, 0)).x
            let y = zoomPos(this.pos.sub({x: 0, y: this.height}), true).y
            context.fillStyle = "white"

            let barWidth = (xEnd - xStart) * 0.1

            context.fillRect(xStart, y, xEnd - xStart, barWidth)

            // supports
            context.fillRect(xStart + 10, y+2, barWidth/2, 10000)
            context.fillRect(xEnd - 10 - barWidth/2, y+2, barWidth/2, 10000)
        }

    }

    class Landscape {

        generateData() {
            let funcs = []
            const random = () => Math.random()
            for (let i = 0; i < 50; i++) {
                let a = random() * 0.04
                let b = random() * 2
                let c = random() * 2 * Math.PI
                funcs.push((x) => a * Math.sin(b * x + c))
            }

            let data = []
            for (let x = 0; x < canvas.width; x++) {
                let y = 0
                let adjustedX = x / canvas.width * Math.PI * 4
                for (let func of funcs) {
                    let tempY = func(adjustedX)
                    y += tempY
                }
                data.push(y + 0.25)
            }
            return data
        }

        async generatePlatform() {
            let blendData = (xStart, xEnd, height, direction) => {
                for (let x = xStart; x < xEnd; x++) {
                    let xBlend = (x - xStart) / (xEnd - xStart)
                    let yBlend = (Math.sin(xBlend * Math.PI + Math.PI / 2) + 1) / 2
                    let heightDiff = height - this.data[x]
                    this.data[x] += heightDiff * (direction == -1 ? yBlend : 1 - yBlend)
                }
            }

            let xStart = Math.random() * 0.7 + 0.15
            let width = 100 / canvas.width
            let platform = new Platform(xStart, width)
            let platformHeight = Math.max(...this.data.slice(
                Math.floor(platform.xStart * this.data.length),
                Math.floor(platform.xEnd * this.data.length))) + 0.03
            let coordStart = Math.round(xStart * this.data.length)
            let coordEnd = Math.round(platform.xEnd * this.data.length)
            for (let x = coordStart; x < coordEnd; x++) {
                this.data[x] = platformHeight
            }

            let blendDistance = 100
            blendData(coordStart - blendDistance, coordStart, platformHeight, 1)
            blendData(coordEnd, coordEnd + blendDistance, platformHeight, -1)

            this.platform = platform
        }

        async generateValidData() {
            return new Promise(async resolve => {
                let data = this.generateData()
                let generationTries = 0
                while (this.maxAltitude(data) > 0.5 || this.minAltitude(data) < 0) {
                    generationTries++
                    data = this.generateData()
                    if (generationTries % 1 == 0)
                        await sleep(0)
                }
                resolve(data)
            })
        }

        generateSurfaceNormals() {
            let normals = []
            for (let i = 1; i < this.data.length; i++) {
                let diff = this.data[i] - this.data[i - 1]
                let angle = Math.atan(diff * canvas.height)
                normals.push(angle - Math.PI / 2)
            }
            return normals
        }

        async generate() {
            this.data = await this.generateValidData()
            await this.generatePlatform()
            this.surfaceNormals = this.generateSurfaceNormals()
            this.generating = false
        }

        get platformPos() {
            let x = this.platform.xStart * canvas.width + this.platform.width * canvas.width / 2
            let y = (1 - this.data[Math.floor(this.platform.xStart * this.data.length)]) * canvas.height
            return new Vector2d(x, y)
        }

        maxAltitude(data) {
            return Math.max(...(data ?? this.data))
        }

        minAltitude(data) {
            return Math.min(...(data ?? this.data))
        }

        constructor() {
            this.generating = true
            this.platform = null
            this.generate()
        }

        checkCollision(point) {
            let x = point.x / canvas.width * this.data.length
            let y = point.y / canvas.height
            let terrainHeight = 1 - this.data[Math.floor(x)]

            let relevantHeight = terrainHeight

            x /= this.data.length

            if (x > this.platform.xStart && x < this.platform.xEnd) {
                relevantHeight = (this.platform.pos.y - this.platform.height) / canvas.height
            }

            return y > relevantHeight
        }

        getSurfaceNormal(point) {
            let x = point.x * this.data.length
            let angle = this.surfaceNormals[Math.floor(x)]
            return Vector2d.fromAngle(angle)
        }

        checkPlatform(point) {
            let x = point.x / canvas.width
            let y = point.y / canvas.height
            let platform = this.platform
            return (
                x > platform.xStart &&
                x < platform.xEnd &&
                y > (platform.pos.y - platform.height) / canvas.height
            )
        }

        get platformHeight() {
            return this.data[Math.floor(this.platform.xStart * this.data.length)]
        }

        draw(zoomPos) {
            context.fillStyle = "white"
            context.beginPath()
            context.moveTo(0, canvas.height)
            for (let i = 0; i < this.data.length; i++) {
                let pos = zoomPos(new Vector2d(
                    i / this.data.length,
                    1 - this.data[i]
                ))
                context.lineTo(pos.x, pos.y)
            }
            context.lineTo(canvas.width, canvas.height)
            context.closePath()
            context.fill()
            if (this.platform)
                this.platform.draw(zoomPos)
        }

    }

    class Game {

        FPS = 30
        running = true

        get deltaMs() {
            return 1000 / this.FPS
        }

        registerKeyEvents() {
            this.keyListener.addRule(KEY.UP_ARROW, () => {
                this.player.thrust = Math.min(this.player.thrust + this.player.thrustIncrease, 1)
            }, KEY.DOWN)

            this.keyListener.addRule(KEY.LEFT_ARROW, () => {
                this.player.rotation -= this.player.rotationSpeed
            }, KEY.DOWN)

            this.keyListener.addRule(KEY.RIGHT_ARROW, () => {
                this.player.rotation += this.player.rotationSpeed
            }, KEY.DOWN)

            this.keyListener.addRule(KEY.UP_ARROW, () => {
                this.player.thrust = 0
            }, KEY.UP)

            this.keyListener.onTouchStart((event, pos) => {
                this.currTouchPos = pos
                this.touchEnabled = true
            })

            this.keyListener.onTouchMove((event, pos) => {
                this.currTouchPos = pos
                this.touchEnabled = true
            })

            this.keyListener.onTouchEnd(() => {
                this.currTouchPos = null
                this.touchEnabled = true
            })
        }

        runTouchHandling() {
            if (this.player.crashed) return

            if (this.currTouchPos == null) {
                this.player.thrust = 0
                return
            }

            this.player.thrust = Math.min(this.player.thrust + this.player.thrustIncrease, 1)

            let playerPos = this.player.calcScreenPos(this.makeZoomPos())
            let angle = playerPos.angleTo(this.currTouchPos)
            this.player.rotation = angle - Math.PI / 2
        }

        drawStats() {
            context.fillStyle = "white"
            context.font = "20px Arial bold"
            context.textAlign = "left"
            let heightPointer = 30
            function drawText(msg) {
                context.fillText(msg, 10, heightPointer)
                heightPointer += 20
            }
            drawText(`use arrow keys or touch`)
            drawText(`score: ${this.player.score}`)
            drawText(`speed: ${Math.round(this.player.speed * 10) / 10}`)
            drawText(`fuel: ${Math.round(this.player.fuel)}`)
        }
        
        constructor() {
            this.currTouchPos = null
            this.touchEnabled = false
            this.keyListener = new KeyListener()

            this.keyListener.onCtrlC(() => {
                this.running = false
                this.keyListener.remove()
                terminalWindow.close()
            })

            this.player = new Player()
            terminal.window.secretShip = this.player
            this.landscape = new Landscape()
            this.registerKeyEvents()

            this.zoom = 1

            this.endAnimationLength = 3000
            this.newLandscape = null
        }
        
        makeZoomPos() {
            let zoomFactor = 1 / this.zoom
            let xWidth = zoomFactor
            let yWidth = zoomFactor

            let platformXPos = this.landscape.platform.xStart + this.landscape.platform.width / 2
            let xStart = Math.min(Math.max(0, platformXPos - xWidth / 2), 1 - xWidth)
            let yStart = Math.min(Math.max(0,  this.landscape.platformHeight - yWidth / 2 + 0.1), 1 - yWidth)

            yStart = 1 - yWidth - yStart

            function zoomPos(pos, canvasPos=false) {
                if (pos == "getZoomFactor")
                    return zoomFactor
                if (canvasPos) {
                    pos = new Vector2d(
                        pos.x / canvas.width,
                        pos.y / canvas.height
                    )
                }
                return new Vector2d(
                    (pos.x - xStart) / xWidth * canvas.width,
                    (pos.y - yStart) / yWidth * canvas.height
                )
            }

            return zoomPos
        }

        async update(timeDelta) {
            this.player.update(timeDelta / this.deltaMs, this.landscape)

            let playerPlatformDistance = this.player.screenPos.distance(this.landscape.platformPos)
            let tempZoom = 1 / (playerPlatformDistance / canvas.width * 4)
            let targetZoom = Math.min(Math.max(tempZoom, 1), 2)
            let zoomDiff = targetZoom - this.zoom
            this.zoom += zoomDiff * 0.02

            if (this.player.hasLanded) {
                if (this.newLandscape == null) {
                    this.newLandscape = new Landscape()
                } else if (this.newLandscape.generating == false) {
                    this.player.reset()
                    for (let i = 0; i < this.landscape.data.length; i++) {
                        this.landscape.data[i] = this.newLandscape.data[i]
                        this.zoom += (1 - this.zoom) * 0.01
                        if (i % 5 == 0)
                            await sleep(0)
                    }
                    this.landscape = this.newLandscape
                    this.newLandscape = null
                }
            }
        }

        redraw() {
            clearWindow()

            let zoomPos = this.makeZoomPos()

            this.drawStats()
            this.player.draw(zoomPos)
            this.landscape.draw(zoomPos)
        }

        drawMessage(msg) {
            context.fillStyle = "white"
            context.font = "50px Arial bold"
            context.textAlign = "center"
            context.fillText(msg, canvas.width / 2, canvas.height / 2)
        }

        async run() {
            let prevTime = Date.now()

            while (this.landscape.generating) {
                this.drawMessage("Generating landscape...")
                await sleep(100)
            }

            while (this.running) {
                if (this.touchEnabled) {
                    this.runTouchHandling()
                } else {
                    this.keyListener.runRules()
                }

                let timeDelta = Date.now() - prevTime
                prevTime = Date.now()
                this.update(timeDelta)
                this.redraw()

                if (this.player.crashed) {
                    this.drawMessage("Game Over")

                    if (Date.now() - this.player.crashTime > this.endAnimationLength) {
                        this.running = false
                    }
                }

                await sleep(this.deltaMs)
            }

            this.keyListener.remove()
        }

    }
    let game = new Game()
    await game.run()
    
    while (args.f) { // fullscreen mode
		game = new Game()
		await game.run()
	}

    terminalWindow.close()

    terminal.printLine(`Your score: ${game.player.score}`)
    
    await HighscoreApi.registerProcess("lunar-lander")
    await HighscoreApi.uploadScore(game.player.score)
    
}, {
    description: "play a classic game of moon-lander",
    args: {
        "?particles:n:1~1000": "number of particles to generate",
        "?f=fullscreen:b": "enable fullscreen application"
    },
    standardVals: {
        particles: 10,
    },
    isGame: true,
})
