terminal.addCommand("asteroids", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Asteroids", fullscreen: args.fullscreen
    })

    const maxNumParticles = 1000

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const canvasSize = () => new Vector2d(canvas.width, canvas.height)

    let gameRunning = true

    terminal.onInterrupt(() => {
        gameRunning = false
        terminalWindow.close()
    })

    function randomPolygon() {
        let corners = Math.floor(Math.random() * 10) + 5
        let points = []
        for (let i = 0; i < corners; i++) {
            let angle = i / corners * Math.PI * 2
            let length = Math.random() * 0.5 + 0.5
            points.push(new Vector2d(0, -length).rotate(angle))
        }
        return points
    }

    function drawTextLines(lines) {
        context.fillStyle = "white"
        context.font = "20px monospace"
        context.textAlign = "left"
        context.textBaseline = "top"
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], 10, 10 + i * 20)
        }
    }

    class Ship {

        constructor() {
            this.pos = canvasSize().scale(0.5)
            this.vel = new Vector2d(0, 0)
            this.rotation = 0 // radians
            this.thrust = 0 // 0 to 1
            this.size = 20
            this.alive = true
            this.score = 0
        }

        die() {
            if (!this.alive) return
            this.alive = false
            spawnExplosion(this.pos)

            setTimeout(() => {
                if (!gameRunning) return
                gameRunning = false
            }, 3000)
        }

        get maxSpeed() {
            return canvasSize().length * 0.01
        }

        get acceleration() {
            return canvasSize().length * 0.00008
        }

        get rotationSpeed() {
            return Math.PI * 0.03
        }

        get thrustVector() {
            return new Vector2d(0, -this.thrust).rotate(this.rotation).scale(this.acceleration)
        }

        get bulletDirection() {
            return new Vector2d(0, -1).rotate(this.rotation).scale(this.acceleration * 100)
        }

        update() {
            if (!this.alive) return
            this.vel.iadd(this.thrustVector)
            this.vel.iscale(0.995)
            this.pos.iadd(this.vel)
            if (this.vel.length > this.maxSpeed)
                this.vel.iscale(this.maxSpeed / this.vel.length)

            if (this.pos.x < -this.size) this.pos.x += canvas.width + this.size * 2
            if (this.pos.x > canvas.width + this.size) this.pos.x -= canvas.width + this.size * 2
            if (this.pos.y < -this.size) this.pos.y += canvas.height + this.size * 2
            if (this.pos.y > canvas.height + this.size) this.pos.y -= canvas.height + this.size * 2

            for (let asteroid of asteroids) {
                if (this.pos.distance(asteroid.pos) < asteroid.size + this.size) {
                    this.die()
                }
            }
        }

        drawThrust() {
            context.strokeStyle = "red"
            context.lineWidth = 2

            context.beginPath()
            context.moveTo(-this.size,  this.size * 0.6)
            context.lineTo(-this.size - this.thrust * this.size,  0)
            context.lineTo(-this.size, -this.size * 0.6)
            context.closePath()
            context.stroke()
        }
 
        spawnParticle() {
            if (!this.alive) return
            let particle = new Particle()
            particle.pos = this.pos.copy()
            particle.vel = this.bulletDirection.copy()
            particle.vel.iadd(this.vel)
            particles.unshift(particle)
        }

        draw() {
            if (!this.alive) return

            context.strokeStyle = "white"
            context.lineWidth = 2

            context.beginPath()
            context.save()
            context.translate(this.pos.x, this.pos.y)
            context.rotate(this.rotation - Math.PI / 2)

            context.moveTo( this.size,  0)
            context.lineTo(-this.size,  this.size * 0.8)
            context.lineTo(-this.size, -this.size * 0.8)
            context.lineTo( this.size,  0)
            context.closePath()
            context.stroke()

            if (this.thrust > 0) {
                this.drawThrust()
            }

            context.restore()
        }

    }

    function spawnExplosion(position, num=200) {
        let numParticles = Math.floor(Math.random() * num / 2) + Math.floor(num)
        for (let i = 0; i < numParticles; i++) {
            let particle = new ExplosionParticle(position.copy())
            explosionParticles.unshift(particle)
        }
    }

    class Asteroid {

        randomPosition() {
            const randomPos = () => new Vector2d(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            )

            let pos = randomPos()
            while (pos.distance(ship.pos) < canvasSize().length / 4) {
                pos = randomPos()
            }   

            return pos
        }

        constructor(level=3) {
            this.level = level
            this.pos = this.randomPosition()
            this.rotation = Math.random() * Math.PI * 2
            this.vel = Vector2d.random().scale(Math.random() * 1 + 0.5)
            this.size = (level * 15) + Math.random() * 3
            this.shape = randomPolygon()
            this.alive = true
        }

        die() {
            if (!this.alive) return

            ship.score++
            this.alive = false
            spawnExplosion(this.pos, this.level * 10)

            if (this.level > 1) {
                let children = Math.floor(Math.random() * 2) + 1
                for (let i = 0; i < children; i++) {
                    let asteroid = new Asteroid(this.level - 1)
                    asteroid.pos = this.pos.copy().add(Vector2d.random().scale(this.size))
                    asteroids.push(asteroid)
                }
            }
        }

        inHitBox(pos) {
            let distance = this.pos.distance(pos)
            return distance < this.size
        }

        draw() {
            context.strokeStyle = "white"
            context.lineWidth = 2

            context.beginPath()
            context.save()
            context.translate(this.pos.x, this.pos.y)
            context.rotate(this.rotation)

            for (let i = 0; i < this.shape.length; i++) {
                let p = this.shape[i]
                context.lineTo(p.x * this.size, p.y * this.size)
            }

            context.closePath()
            context.stroke()

            context.restore()
        }

        update() {
            this.pos.iadd(this.vel)

            if (this.pos.x < -this.size) this.pos.x += canvas.width + this.size * 2
            if (this.pos.x > canvas.width + this.size) this.pos.x -= canvas.width + this.size * 2
            if (this.pos.y < -this.size) this.pos.y += canvas.height + this.size * 2
            if (this.pos.y > canvas.height + this.size) this.pos.y -= canvas.height + this.size * 2
        }

    }

    class ExplosionParticle {

        constructor(pos) {
            this.pos = pos.copy()
            this.vel = Vector2d.random().scale(Math.random() * 10 + 5)
            this.size = Math.random() * 5 + 3
            this.alive = true
        }

        update() {
            this.pos.iadd(this.vel)
            this.alive = this.pos.x > 0 && this.pos.x < canvas.width &&
                         this.pos.y > 0 && this.pos.y < canvas.height
        }

        draw() {
            context.fillStyle = "rgba(255, 128, 128, 0.9)"
            context.fillRect(this.pos.x, this.pos.y, this.size, this.size)
        }

    }

    class Particle {

        constructor() {
            this.size = 3
            this.pos = new Vector2d(0, 0)
            this.vel = new Vector2d(0, 0)
            this.alive = true
            this.tickCount = 0
            this.maxTickCount = 1000
        }

        isOffScreen() {
            return this.pos.x < 0 || this.pos.x > canvas.width ||
                   this.pos.y < 0 || this.pos.y > canvas.height
        }

        die() {
            this.alive = false
        }

        update() {
            this.pos.iadd(this.vel)
            this.tickCount++

            if (this.tickCount > this.maxTickCount)
                this.die()

            if (args.chaos) {
                if (this.pos.x < 0)
                    this.pos.x = canvas.width
                if (this.pos.x > canvas.width)
                    this.pos.x = 0
                if (this.pos.y < 0)
                    this.pos.y = canvas.height
                if (this.pos.y > canvas.height)
                    this.pos.y = 0
            } else {
                this.alive = !this.isOffScreen()
            }

            for (let asteroid of asteroids) {
                if (asteroid.inHitBox(this.pos)) {
                    asteroid.die()
                    this.die()
                }
            }
        }

        draw() {
            context.fillStyle = "white"
            context.fillRect(this.pos.x, this.pos.y, this.size, this.size)
        }

    }

    function drawBackground() {
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    const keysDown = new Set()
    const validKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", " "])

    addEventListener("keydown", event => {
        if (!gameRunning) return
        if (!event.repeat) keysDown.add(event.key)
        if (validKeys.has(event.key)) event.preventDefault()
    })
    addEventListener("keyup", event => keysDown.delete(event.key))

    function handleUserInput() {
        if (keysDown.has("ArrowLeft")) {
            ship.rotation -= ship.rotationSpeed
        }

        if (keysDown.has("ArrowRight")) {
            ship.rotation += ship.rotationSpeed
        }

        if (keysDown.has("ArrowUp")) {
            ship.thrust = Math.min(1, ship.thrust + 0.1)
        } else {
            ship.thrust = 0
        }

        if (keysDown.has(" ")) {
            ship.spawnParticle()
            if (!args.chaos)
                keysDown.delete(" ")
        }
    }

    function reset() {
        ship = new Ship()
        particles = []
        explosionParticles = []
        asteroids = []
        minL3Asteroids = 8
        gameRunning = true
    }

    let ship = new Ship()
    let particles = []
    let explosionParticles = []
    let asteroids = []
    let minL3Asteroids = 8

    function loop() {
        drawBackground()
        ship.update()
        ship.draw()

        for (let particle of particles) {
            particle.update()
            particle.draw()
        }

        for (let particle of explosionParticles) {
            particle.update()
            particle.draw()
        }

        let l3AsteroidCount = 0
        for (let asteroid of asteroids) {
            asteroid.update()
            asteroid.draw()
            if (asteroid.level == 3) l3AsteroidCount++
        }

        particles = particles.filter(particle => particle.alive)
        explosionParticles = explosionParticles.filter((particle, i) => {
            if (i > maxNumParticles) return false
            if (particle.alive) return true
            return false
        })
        asteroids = asteroids.filter(asteroid => asteroid.alive)

        if (l3AsteroidCount < minL3Asteroids) {
            asteroids.push(new Asteroid())
            if (Math.random() < 0.05) {
                minL3Asteroids++
            }
        }

        drawTextLines([
            `Score: ${ship.score}`,
        ])

        handleUserInput()

        if (gameRunning)
            terminal.window.requestAnimationFrame(loop)
    }

    while (true) {
        loop()
        while (gameRunning) {
            await terminal.sleep(100)
        }

        let chosenOptionIndex = await CanvasDrawer.promptOptions(context, {
            options: [
                "Play again",
                `Upload Score (${ship.score})`,
                "Exit"
            ]
        })
    
        if (chosenOptionIndex == 0) {
            reset()
        } else if (chosenOptionIndex == 1) {
            terminalWindow.close()
            if (!args.chaos) {
                await HighscoreApi.registerProcess("asteroids", {ask: false})
                await HighscoreApi.uploadScore(ship.score)
            } else {
                terminal.printError("Cannot upload score in chaos mode")
            }
            return
        } else {
            terminalWindow.close()
            return
        }
    }

}, {
    description: "simulate a bunch of balls jumping around",
    args: {
        "?f=fullscreen:b": "start in fullscreen mode",
        "?c=chaos:b": "start with chaos mode enabled",
    },
    isGame: true
})