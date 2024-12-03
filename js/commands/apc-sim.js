terminal.addCommand("apc-sim", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    const nicerProblemName = args.problem.replaceAll("-", " ")
    const terminalWindow = terminal.modules.window.make({
        name: `APC Animation (${nicerProblemName})`, fullscreen: args.f})

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const canvasSize = () => new Vector2d(canvas.width, canvas.height)
    const backgroundColor = "white"

    let uniqueIdCount = 0
    function makeUniqueId() {
        return uniqueIdCount++
    }

    function randomPosition() {
        return Vector2d.fromFunc(Math.random).sub(UnitVector2d.scale(0.5)).scale(2)
    }

    function easeInOut(t) {
        if ((t /= 1 / 2) < 1) return 1 / 2 * t * t
        return -1 / 2 * ((--t) * (t - 2) - 1)
    }

    function clipPosToScreenPos(clipPos) {
        return clipPos.add(UnitVector2d).mul(canvasSize().scale(0.5))
    }

    function screenPosToClipPos(screenPos) {
        return screenPos.div(canvasSize()).scale(2).sub(UnitVector2d)
    }

    class ApcScene {

        constructor() {
            this.objects = []
            this.animationObjects = new Map()
            this.animationObjectId = 0
        }

        add(object) {
            this.objects.push(object)
            return this
        }

        remove(object) {
            this.objects = this.objects.filter(o => o.id !== object.id)
            return this
        }

        animateAdd(object, ms=500) {
            if (object.type == "line") {
                this.animateAddLine(object, ms)
            } else if (object.type == "point") {
                this.animateAddPoint(object, ms)
            }
            return this
        }

        _makeAnimation(obj, changeFunc, ms) {
            const originalObj = obj.copy()
            const startTime = Date.now()
            const objectId = this.animationObjectId++

            changeFunc(obj, originalObj, 0)

            const update = () => {
                const progress = (Date.now() - startTime) / ms
                if (progress >= 1) {
                    if (this.animationObjects.has(objectId)) {
                        this.animationObjects.delete(objectId)
                        this.add(originalObj)
                    }
                } else {
                    changeFunc(obj, originalObj, progress)
                }
            }

            this.animationObjects.set(objectId, {
                object: obj, update
            })
        }

        animateAddPoint(point, ms) {
            this._makeAnimation(
                point, 
                (point, ogPoint, t) => {
                    point.radius = ogPoint.radius * t
                }, ms)
        }

        animateAddLine(line, ms) {
            this._makeAnimation(
                line, 
                (line, ogLine, t) => {
                    line.p2 = ogLine.p1.lerp(ogLine.p2, t)
                }, ms)
        }

        render() {
            context.fillStyle = backgroundColor
            context.fillRect(0, 0, canvas.width, canvas.height)
            for (const object of this.objects) {
                object.draw()
            }
            for (const animationObject of this.animationObjects.values()) {
                animationObject.update()
                animationObject.object.draw()
            }
        }

    }

    class ApcPoint {

        constructor(pos, {color="black", radius=5, style="normal", name=null, id=null}={}) {
            this.id = id ?? makeUniqueId()
            this.type = "point"
            this.pos = pos
            this.color = color
            this.radius = radius
            this.style = style
            this.name = name
        }

        copy() {
            return new ApcPoint(
                this.pos.copy(),
                {color: this.color, radius: this.radius, style: this.style, name: this.name, id: this.id}
            )
        }

        draw() {
            const screenPos = clipPosToScreenPos(this.pos)

            context.fillStyle = this.color
            context.strokeStyle = this.color
            if (this.style == "normal") {
                context.beginPath()
                context.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2)
                context.fill()
            } else if (this.style == "box") {
                context.fillRect(screenPos.x - this.radius,
                    screenPos.y - this.radius,
                    this.radius * 2, this.radius * 2)
            } else if (this.style.toLowerCase() == "x") {
                context.beginPath()
                context.lineWidth = 1
                
                context.moveTo(screenPos.x - this.radius, screenPos.y - this.radius)
                context.lineTo(screenPos.x + this.radius, screenPos.y + this.radius)
                context.moveTo(screenPos.x - this.radius, screenPos.y + this.radius)
                context.lineTo(screenPos.x + this.radius, screenPos.y - this.radius)

                context.stroke()
            }

            if (this.name !== null) {
                const textMetric = context.measureText(this.name)
                const textHeight = textMetric.fontBoundingBoxAscent + textMetric.fontBoundingBoxDescent
            
                context.fillStyle = backgroundColor
                context.fillRect(
                    screenPos.x + this.radius * 2,
                    screenPos.y,
                    textMetric.width, textHeight
                )

                context.textBaseline = "top"
                context.fillStyle = this.color
                context.fillText(this.name,
                    screenPos.x + this.radius * 2,
                    screenPos.y)
            }
        }

    }

    class ApcLine {

        constructor(p1, p2, {color="black", width=1, style="normal", id=null}={}) {
            this.id = id ?? makeUniqueId()
            this.type = "line"
            this.p1 = (p1 instanceof ApcPoint) ? p1.pos.copy() : p1
            this.p2 = (p2 instanceof ApcPoint) ? p2.pos.copy() : p2
            this.color = color
            this.width = width
            this.style = style
        }

        static xyxy(x1, y1, x2, y2) {
            return new ApcLine(
                new Vector2d(x1, y1),
                new Vector2d(x2, y2)
            )
        }

        distance(point) {
            return distancePointLineSegment(point, this.p1, this.p2)
        }

        containsPoint(point) {
            return this.distance(point) < 0.001
        }

        calcIntersection(otherLine) {
            return calcLineIntersection(this.p1, this.p2, otherLine.p1, otherLine.p2)
        }

        copy() {
            return new ApcLine(
                this.p1.copy(), this.p2.copy(),
                {color: this.color, width: this.width, style: this.style, id: this.id}
            )
        }

        draw() {
            context.beginPath()
            const s1 = clipPosToScreenPos(this.p1)
            const s2 = clipPosToScreenPos(this.p2)

            context.moveTo(s1.x, s1.y)
            context.lineTo(s2.x, s2.y)

            if (this.style == "normal") {
                context.setLineDash([])
            } else if (this.style == "dashed") {
                context.setLineDash([10, 10])
            }

            context.strokeStyle = this.color
            context.lineWidth = this.width
            context.stroke()
        }

    }

    const scene = new ApcScene()

    let running = true

    terminal.onInterrupt(() => {
        running = false
        terminalWindow.close()
    })

    function renderLoop() {
        scene.render()

        if (running) {
            window.requestAnimationFrame(renderLoop)
        }
    }

    terminal.window.scene = scene

    const windowBorderLines = [
        new ApcLine(new Vector2d(-1, -1), new Vector2d(-1, 1)),
        new ApcLine(new Vector2d(-1, 1), new Vector2d(1, 1)),
        new ApcLine(new Vector2d(1, 1), new Vector2d(1, -1)),
        new ApcLine(new Vector2d(1, -1), new Vector2d(-1, -1)),
    ]

    renderLoop()

    const apcProblems = {
        "can-x-see-q": async () => {

            // CAN X SEE Q PROBLEM

            const X = new ApcPoint(ZeroVector2d, {style: "x"})
            scene.animateAdd(X, 1000)

            await sleep(1000)

            const allEndpoints = []
            const allLineSegments = []
            const allConnecting = []

            for (let i = 0; i < 5; i++) {
                let pos1 = null
                let pos2 = null

                while (
                    pos1 === null || pos1.distance(pos2) > 1 || pos1.distance(pos2) < 0.2
                    || Math.abs(pos1.sub(X.pos).normalized.dot(pos2.sub(X.pos).normalized)) > 0.2
                    || Math.max(pos1.abs().max, pos2.abs().max) > 0.8
                    || distancePointLineSegment(X.pos, pos1, pos2) < 0.2
                    || Math.min(...allEndpoints.map(([p1, p2]) => distancePointLineSegment(pos1, p1, p2))) < 0.1
                    || Math.min(...allEndpoints.map(([p1, p2]) => distancePointLineSegment(pos2, p1, p2))) < 0.1
                    || allEndpoints.some(([p1, p2]) => calcLineIntersection(p1, p2, pos1, pos2))
                ) {
                    pos1 = randomPosition()
                    pos2 = randomPosition()
                }

                const p1 = new ApcPoint(pos1, {radius: 4})
                const p2 = new ApcPoint(pos2, {radius: 4})

                const lineSegment = new ApcLine(p1, p2)

                scene.animateAdd(p1).animateAdd(p2).animateAdd(lineSegment)
                allEndpoints.push([pos1, pos2])
                allLineSegments.push(lineSegment)
            }
        
            await sleep(1000)

            for (const endPoint of allEndpoints.flat()) {
                const connectingLine = new ApcLine(X, endPoint, {style: "dashed", color: "blue"})
                scene.animateAdd(connectingLine)

                await sleep(1000)

                let foundIntersection = null
                for (let otherLine of allLineSegments) {
                    // skip if it's the same line
                    if (otherLine.containsPoint(endPoint)) {
                        continue
                    }

                    const intersection = connectingLine.calcIntersection(otherLine)
                    if (intersection !== null) {
                        foundIntersection = intersection
                        break
                    }
                }

                scene.remove(connectingLine)

                if (foundIntersection) {
                    const intersectionPoint = new ApcPoint(foundIntersection, {style: "x", color: "red", radius: 10})
                    scene.animateAdd(intersectionPoint)
                    setTimeout(() => {
                        scene.remove(intersectionPoint)
                    }, 1000)
                } else {
                    let closestIntersection = null
                    let closestIntersectionDistance = Infinity

                    const delta = connectingLine.p2.sub(connectingLine.p1)
                    connectingLine.p2 = connectingLine.p1.add(delta.normalized.scale(3))
                    
                    for (const otherLine of allLineSegments.concat(windowBorderLines)) {
                        if (otherLine.containsPoint(endPoint)) {
                            continue
                        }
    
                        const intersection = connectingLine.calcIntersection(otherLine)
                        if (intersection !== null && intersection.distance(endPoint) < closestIntersectionDistance) {
                            closestIntersectionDistance = intersection.distance(endPoint)
                            closestIntersection = intersection
                        }
                    }

                    if (closestIntersection !== null) {
                        connectingLine.p2 = closestIntersection
                        connectingLine.style = "normal"
                        connectingLine.color = "rgba(0, 0, 255, 0.5)"
                        allConnecting.push(connectingLine)

                        const intersectionPoint = new ApcPoint(closestIntersection, {color: "rgba(0, 0, 255, 0.5)", radius: 3})
                        scene.animateAdd(connectingLine).animateAdd(intersectionPoint)
                        await sleep(1000)
                    }
                }
            }

            await sleep(1500)

            const Q = new ApcPoint(randomPosition(), {color: "red", name: "q"})
            scene.animateAdd(Q)
            await sleep(1000)

            await sleep(100000)
        }
    }

    await apcProblems[args.problem]()

    terminalWindow.close()
}, {
    description: "play an animation relating to an apc problem",
    args: {
        "problem:e:can-x-see-q": "problem to animate",
        "?f=fullscreen:b": "open in fullscreen"
    }
})