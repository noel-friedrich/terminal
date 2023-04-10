terminal.addCommand("chaos-balls", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Chaos Balls", fullscreen: args.fullscreen
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    class Curve {

        angleFromF(f, x, h=0.0001) {
            const slope = (f(x + h) - f(x)) / h
            return new Vector2d(1, slope).angle
        }

        makeAngles() {
            for (let i = 0; i < this.pointCount; i++) {
                this.angles.push(this.angleFromF(x => this.yValues[x], i))
            }
        }

        transformPointsOntoCanvas() {
            let minY = this.getMinY()
            let maxY = this.getMaxY()

            const yToCanvas = y => canvas.height * 0.9 - canvas.height * 0.7 * (y - minY) / (maxY - minY)
            for (let i = 0; i < this.pointCount; i++) {
                this.yValues[i] = yToCanvas(this.yValues[i])
            }
        }

        indexFromX(x) {
            return Math.floor((x - this.xMin) / (this.xMax - this.xMin) * this.pointCount)
        }

        XFromIndex(index) {
            return this.xMin + (this.xMax - this.xMin) * index / this.pointCount
        }

        constructor(f, {
            xMin = -10,
            xMax = 10,
            pointCount = canvas.width
        }={}) {
            this.xMin = xMin
            this.xMax = xMax
            this.pointCount = pointCount
            this.yValues = []
            this.angles = []
            for (let i = 0; i < pointCount; i++) {
                const x = this.XFromIndex(i)
                this.yValues.push(f(x))
            }
            this.transformPointsOntoCanvas()
            this.makeAngles()
        }

        getMaxY() {
            return Math.max(...this.yValues)
        }

        getMinY() {
            return Math.min(...this.yValues)
        }

        draw() {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.fillStyle = "white"
            context.fillRect(0, 0, canvas.width, canvas.height)

            context.beginPath()
            context.moveTo(0, this.yValues[0])
            for (let i = 1; i < this.yValues.length; i++) {
                context.lineTo(i, this.yValues[i])
            }

            context.strokeStyle = "black"
            context.stroke()
        }

        isUnder(pos) {
            return pos.y > this.yValues[Math.floor(pos.x)]
        }

        angleAt(x) {
            return this.angles[Math.floor(x)]
        }
        
        reflect(x, direction) {
            let normalAngle = this.angleAt(x)
            console.log(x, normalAngle, this.XFromIndex(x))
            throw "stop"
            let angleDifference = direction.angle - normalAngle
            return direction.rotate(-2 * angleDifference)
        }

    }

    class Ball {

        constructor(x, y, color="red") {
            this.position = new Vector2d(x, y)
            this.velocity = new Vector2d(2, 0)
            this.color = color
        }

        draw() {
            context.beginPath()
            context.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI)
            context.fillStyle = this.color
            context.fill()
            context.strokeStyle = "black"
            context.lineWidth = 2
            context.stroke()
        }

        update(curve) {
            let subSteps = Math.floor(this.velocity.length / 2) + 1
            this.velocity.y += 0.1
            this.velocity.iscale(1 / subSteps)
            for (let i = 0; i < subSteps; i++) {
                this.subupdate(curve)
            }
            this.velocity.iscale(subSteps)
        }

        subupdate(curve) {
            this.position.iadd(this.velocity)
            if (curve.isUnder(this.position)) {
                this.position.isub(this.velocity)
                this.velocity = curve.reflect(this.position.x, this.velocity)
                this.position.iadd(this.velocity)
            }
        }

    }

    let curve = new Curve(x => x ** 2)
    let balls = Array.from({length: args.balls}, () => new Ball(
        canvas.width / 2, canvas.height / 2
    ))

    function loop() {
        curve.draw()
        for (let ball of balls) {
            ball.update(curve)
            ball.draw()
        }

        terminal.window.requestAnimationFrame(loop)
    }

    loop()

}, {
    description: "simulate a bunch of balls jumping around",
    args: {
        "?b=balls:i:1~9999": "number of balls",
    },
    defaultValues: {
        balls: 1,
    },
})