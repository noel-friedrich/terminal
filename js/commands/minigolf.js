const courseData = [
    {
        name: "#1: The Basic",
        shapePoints: [
            { x: 20, y: 0 },
            { x: 80, y: 0 },
            { x: 80, y: 100 },
            { x: 20, y: 100 },
        ],
        ballStartPos: { x: 50, y: 90 },
        holePos: { x: 50, y: 20 },
    },

    {
        name: "#2: Arrow",
        shapePoints: [
            { x: 50, y: 0 },
            { x: 100, y: 0 },
            { x: 50, y: 50 },
            { x: 100, y: 100 },
            { x: 50, y: 100 },
            { x: 0, y: 50 },
        ],
        ballStartPos: { x: 75, y: 90 },
        holePos: { x: 75, y: 10 },
    },
    
    {
        name: "#3: Corner",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 100 },
            { x: 0, y: 100 },
        ],
        ballStartPos: { x: 25, y: 85 },
        holePos: { x: 85, y: 25 },
    },

    {
        name: "#4: Hourglass",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 20 },
            { x: 54, y: 50 },
            { x: 100, y: 80 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
            { x: 0, y: 80 },
            { x: 46, y: 50 },
            { x: 0, y: 20 },
        ],
        ballStartPos: { x: 50, y: 85 },
        holePos: { x: 50, y: 15 },
    },

    {
        name: "#5: Spiral",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 88, y: 0 },
            { x: 100, y: 10 },
            { x: 100, y: 90 },
            { x: 90, y: 100 },
            { x: 10, y: 100 },
            { x: 0, y: 90 },
            { x: 0, y: 35 },
            { x: 15, y: 25 },
            { x: 65, y: 25 },
            { x: 75, y: 35 },
            { x: 75, y: 75 },
            { x: 25, y: 75 },
            { x: 25, y: 55 },
            { x: 60, y: 55 },
            { x: 60, y: 50 },
            { x: 20, y: 50 },
            { x: 20, y: 80 },
            { x: 80, y: 80 },
            { x: 80, y: 20 },
            { x: 0, y: 20 },
        ],
        ballStartPos: { x: 10, y: 10 },
        holePos: { x: 35, y: 65 },
    },

    {
        name: "#6: Gravity",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ],
        ballStartPos: { x: 50, y: 90 },
        holePos: { x: 90, y: 10 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 20, y: 20 },
                size: { x: 80, y: 50 },
                angle: Math.PI
            },

            {
                type: "gravity",
                pos: { x: 0, y: 20 },
                size: { x: 18, y: 50 },
                angle: Math.PI / 2
            }
        ]
    },

    {
        name: "#7",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 15, y: 0 },
            { x: 15, y: 85 },
            { x: 25, y: 85 },
            { x: 25, y: 15 },
            { x: 40, y: 0 },
            { x: 45, y: 0 },
            { x: 60, y: 15 },
            { x: 60, y: 85 },
            { x: 65, y: 85 },
            { x: 65, y: 15 },
            { x: 80, y: 0 },
            { x: 85, y: 0 },
            { x: 100, y: 15 },
            { x: 100, y: 100 },
            { x: 85, y: 100 },
            { x: 85, y: 15 },
            { x: 80, y: 15 },
            { x: 80, y: 85 },
            { x: 65, y: 100 },
            { x: 60, y: 100 },
            { x: 45, y: 85 },
            { x: 45, y: 15 },
            { x: 40, y: 15 },
            { x: 40, y: 85 },
            { x: 25, y: 100 },
            { x: 15, y: 100 },
            { x: 0, y: 85 },
        ],
        ballStartPos: { x: 7.5, y: 7.5 },
        holePos: { x: 92.5, y: 92.5 }
    },

    {
        name: "#8",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 25, y: 0 },
            { x: 25, y: 75 },
            { x: 35, y: 75 },
            { x: 35, y: 25 },
            { x: 75, y: 25 },
            { x: 75, y: 0 },
            { x: 85, y: 0 },
            { x: 85, y: 25 },
            { x: 100, y: 25 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ],
        ballStartPos: { x: 12.5, y: 12.5 },
        holePos: { x: 80, y: 5 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 0, y: 23 },
                size: { x: 25, y: 50 },
                angle: -Math.PI / 2,
                force: 0.7
            },
            {
                type: "gravity",
                pos: { x: 35, y: 25 },
                size: { x: 65, y: 15 },
                angle: Math.PI / 2
            },
            {
                type: "gravity",
                pos: { x: 0, y: 75 },
                size: { x: 73, y: 25 },
                angle: 0
            },
            {
                type: "gravity",
                pos: { x: 75, y: 75 },
                size: { x: 25, y: 25 },
                angle: -Math.PI / 2
            }
        ]
    },

    {
        name: "#9: S",
        shapePoints: [
            { x: 30, y: 0 },
            { x: 90, y: 0 },
            { x: 90, y: 20 },
            { x: 55, y: 20 },
            { x: 60, y: 25 },
            { x: 90, y: 25 },
            { x: 90, y: 95 },
            { x: 30, y: 95 },
            { x: 10, y: 80 },
            { x: 10, y: 0 },
            { x: 25, y: 0 },
            { x: 25, y: 65 },
            { x: 65, y: 65 },
            { x: 60, y: 60 },
            { x: 30, y: 60 },
        ],
        ballStartPos: { x: 17.5, y: 7.5 },
        holePos: { x: 80, y: 10 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 30, y: 0 },
                size: { x: 25, y: 60 },
                force: 0.1,
                angle: 0,
            },
            {
                type: "gravity",
                pos: { x: 65, y: 25 },
                size: { x: 25, y: 70 },
                force: 0.1,
                angle: 3.141592653589793,
            },
        ],
    },

    {
        name: "#10",
        shapePoints: [
            { x: 15, y: 0 },
            { x: 65, y: 0 },
            { x: 65, y: 20 },
            { x: 85, y: 20 },
            { x: 85, y: 30 },
            { x: 65, y: 30 },
            { x: 65, y: 100 },
            { x: 15, y: 100 },
        ],
        ballStartPos: { x: 50, y: 85 },
        holePos: { x: 80, y: 25 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 15, y: 0 },
                size: { x: 50, y: 20 },
                force: 0.8,
                angle: 1.5707963267948966,
            },
            {
                type: "gravity",
                pos: { x: 15, y: 72 },
                size: { x: 20, y: 28 },
                force: 0.1,
                angle: 0,
            },
            {
                type: "gravity",
                pos: { x: 15, y: 30 },
                size: { x: 50, y: 40 },
                force: 0.3,
                angle: 1.5707963267948966,
            },
        ],
    },
]

terminal.addCommand("minigolf", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Minigolf Game", fullscreen: args.fullscreen
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const worldSize = new Vector2d(100, 100)
    let viewCentre = new Vector2d(canvas.width, canvas.height).scale(0.5)
    let zoomFactor = 1
    const DAMPENING_FACTOR = 0.98

    const pointToCanvas = p => p.sub(worldSize.scale(0.5)).scale(zoomFactor).add(viewCentre)
    const canvasToPoint = p => p.sub(viewCentre).scale(1 / zoomFactor).add(worldSize.scale(0.5))

    const GRAPHICS = {
        zoomSpeed: 0.1,
        backgroundColor: "#eee",
        trackColor: "lightgreen",
        wallColor: "black",
        wallWidth: 0.5,
        ballColor: "white",
        ballBorderWidth: 0.5,
        cursorLength: 3,
        cursorColor: "rgba(0, 0, 0, 0.5)",
        cursorLineWidth: 2,
        ballBorderColor: "black",
        holeColor: "#000",
        uiColor: "black",
        uiFont: "Arial",
        gridLineColor: "rgba(0, 0, 0, 0.5)",
        outerPadding: () => Math.max(Math.min(canvas.width, canvas.height) * 0.05, 20)
    }

    const cursorTurnSpeed = 0.025
    const touchMinDistance = 10
    const minShootStrength = 0.5
    const maxShootStrength = 10
    let totalShots = 0
    const editGridSizeStep = 5

    const drawBackground = () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = GRAPHICS.backgroundColor
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    class Wall {

        constructor(p1, p2) {
            this.p1 = p1
            this.p2 = p2
        }

        reflect(direction) {
            let angleDifference = direction.angle - this.normalDirection.angle
            return direction.rotate(-angleDifference * 2).scale(-1)
        }


        get points() {
            return [this.p1, this.p2]
        }

        get direction() {
            return this.p2.sub(this.p1)
        }

        get normalDirection() {
            let d = this.direction
            return new Vector2d(-d.y, d.x)
        }

        distanceToPoint(point) {
            let p2toP1 = this.p2.sub(this.p1)
            let p2toPoint = point.sub(this.p1)
            let d = p2toP1.dot(p2toPoint) / (p2toP1.length ** 2)

            if (d < 0) {
                return this.p1.distance(point)
            } else if (d > 1) {
                return this.p2.distance(point)
            } else {
                let closestPoint = this.p1.add(p2toP1.scale(d))
                return closestPoint.distance(point)
            }
        }

        touchesBall(ball) {
            return this.distanceToPoint(ball.pos) < ball.radius
        }

    }

    class MinigolfHole {

        constructor(course) {
            this.course = course
            this.pos = new Vector2d(0, 0)
            this.radius = 3
        }

        touchesBall(ball) {
            return this.pos.distance(ball.pos) < this.radius
        }

        draw() {
            context.fillStyle = GRAPHICS.holeColor
            context.beginPath()
            context.arc(...pointToCanvas(this.pos).array, this.radius * zoomFactor, 0, 2 * Math.PI)
            context.fill()
        }

    }

    class MinigolfBall {

        constructor(course) {
            this.pos = new Vector2d(0, 0)
            this.vel = new Vector2d(0, 0)
            this.radius = 2.5
            this.course = course
            
            this.canShoot = true
            this.cursorAngle = 0
            this.shootStrength = 3
            this.inHole = false
            this.holeZoomFactor = 1
        }

        get fullyInHole() {
            return this.inHole && this.holeZoomFactor == 0
        }

        drawCursor() {
            let cursorDirection = Vector2d.fromAngle(this.cursorAngle)
                .scale(zoomFactor * GRAPHICS.cursorLength)
                .scale(1 + this.shootStrength * 0.5)
                .scale(1 + Math.sin(performance.now() / 100) * 0.05)
            let cursorStart = pointToCanvas(this.pos)
            let cursorEnd = cursorStart.add(cursorDirection)
            
            context.strokeStyle = GRAPHICS.cursorColor
            context.lineWidth = GRAPHICS.cursorLineWidth * zoomFactor
            context.lineCap = "round"

            context.beginPath()
            context.moveTo(...cursorStart.array)
            context.lineTo(...cursorEnd.array)
            context.stroke()

            context.lineCap = "butt"
        }

        shoot() {
            if (!this.canShoot) return

            this.vel = Vector2d.fromAngle(this.cursorAngle).scale(this.shootStrength)
            this.canShoot = false
            totalShots++
        }

        draw() {
            if (this.canShoot) {
                this.drawCursor()
            }

            let ballZoomFactor = this.holeZoomFactor * zoomFactor

            context.fillStyle = GRAPHICS.ballColor
            context.strokeStyle = GRAPHICS.ballBorderColor
            context.lineWidth = GRAPHICS.ballBorderWidth * ballZoomFactor
            context.beginPath()
            context.arc(...pointToCanvas(this.pos).array, this.radius * ballZoomFactor, 0, 2 * Math.PI)
            context.fill()
            context.stroke()
        }

        update() {
            let gravityBox = this.inGravityBox()

            if (this.inHole) {
                let delta = this.course.hole.pos.sub(this.pos)
                this.pos.iadd(delta.scale(0.1))

                this.holeZoomFactor -= 0.01
                if (this.holeZoomFactor < 0.01) {
                    this.holeZoomFactor = 0
                }
                return
            } else if (this.vel.length < 0.1 && !gravityBox) {
                if (!this.canShoot) {
                    this.canShoot = true
                    this.cursorAngle = this.vel.angle
                }
                return
            }

            if (gravityBox) {
                this.vel.iadd(gravityBox.gravityForce)
            }

            let subSteps = Math.ceil(this.vel.length * 2)
            this.vel.iscale(1 / subSteps)
            for (let i = 0; i < subSteps; i++) {
                this.subupdate()
            }
            this.vel.iscale(subSteps)

            this.vel.iscale(DAMPENING_FACTOR)
        }

        inGravityBox() {
            for (let box of this.course.boxes) {
                if (box.ballInside(this)) {
                    if (box.type == "gravity") {
                        return box
                    }
                }
            }   
        }

        subupdate() {
            this.pos.iadd(this.vel)

            for (let wall of this.course.walls) {
                if (wall.touchesBall(this)) {
                    this.pos.isub(this.vel)
                    this.vel = wall.reflect(this.vel)
                    this.pos.iadd(this.vel)
                }
            }

            if (this.course.hole && this.course.hole.touchesBall(this)) {
                this.inHole = true
                this.canShoot = false
            }
        }

    }

    class MinigolfBox {

        constructor(course, type="normal") {
            this.course = course
            this.type = type
            this.pos = new Vector2d(0, 0)
            this.size = new Vector2d(0, 0)
        }

        static fromData(course, data) {
            if (data.type == "gravity")
                return MinigolfGravityBox.fromData(course, data)
            let box = new MinigolfBox(course)
            box.pos = new Vector2d(data.pos.x, data.pos.y)
            box.size = new Vector2d(data.size.x, data.size.y)
            return box
        }

        ballInside(ball) {
            let topLeft = this.pos
            let bottomRight = this.pos.add(this.size)
            let ballPos = ball.pos
            return (
                ballPos.x > topLeft.x - ball.radius &&
                ballPos.x < bottomRight.x + ball.radius &&
                ballPos.y > topLeft.y - ball.radius &&
                ballPos.y < bottomRight.y + ball.radius
            )
        }

        draw() {
            context.fillStyle = GRAPHICS.backgroundColor
            context.strokeStyle = GRAPHICS.wallColor
            context.lineWidth = GRAPHICS.wallWidth * zoomFactor

            let topLeft = pointToCanvas(this.pos)
            let bottomRight = pointToCanvas(this.pos.add(this.size))

            context.beginPath()
            context.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
            context.fill()
            context.stroke()
        }

    }

    class MinigolfGravityBox extends MinigolfBox {

        constructor(course) {
            super(course, "gravity")
            this.forceStrength = 0.1
            this.angle = 0
        }

        get gravityForce() {
            return Vector2d.fromAngle(this.angle).scale(this.forceStrength)
        }

        static fromData(course, data) {
            let box = new MinigolfGravityBox(course)
            box.pos = new Vector2d(data.pos.x, data.pos.y)
            box.size = new Vector2d(data.size.x, data.size.y)
            box.gravity = data.gravity
            if (data.angle) box.angle = data.angle
            if (data.force) box.forceStrength = data.force
            return box
        }

        draw() {
            const drawArrow = (pos, angle, length) => {
                angle += Math.PI
                context.save()
                context.translate(...pointToCanvas(pos).array)
                context.rotate(angle)
                context.beginPath()
                context.moveTo(length * zoomFactor, -length * zoomFactor)
                context.lineTo(-length * zoomFactor, 0)
                context.lineTo(length * zoomFactor, length * zoomFactor)
                context.fill()
                context.restore()
            }

            context.fillStyle = "rgba(0, 0, 0, 0.3)"
            context.lineWidth = GRAPHICS.wallWidth * zoomFactor

            let topLeft = pointToCanvas(this.pos)
            let bottomRight = pointToCanvas(this.pos.add(this.size))

            context.beginPath()
            context.rect(
                topLeft.x,
                topLeft.y,
                bottomRight.x - topLeft.x,
                bottomRight.y - topLeft.y
            )
            context.fill()

            let center = this.pos.add(this.size.scale(0.5))
            let arrowLength = 0.3 * Math.min(this.size.x, this.size.y)
            let arrowAngle = this.gravityForce.angle
            context.fillStyle = GRAPHICS.trackColor
            drawArrow(center, arrowAngle, arrowLength)
        }

    }

    class MinigolfCourse {

        getBoundingBox() {
            const bounding = {
                y: {
                    min: Infinity,
                    max: -Infinity
                },
                x: {
                    min: Infinity,
                    max: -Infinity
                }
            }

            for (let point of this.shapePoints) {
                if (point.x < bounding.x.min) bounding.x.min = point.x
                if (point.y < bounding.y.min) bounding.y.min = point.y
                if (point.x > bounding.x.max) bounding.x.max = point.x
                if (point.y > bounding.y.max) bounding.y.max = point.y
            }

            return {
                min: pointToCanvas(new Vector2d(bounding.x.min, bounding.y.min)),
                max: pointToCanvas(new Vector2d(bounding.x.max, bounding.y.max)),
            }
        }

        constructor() {
            this.name = "Unnamed Course"
            this.walls = []
            this.shapePoints = []
            this.ballStartPos = new Vector2d(0, 0)
            this.holePos = new Vector2d(0, 0)
            this.ball = undefined
            this.hole = undefined
            this.boxes = []
        }

        get completed() {
            return this.ball && this.ball.fullyInHole
        }

        setShape(points) {
            this.shapePoints = points
            this.walls = []

            for (let i = 0; i < points.length; i++) {
                this.walls.push(new Wall(points[i], points[(i + 1) % points.length]))
            }
        }

        addBall() {
            this.ball = new MinigolfBall(this)
            this.ball.pos = this.ballStartPos
        }

        addHole() {
            this.hole = new MinigolfHole(this)
            this.hole.pos = this.holePos
        }

        drawShape(editMode) {
            context.beginPath()
            let lastShapePoint = this.shapePoints[this.shapePoints.length - 1]
            context.moveTo(...pointToCanvas(lastShapePoint).array)
            for (let i = 0; i < this.shapePoints.length; i++) {
                context.lineTo(...pointToCanvas(this.shapePoints[i]).array)
            }
            context.closePath()

            context.fillStyle = GRAPHICS.trackColor
            context.fill()

            context.strokeStyle = GRAPHICS.wallColor
            context.lineWidth = GRAPHICS.wallWidth * zoomFactor
            context.stroke()
        }

        drawEditOverlay() {
            this.drawGrid()
            let squareSize = 20
            for (let i = 0; i < this.shapePoints.length; i++) {
                context.fillStyle = "rgba(0, 0, 0, 0.5)"
                if (i == this.selectedShapePointIndex) {
                    context.fillStyle = "rgba(255, 0, 0, 0.5)"
                }
                context.fillRect(
                    ...pointToCanvas(this.shapePoints[i]).sub(new Vector2d(squareSize / 2, squareSize / 2)).array,
                    squareSize, squareSize
                )
            }
        }

        drawUI() {
            context.fillStyle = GRAPHICS.uiColor
            context.font = GRAPHICS.uiFont
            context.textAlign = "left"
            context.textBaseline = "top"
            let textSize = 5 * zoomFactor
            context.font = textSize + "px " + GRAPHICS.uiFont
            let pos = pointToCanvas(this.shapePoints[0].add(new Vector2d(3, 3)))
            context.fillText(this.name, pos.x, pos.y)
        }

        addBox(box) {
            this.boxes.push(box)
        }

        drawGrid() {
            const drawGridLine = (p1, p2) => {
                context.strokeStyle = GRAPHICS.gridLineColor
                context.lineWidth = 1
                context.beginPath()
                context.moveTo(...pointToCanvas(p1).array)
                context.lineTo(...pointToCanvas(p2).array)
                context.stroke()
                context.closePath()
            }

            for (let x = 0; x <= worldSize.x; x += editGridSizeStep) {
                drawGridLine(
                    new Vector2d(x, 0),
                    new Vector2d(x, worldSize.y)
                )
            }

            for (let y = 0; y <= worldSize.y; y += editGridSizeStep) {
                drawGridLine(
                    new Vector2d(0, y),
                    new Vector2d(worldSize.x, y)
                )
            }
        }

        draw(editMode=false, drawBackgroundPlease=true) {
            if (drawBackgroundPlease) drawBackground()
            this.drawShape(editMode)

            for (let box of this.boxes) {
                box.draw()
            }

            if (editMode) {
                this.drawEditOverlay()
            }

            this.drawUI()

            if (this.hole !== undefined) {
                this.hole.draw()
            }

            if (this.ball !== undefined) {
                this.ball.draw()
            }
        }

        static fromData(data) {
            let course = new MinigolfCourse()
            course.name = data.name
            course.setShape(data.shapePoints.map(p => new Vector2d(p.x, p.y)))
            course.ballStartPos = new Vector2d(data.ballStartPos.x, data.ballStartPos.y)
            course.holePos = new Vector2d(data.holePos.x, data.holePos.y)
            course.addBall()
            course.addHole()

            let boxData = data.boxes || []
            for (let box of boxData) {
                course.addBox(MinigolfBox.fromData(course, box))
            }

            return course
        }

        toJSONString() {
            let data = {}
            data.name = this.name
            data.shapePoints = this.shapePoints.map(p => ({ x: p.x, y: p.y }))
            data.ballStartPos = { x: this.ballStartPos.x, y: this.ballStartPos.y }
            data.holePos = { x: this.holePos.x, y: this.holePos.y }
            data.boxes = this.boxes.map(b => {
                let boxData = {}
                boxData.type = b.type
                boxData.pos = { x: b.pos.x, y: b.pos.y }
                boxData.size = { x: b.size.x, y: b.size.y }
                boxData.angle = b.angle
                boxData.force = b.forceStrength
                return boxData
            })
            return JSON.stringify(data)
        }

    }

    const courses = courseData.map(MinigolfCourse.fromData)

    if (!courses[args.level - 1]) {
        terminalWindow.close()
        throw new Error(`Level ${args.level} doesn't exist (yet)`)
    }

    terminal.onInterrupt(() => {
        gameRunning = false
        terminalWindow.close()
    })

    function drawLines(lines, sizeFactor=1) {
        context.fillStyle = GRAPHICS.uiColor
        context.textAlign = "left"
        context.textBaseline = "top"
        let textSize = 5 * zoomFactor * sizeFactor
        context.font = textSize + "px " + "monospace"
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], 10, 10 + i * textSize)
        }
    }

    let gameRunning = true

    let course = courses[args.level - 1]

    if (args.file) {

        terminal.printLine(`Loading course from file ${args.file}...`)

        try {

            let file = await terminal.getFile(args.file)
            if (file.type != FileType.READABLE) {
                throw new Error(`File ${args.file} is not readable`)
            }

            let fileData = JSON.parse(file.content)
            course = MinigolfCourse.fromData(fileData)

        } catch (e) {
            terminalWindow.close()
            throw e
        }

    }

    if (args.edit) {

        course.name = "New Course"

        const moveAllInDirection = (direction) => {
            for (let i = 0; i < course.shapePoints.length; i++) {
                course.shapePoints[i] = course.shapePoints[i].add(direction)
            }
            course.ballStartPos = course.ballStartPos.add(direction)
            course.holePos = course.holePos.add(direction)
            for (let box of course.boxes) {
                box.pos = box.pos.add(direction)
            }
            course.addBall()
            course.addHole()
        }

        course.selectedShapePointIndex = 0

        let fileData = ""
        zoomFactor = 4
        addEventListener("keydown", e => {
            if (!gameRunning) return

            let selectedPoint = course.shapePoints[course.selectedShapePointIndex]
        
            if (e.shiftKey || e.key == "Tab") {
                if (e.key == "ArrowRight" || (e.key == "Tab" && !e.shiftKey)) {
                    course.selectedShapePointIndex++
                    e.preventDefault()
                } else if (e.key == "ArrowLeft" || (e.key == "Tab" && e.shiftKey)) {
                    course.selectedShapePointIndex--
                    e.preventDefault()
                }
            } else {
                if (e.key == "ArrowUp") {
                    selectedPoint.y -= editGridSizeStep
                } else if (e.key == "ArrowDown") {
                    selectedPoint.y += editGridSizeStep
                } else if (e.key == "ArrowLeft") {
                    selectedPoint.x -= editGridSizeStep
                } else if (e.key == "ArrowRight") {
                    selectedPoint.x += editGridSizeStep
                }
            }

            if (e.key == "+") {
                zoomFactor += 0.2
            }
            
            else if (e.key == "-") {
                zoomFactor -= 0.2
            }

            else if (e.code == "Numpad8") {
                moveAllInDirection(new Vector2d(0, -editGridSizeStep))
            }

            else if (e.code == "Numpad2") {
                moveAllInDirection(new Vector2d(0, editGridSizeStep))
            }

            else if (e.code == "Numpad4") {
                moveAllInDirection(new Vector2d(-editGridSizeStep, 0))
            }

            else if (e.code == "Numpad6") {
                moveAllInDirection(new Vector2d(editGridSizeStep, 0))
            }

            else if (e.key == "Backspace") {
                if (course.shapePoints.length == 1) return
                course.shapePoints.splice(course.selectedShapePointIndex, 1)
                course.selectedShapePointIndex--
            }

            else if (e.key == " ") {
                course.shapePoints.splice(course.selectedShapePointIndex, 0,
                    selectedPoint.copy())
            }

            else if (e.key == "s") {
                gameRunning = false
            }

            else if (e.key == "h") {
                course.holePos = selectedPoint.copy()
                course.addHole()
            }

            else if (e.key == "b") {
                course.ballStartPos = selectedPoint.copy()
                course.addBall()
            }

            if (course.selectedShapePointIndex < 0)
                course.selectedShapePointIndex = course.shapePoints.length - 1
            if (course.selectedShapePointIndex >= course.shapePoints.length)
                course.selectedShapePointIndex = 0
        })

        function loop() {
            viewCentre = new Vector2d(canvas.width, canvas.height).scale(0.5)
            course.draw(true)
            drawLines([ 
                "+       Zoom in",
                "-       Zoom out",
                "↑       Move up",
                "↓       Move down",
                "←       Move left",
                "→       Move right",
                "TAB     Move selection",
                "SPACE   Add point",
                "BACKSP  Delete point",
                "S       Save",
                "H       Set hole pos",
                "B       Set ball pos",
                "CTRL+C  Stop Editor",
                "Numpad  Move in grid"
            ]) 

            if (gameRunning)
                terminal.window.requestAnimationFrame(loop)
        }

        loop()

        while (gameRunning) await sleep(100)

        terminalWindow.close()

        while (true) {
            try {
                let name = await terminal.prompt("How should the course be called? ")
                course.name = name
                fileData = course.toJSONString()
                let fileName = name.toLowerCase().replace(/ /g, "_") + ".mniglf"
                await terminal.createFile(fileName, TextFile, fileData)
                terminal.printSuccess("Course saved as " + fileName)
                await terminal.fileSystem.reload()
                let path = terminal.currFolder.path + "/" + fileName
                terminal.printCommand("Play the course", `minigolf -f ${path}`)
                break
            } catch (e) {
                terminal.printError(e.message)
            }
        }

    } else {

        let coursesFinished = 0
        let currCourseIndex = args.level - 1
        let currCourse = course

        let keysDown = new Set()
        let touchPos = null
        let touchDownPos = null
        let validKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "])

        addEventListener("keydown", e => {
            if (!gameRunning) return
            keysDown.add(e.key)
            if (validKeys.has(e.key)) e.preventDefault()
        })
        addEventListener("keyup", e => keysDown.delete(e.key))
        addEventListener("touchstart", e => {
            let rect = canvas.getBoundingClientRect()
            touchPos = new Vector2d(
                e.touches[0].clientX - rect.left,
                e.touches[0].clientY - rect.top
            )
            touchDownPos = touchPos.copy()
        })
        addEventListener("touchmove", e => {
            let rect = canvas.getBoundingClientRect()
            touchPos = new Vector2d(
                e.touches[0].clientX - rect.left,
                e.touches[0].clientY - rect.top
            )
        })
        addEventListener("touchend", e => {
            if (touchDownPos !== null && touchPos !== null) {
                let distance = touchPos.distance(touchDownPos)
                if (distance > touchMinDistance) {
                    currCourse.ball.shoot()
                }
            }

            touchDownPos = null
            touchPos = null
        })

        function handleInputs() {
            if (!currCourse.ball.canShoot)
                return

            if (keysDown.has("ArrowLeft"))
                currCourse.ball.cursorAngle -= cursorTurnSpeed
            if (keysDown.has("ArrowRight"))
                currCourse.ball.cursorAngle += cursorTurnSpeed
            if (keysDown.has("ArrowUp"))
                currCourse.ball.shootStrength += 0.25
            if (keysDown.has("ArrowDown"))
                currCourse.ball.shootStrength -= 0.25
            if (keysDown.has(" "))
                currCourse.ball.shoot()

            if (touchPos !== null) {
                let cursorPos = pointToCanvas(currCourse.ball.pos)
                currCourse.ball.cursorAngle = cursorPos.angleTo(touchPos) + Math.PI
                let maxDistance = Math.min(
                    Math.abs(cursorPos.x - canvas.width),
                    Math.abs(cursorPos.y - canvas.height),
                    Math.abs(cursorPos.x),
                    Math.abs(cursorPos.y)
                )
                currCourse.ball.shootStrength = cursorPos.distance(touchPos) / maxDistance * maxShootStrength
            }
            

            currCourse.ball.shootStrength = Math.max(minShootStrength, Math.min(maxShootStrength, currCourse.ball.shootStrength))
        }

        function adjustZoom() {
            let padding = GRAPHICS.outerPadding()
            let courseBounding = currCourse.getBoundingBox()

            if (courseBounding.min.x > padding && courseBounding.min.y > padding)
                zoomFactor += GRAPHICS.zoomSpeed

            padding -= 10
            if (courseBounding.min.x < padding || courseBounding.min.y < padding)
                zoomFactor -= GRAPHICS.zoomSpeed
            
            viewCentre = new Vector2d(canvas.width, canvas.height).scale(0.5)
        }

        function loop() {
            handleInputs()
            currCourse.ball.update(1)
            drawBackground()
            drawLines([
                "Arrow keys to move cursor",
                "Space to shoot",
                "Or use touch controls"
            ], 0.7)
            currCourse.draw(false, false)
            adjustZoom()

            if (currCourse.completed) {
                currCourseIndex = (currCourseIndex + 1)
                currCourse = courses[currCourseIndex]
                if (currCourse === undefined) {
                    gameRunning = false
                }
                coursesFinished++
                if (args.file) {
                    gameRunning = false
                }
            }

            if (gameRunning)
                terminal.window.requestAnimationFrame(loop)
        }

        loop()

        while (gameRunning) await sleep(100)

        terminalWindow.close()

        if (args.file) {
            terminal.printSuccess(`You completed the ${course.name} course!`)
            terminal.printLine(`Your score is ${Math.floor(100 / totalShots)}`)
        } else {
            terminal.printSuccess(`You completed ${coursesFinished} courses!`)
            terminal.printLine("I'm currently working on adding more, so stay tuned!")
    
            if (coursesFinished == courses.length) {
                let score = Math.floor(coursesFinished / totalShots * 100)
                terminal.printLine(`Your score is ${score}`)
                await HighscoreApi.registerProcess("minigolf")
                await HighscoreApi.uploadScore(score)
            } else {
                terminal.printLine("You didn't complete all courses, so no score was registered.")
            }
        }

    }

}, {
    description: "play a game of minigolf",
    args: {
        "?l=level:i": "open a specific level",
        "?e=edit:b": "open map editor",
        "?f=file:s": "open a specific file",
        "?fullscreen:b": "activate fullscreen mode"
    },
    defaultValues: {
        level: 1
    },
    isGame: true
})