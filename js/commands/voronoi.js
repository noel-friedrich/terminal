terminal.addCommand("voronoi", async function(args) {
    const NUM_RANDOM_POINTS = args.n
    const POINT_RADIUS_PX = 8
    const LINES_COLOR = "white"

    await terminal.modules.import("geometry2d", window)
    await terminal.modules.load("window", terminal)

    const terminalWindow = terminal.modules.window.make({
        name: args.r ? "Voronoi Diagram Animation" : "Click and Drag Points",
        fullscreen: args.fullscreen
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const canvasSize = () => new Point(canvas.width, canvas.height)

    const canvasBoundingPoints = new GeometryObjectCollection([
        new Point(0, 0), new Point(canvas.width, 0),
        new Point(canvas.width, canvas.height),
        new Point(0, canvas.height), 
    ])

    const canvasBoundingLines = new GeometryObjectCollection(
        canvasBoundingPoints.objects.map((p, i) => {
            return new LineSegment(p, canvasBoundingPoints.objects[(i + 1) % 4])
        })
    )

    function orderPointsByAngleAround(points, center) {
        const pointAngles = points.map(p => p.angleTo(center))
        const indeces = Array.from(points.keys())
        indeces.sort((i, j) => pointAngles[i] - pointAngles[j])
        return indeces.map(i => points[i])
    }

    const epsilon = 1e-4

    let lastHue = 0
    function randomColor() {
        const color = Color.fromHSL(lastHue, 0.8, 0.5)
        lastHue = (lastHue + Math.PI / 8) % 1
        return color
    }

    class VoronoiDiagram {

        constructor(points) {
            this.points = points ?? []
            this.pointColors = []
            this.polygons = []
        }

        addPoint(point) {
            this.points.push(point)
            this.pointColors.push(randomColor())
        }

        getClosestPointAt(position) {
            let closestDistance = Infinity
            let closestPoint = null
            for (const point of this.points) {
                const distance = point.distance(position)
                if (distance < closestDistance) {
                    closestDistance = distance
                    closestPoint = point
                }
            }
            return closestPoint
        }

        update() {
            this.polygons = []

            for (const point of this.points) {
                const bisectors = new GeometryObjectCollection()
                const boundingIntersections = new GeometryObjectCollection()

                for (const otherPoint of this.points) {
                    if (point.equals(otherPoint)) {
                        continue
                    }
                    
                    const midPoint = point.lerp(otherPoint, 0.5)
                    const bisectorAngle = point.angleTo(otherPoint) + Math.PI / 2
                    const bisector = new Line(midPoint, bisectorAngle)
                    bisectors.addObject(bisector)

                    const bisectorEnds = canvasBoundingLines.intersect(bisector)
                    console.assert(bisectorEnds.objects.length == 2)

                    boundingIntersections.addObjects(bisectorEnds.objects)
                }

                const bisectorIntersections = bisectors.selfIntersect()
                const candidatePoints = boundingIntersections
                    .concat(bisectorIntersections)
                    .concat(canvasBoundingPoints)

                // filter points by their nearest point being the correct one
                const goodPoints = candidatePoints.objects.filter(p => {
                    const nearbyP = p.lerp(point, epsilon)
                    const closestPoint = this.getClosestPointAt(nearbyP)
                    return closestPoint.equals(point)
                })

                const polygon = orderPointsByAngleAround(goodPoints, point)
                this.polygons.push(polygon)
            }

            console.assert(this.polygons.length == this.points.length)
        }

        draw() {
            context.fillStyle = "white"
            context.fillRect(0, 0, canvas.width, canvas.height)

            for (let i = 0; i < this.points.length; i++) {
                const point = this.points[i]
                const color = this.pointColors[i]
                const polygon = this.polygons[i]
                
                if (polygon.length >= 3) {
                    context.beginPath()
                    for (let i = 0; i < polygon.length + 1; i++) {
                        const point = polygon[(i + 1) % polygon.length]
                        
                        if (i == 0) {
                            context.moveTo(point.x, point.y)
                        } else {
                            context.lineTo(point.x, point.y)
                        }
                    }
                    
                    const {h, s, l} = color.hsl
                    context.fillStyle = Color.fromHSL(h / 360, s, 0.7).toString()
                    context.fill()

                    context.strokeStyle = LINES_COLOR
                    context.stroke()
                }

                context.beginPath()
                context.arc(point.x, point.y, POINT_RADIUS_PX, 0, Math.PI * 2)
                context.fillStyle = color.toString()
                context.fill()
                context.strokeStyle = LINES_COLOR
                context.stroke()
            }
        }

    }

    const voronoi = new VoronoiDiagram()
    const pointCloud = new GeometryObjectCollection()

    const randomPointInCanvas = () => canvasSize().mul(Point.random().scale(0.8).add(Point.unit11.scale(0.1)))

    for (let i = 0; i < NUM_RANDOM_POINTS; i++) {
        const randomPoint = randomPointInCanvas()
        const distance = pointCloud.distance(randomPoint)

        if (distance < 4 * POINT_RADIUS_PX) {
            i--
            continue
        }

        pointCloud.addObject(randomPoint)
        voronoi.addPoint(randomPoint)
    }

    voronoi.update()
    voronoi.draw()
    let dragPoint = null

    function spawnPoint(event) {
        const point = Point.fromEvent(event, canvas)
        voronoi.addPoint(point)
        voronoi.update()
        voronoi.draw()

        dragPoint = point
    }


    function beginDrag(event) {
        const eventPoint = Point.fromEvent(event, canvas)
        const closestPoint = voronoi.getClosestPointAt(eventPoint)
        if (!closestPoint) {
            return spawnPoint(event)
        }

        const distance = eventPoint.distance(closestPoint)
        if (distance <= POINT_RADIUS_PX * 2) {
            dragPoint = closestPoint
        } else {
            spawnPoint(event)
        }
    }

    function continueDrag(event) {
        if (!dragPoint) {
            return
        }

        const eventPoint = Point.fromEvent(event, canvas)
        dragPoint.x = eventPoint.x
        dragPoint.y = eventPoint.y

        voronoi.update()
        voronoi.draw()
    }

    function releaseDrag(event) {
        dragPoint = null
    }

    function removePoint(event) {
        const eventPoint = Point.fromEvent(event, canvas)
        
        const lengthBefore = voronoi.points.length

        let removeIndeces = []
        for (let i = 0; i < voronoi.points.length; i++) {
            if (voronoi.points[i].distance(eventPoint) <= POINT_RADIUS_PX * 2) {
                removeIndeces.push(i)
            }
        }

        for (let i = removeIndeces.length - 1; i >= 0; i--) {
            voronoi.points.splice(removeIndeces[i], 1)
            voronoi.pointColors.splice(removeIndeces[i], 1)
        }
        
        if (lengthBefore != voronoi.points.length) {
            event.stopImmediatePropagation()
        }

        voronoi.update()
        voronoi.draw()

        return removeIndeces.length > 0
    }

    canvas.addEventListener("mousedown", event => {
        if (event.button == 0) {
            beginDrag(event)
        }
    })

    canvas.addEventListener("mousemove", continueDrag)
    canvas.addEventListener("mouseup", releaseDrag)
    canvas.addEventListener("contextmenu", event => {
        if (removePoint(event)) {
            event.preventDefault()
        }
    })

    canvas.addEventListener("touchstart", beginDrag)
    canvas.addEventListener("touchmove", continueDrag)
    canvas.addEventListener("touchend", releaseDrag)
    
    // for debugging
    terminal.window.voronoi = voronoi

    if (args["random-move"]) {

        function movePointsToTargets(points, targets, reset=false, speed=1) {
            for (let i = 0; i < targets.length; i++) {
                const point = points[i]
                const target = targets[i]

                const delta = target.sub(point)
                if (delta.length > speed * 2) {
                    point.iadd(delta.normalized.scale(speed))
                } else if (reset) {
                    targets[i].set(randomPointInCanvas())
                }
            }
        }

        const targetTargets = voronoi.points.map(p => p.copy())
        const targets = voronoi.points.map(p => p.copy())

        function loop() {
            movePointsToTargets(targets, targetTargets, true, 0.6)
            movePointsToTargets(voronoi.points, targets, false, 0.51)

            voronoi.update()
            voronoi.draw()

            window.requestAnimationFrame(loop)
        }

        loop()
        
    }

}, {
    description: "create voronoi diagrams interactively",
    args: {
        "?n=num-points:i:0~100": "number of random initial points",
        "?r=random-move:b": "make points wander randomly",
        "?f=fullscreen:b": "enable fullscreen mode",
    },
    defaultValues: {
        n: 8
    },
    category: "simulations"
})