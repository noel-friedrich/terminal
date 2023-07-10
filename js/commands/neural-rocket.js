terminal.addCommand("neural-rocket", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("neural", terminal)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Neural Rocket Simulation (Genetic Algorithm)"
    })

    terminal.onInterrupt(() => {
        terminalWindow.close()
        gameRunning = false
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const canvasSize = () => new Vector2d(canvas.width, canvas.height)

    const GRAVITY = new Vector2d(0, 0.05)
    const ALIVE_ROCKET_COLOR = "rgba(255, 255, 255, 0.5)"
    const DEAD_ROCKET_COLOR = "rgba(255, 0, 0, 0.5)"
    const THRUST_COLOR = "rgba(255, 255, 0, 0.5)"
    const THRUST_POWER = 0.5
    const TURN_SPEED = 0.05

    const TURN_LEFT = 1
    const TURN_RIGHT = 2
    const TURN_THRUST_OFF = 3
    const DONT_TURN = 4

    const TICK_SCORE = 1

    const BRAIN_OUTPUTS = [TURN_THRUST_OFF, DONT_TURN]
    const MUTATION_RATE = 0.1
    const CROSSOVER_RATE = 0.7
    const MAX_TICKS = 1000
    const bestRocketsPerGen = Math.max(5, Math.floor(args.population / 20))

    const ACTIONS = {
        [TURN_THRUST_OFF]: rocket => rocket.thrust = 0,
        [TURN_LEFT]: rocket => rocket.angle -= TURN_SPEED,
        [TURN_RIGHT]: rocket => rocket.angle += TURN_SPEED,
        [DONT_TURN]: rocket => {}
    }

    class RocketBrain {

        constructor() {
            this.net = new terminal.modules.neural.Net([
                8, // x, y, angle, distanceWallX, distanceWallY, velocityX, velocityY
                16,
                BRAIN_OUTPUTS.length
            ], {
                biasEnabled: true,
            })
        }

        static crossover(brain1, brain2) {
            let newBrain = new RocketBrain()
            newBrain.net = terminal.modules.neural.Net.crossover(brain1.net, brain2.net)
            return newBrain
        }

        copy() {
            let copy = new RocketBrain()
            copy.net = this.net.copy()
            return copy
        }

        mutate() {
            this.net.mutate(MUTATION_RATE)
        }

        think(rocket) {
            // x, y, angle, ticks, distanceWallX, distanceWallY, velocityX, velocityY
            let inputs = [
                rocket.pos.x / canvas.width,
                rocket.pos.y / canvas.height,
                (rocket.angle % (Math.PI * 2)) / (2 * Math.PI),
                rocket.survivedTicks / MAX_TICKS,
                canvas.width - rocket.pos.x,
                canvas.height - rocket.pos.y,
                rocket.vel.x,
                rocket.vel.y
            ]

            let outputs = this.net.input(inputs)
            let maxIndex = terminal.modules.neural.indexOfMax(outputs)
            let actionIndex = BRAIN_OUTPUTS[maxIndex]
            return ACTIONS[actionIndex]
        }

    }

    class Rocket {

        constructor() {
            this.pos = canvasSize().scale(0.5)
            this.angle = Math.PI / 2
            this.thrust = 0
            this.vel = new Vector2d(0, 0)
            this.size = 10
            this.alive = true
            this.brain = new RocketBrain()
            this.score = -Infinity
            this.currScore = 0
            this.survivedTicks = 0
        }

        calcScore() {
            this.currScore = TICK_SCORE * this.survivedTicks
            if (this.currScore > this.score) {
                this.score = this.currScore
            }
        }

        die() {
            if (!this.alive) return

            this.alive = false
        }

        get thrustVel() {
            return Vector2d.fromAngle(this.angle).scale(this.thrust)
        }

        isOutOfBounds() {
            return this.pos.x < 0 || this.pos.x > canvas.width ||
                this.pos.y < 0 || this.pos.y > canvas.height
        }

        update() {
            if (!this.alive) return

            this.survivedTicks++

            this.thrust = THRUST_POWER

            this.brain.think(this)(this)
            ACTIONS[TURN_LEFT](this)

            this.vel.iadd(GRAVITY)
            this.vel.iadd(this.thrustVel)
            let prevPos = this.pos.copy()
            this.pos.iadd(this.vel)

            if (this.isOutOfBounds()) {
                this.pos = prevPos
                this.vel = new Vector2d(0, 0)
                this.die()
            }

            this.calcScore()
        }

        _drawBody() {
            context.beginPath()
            context.moveTo(0, -this.size)
            context.lineTo(-this.size, this.size)
            context.lineTo(this.size, this.size)
            context.closePath()
            context.fillStyle = this.bodyColor
            context.fill()
        }

        _drawThrust() {
            context.beginPath()
            context.moveTo(-this.size / 2, this.size)
            context.lineTo(0, this.size + this.size / 2 * this.thrust * 30)
            context.lineTo(this.size / 2, this.size)
            context.closePath()
            context.strokeStyle = THRUST_COLOR
            context.stroke()
        }

        get bodyColor() {
            return this.alive ? ALIVE_ROCKET_COLOR : DEAD_ROCKET_COLOR
        }

        draw() {
            if (!this.alive)
                return
            
            context.save()
            context.translate(this.pos.x, this.pos.y)
            context.rotate(this.angle + Math.PI / 2)
            this._drawBody()
            this._drawThrust()
            context.restore()
        }

    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height)
    }

    function getBestRockets(population, n=bestRocketsPerGen) {
        let sorted = population.slice().sort((a, b) => b.score - a.score)
        return sorted.slice(0, n)
    }

    function makePopulation(populationSize) {
        let population = []
        for (let i = 0; i < populationSize; i++) {
            population.push(new Rocket())
        }
        return population
    }

    function allDead() {
        for (let rocket of population) {
            if (rocket.alive) return false
        }
        return true
    }

    function populationFromParents(populationSize, bestRockets) {
        let population = []
        for (let i = 0; i < populationSize; i++) {
            population.push(new Rocket())
        }

        function twoParents() {
            let i1 = Math.floor(Math.random() * bestRockets.length)
            let i2 = Math.floor(Math.random() * bestRockets.length)
            return [bestRockets[i1], bestRockets[i2]]
        }

        let bestRocket = bestRockets[0]
        let isFirst = true
        for (let rocket of population) {
            if (isFirst) {
                isFirst = false
                rocket.brain = bestRocket.brain.copy()
            } else {
                if (Math.random() < MUTATION_RATE) {
                    rocket.brain = new RocketBrain()
                } else if (Math.random() < CROSSOVER_RATE) {
                    let [p1, p2] = twoParents()
                    rocket.brain = RocketBrain.crossover(p1.brain, p2.brain)
                } else {
                    rocket.brain = bestRocket.brain.copy()
                    rocket.brain.mutate()
                }
            }
        }

        return population
    }

    function mutatePopulation(population, bestRocket) {
        let isFirst = true
        for (let rocket of population) {
            if (isFirst) {
                isFirst = false
                rocket.brain = bestRocket.brain.copy()
            } else {
                if (Math.random() < MUTATION_RATE) {
                    rocket.brain = new RocketBrain()
                } else {
                    rocket.brain = bestRocket.brain.copy()
                    rocket.brain.mutate()
                }
            }
        }
    }

    function getBestRocket(population) {
        let bestRocket = population[0]
        for (let rocket of population) {
            if (rocket.score > bestRocket.score) {
                bestRocket = rocket
            }
        }
        return bestRocket
    }

    function geneticAlgorithm(population) {
        let bestRockets = getBestRockets(population)
        let bestRocket = bestRockets[0]
        population = populationFromParents(population.length, bestRockets)
        bestScore = bestRocket.score
        return population
    }

    function drawInfos(infos) {
        context.fillStyle = "white"
        context.font = "20px monospace"
        context.textAlign = "left"
        context.textBaseline = "top"

        let y = 5
        for (let info of infos) {
            context.fillText(info, 10, y)
            y += 20
        }
    }

    function aliveCount(population) {
        let count = 0
        for (let rocket of population) {
            if (rocket.alive) count++
        }
        return count
    }

    let population = makePopulation(args.population)
    let generationCount = 0
    let bestScore = 0
    let currTick = 0

    function gameLoop() {
        currTick++

        clearCanvas()
        for (let rocket of population) {
            rocket.update()
            rocket.draw()
        }
        drawInfos([
            `generation: ${generationCount}`,
            `alive: ${aliveCount(population)}`,
            `best score: ${bestScore}`,
            `tick: ${currTick}`
        ])

        if (currTick > MAX_TICKS || allDead()) {
            population = geneticAlgorithm(population)
            currTick = 0
            generationCount++
        }
        
        if (gameRunning) {
            requestAnimationFrame(gameLoop)
        }
    }

    let gameRunning = true
    let r = new Rocket()
    gameLoop()

}, {
    description: "trains neural networks to fly rockets",
    args: {
        "?population:i:10~99999": "number of rockets in the population",
    },
    defaultValues: {
        "population": 100,
    },
    isSecret: true
})
