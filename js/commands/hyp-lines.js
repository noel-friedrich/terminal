terminal.addCommand("hyp-lines", async function(args) {
    await terminal.modules.import("game", window)

    function initDisplay(size) {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let widthPx = Math.floor(terminal.charWidth * size.x)
        let heightPx = Math.floor(terminal.charWidth * size.y)
        canvas.width = widthPx
        canvas.height = heightPx
        canvas.style.width = widthPx + "px"
        canvas.style.height = heightPx + "px"
        terminal.parentNode.appendChild(canvas)
        canvas.style.border = "2px solid var(--foreground)"
        return [context, canvas]
    }

    const displaySize = new Vector2d(args.width, args.height)
    const displayHeaders = ["Poincaré Disk Model", "Upper Half-Plane Model"]

    terminal.addLineBreak()
    for (const headerText of displayHeaders) {
        const paddingWidthTotal = displaySize.x - headerText.length
        const paddingWidthLeft = Math.ceil(paddingWidthTotal / 2)
        const paddingWidthRight = Math.floor(paddingWidthTotal / 2)

        terminal.print(" ".repeat(paddingWidthLeft))
        terminal.print(headerText)
        terminal.print(" ".repeat(paddingWidthRight))
    }

    class ModelCanvas {

        constructor(viewCentre, viewHeight) {
            const [context, canvas] = initDisplay(displaySize)
            this.context = context
            this.canvas = canvas

            this.viewCentre = viewCentre
            this.viewHeight = viewHeight
        }

        get viewWidth() {
            return this.canvas.width / this.canvas.height * this.viewHeight
        }

        pointToScreenPos(point) {
            const relativePoint = point.sub(this.viewCentre)
            return new Vector2d(
                (relativePoint.x / (this.viewWidth) + 0.5) * this.canvas.width,
                (-relativePoint.y / (this.viewHeight) + 0.5) * this.canvas.height
            )
        }

        screenPosToPoint(screenPos) {
            const x = (screenPos.x / this.canvas.width - 0.5) * this.viewWidth
            const y = -(screenPos.y / this.canvas.height - 0.5) * this.viewHeight
            const relativePoint = new Vector2d(x, y)
            return relativePoint.add(this.viewCentre)
        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }

        drawPoint(point, {atScreenPos=false, radius=5, color="blue",
            label=null, labelSize=13, labelColor=null, labelOffset=null,
            labelBaseline="top", labelAlign="left"
        }={}) {
            labelColor ??= terminal.data.foreground.toString()
            
            this.context.beginPath()
            let screenPos = null
            if (atScreenPos) {
                screenPos = point
            } else {
                screenPos = this.pointToScreenPos(point)
            }

            this.context.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2)
            this.context.fillStyle = color
            this.context.fill()

            if (label !== null) {
                this.context.fillStyle = labelColor
                this.context.textAlign = labelAlign
                this.context.textBaseline = labelBaseline
                this.context.font = `${labelSize}px monospace`
                const labelPos = screenPos.addX(radius).addY(radius)
                if (labelOffset !== null) {
                    labelPos.iadd(labelOffset.scale(labelSize))
                }

                this.context.fillText(label, screenPos.x + radius, screenPos.y + radius)
            }
        }

        connectPoints(points, {atScreenPos=false, color=null, width=1}={}) {
            color ??= terminal.data.foreground.toString()

            this.context.strokeStyle = color
            this.context.lineWidth = width
            this.context.beginPath()

            for (let i = 0; i < points.length; i++) {
                const screenPos = atScreenPos ? points[i] : this.pointToScreenPos(points[i])
                if (i == 0) {
                    this.context.moveTo(screenPos.x, screenPos.y)
                } else {
                    this.context.lineTo(screenPos.x, screenPos.y)
                }
            }

            this.context.stroke()
        }

        drawAxes() {
            const minXY = this.screenPosToPoint(new Vector2d(0, this.canvas.height))
            const maxXY = this.screenPosToPoint(new Vector2d(this.canvas.width, 0))

            // x axis
            this.connectPoints([
                new Vector2d(Math.floor(minXY.x) - 1, 0),
                new Vector2d(Math.ceil(maxXY.x) + 1, 0)
            ])

            // y axis
            this.connectPoints([
                new Vector2d(0, Math.floor(minXY.y) - 1),
                new Vector2d(0, Math.ceil(maxXY.y) + 1)
            ])

            const pinStyling = {color: terminal.data.foreground.toString(), radius: 3}

            for (let x = Math.floor(minXY.x); x <= Math.ceil(maxXY.x); x++) {
                if (x == 0) continue
                this.drawPoint(new Vector2d(x, 0), {label: x, ...pinStyling})
            }

            for (let y = Math.floor(minXY.y); y <= Math.ceil(maxXY.y); y++) {
                const label = Math.abs(y) > 1 ? `${y}i` : (y < 0 ? "-i" : (y > 0 ? "i" : "0"))
                this.drawPoint(new Vector2d(0, y), {label, ...pinStyling})
            }
        }

        drawCircle(point, radius, {color=null, dashed=false, width=1, startAngle=0, endAngle=Math.PI * 2, clockwise=true}={}) {
            color ??= terminal.data.foreground.toString()

            radius = radius / this.viewHeight * this.canvas.height
            this.context.beginPath()
            const screenPos = this.pointToScreenPos(point)
            this.context.arc(screenPos.x, screenPos.y, radius, startAngle, endAngle, !clockwise)
            this.context.strokeStyle = color
            if (dashed) {
                this.context.setLineDash([5, 5])
            }
            this.context.lineWidth = width
            this.context.stroke()
            this.context.setLineDash([])
        }

    }

    terminal.addLineBreak()
    const diskCanvas = new ModelCanvas(new Vector2d(0, 0), 2.5)
    const planeCanvas = new ModelCanvas(new Vector2d(0, 2.5), 6)
    terminal.addLineBreak(2)
    terminal.printLine("Drag to move z1/z2 around and see what happens (use a mouse!)")
    
    // custom styling
    diskCanvas.canvas.style.borderRight = "none"
    planeCanvas.canvas.style.borderLeft = "2px dashed var(--foreground)"

    const z1 = new Vector2d(0.7, 2.5)
    const z2 = new Vector2d(-1.7, 1.5)

    const movablePoints = [z1, z2]

    function diskToPlaneIso(p) {
        // from https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model
        return new Vector2d(
            2 * p.x / (p.x ** 2 + (1 - p.y) ** 2),
            (1 - p.x ** 2 - p.y ** 2) / (p.x ** 2 + (1 - p.y) ** 2)
        )
    }

    function planeToDiskIso(p) {
        // from https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model
        return new Vector2d(
            2 * p.x / (p.x ** 2 + (1 + p.y) ** 2),
            (p.x ** 2 + p.y ** 2 - 1) / (p.x ** 2 + (1 + p.y) ** 2)
        )
    }

    function redraw() {
        // realign points with half-plane
        for (const point of movablePoints) {
            if (point.y < 0) {
                point.y = 0
            }
        }

        diskCanvas.clear()
        planeCanvas.clear()

        diskCanvas.drawAxes()
        planeCanvas.drawAxes()

        diskCanvas.drawCircle(new Vector2d(0, 0), 1, {dashed: true})

        // draw movable points in plane
        for (let i = 0; i < movablePoints.length; i++) {
            planeCanvas.drawPoint(movablePoints[i], {label: `z${i + 1}`})
        }

        // draw movable points in disk
        for (let i = 0; i < movablePoints.length; i++) {
            const diskPos = planeToDiskIso(movablePoints[i])
            diskCanvas.drawPoint(diskPos, {label: `z${i + 1}`})
        }

        const connectingPoints = []
        const numConnectingPoints = 200

        // draw hyperbolic line on which z1 and z2 lie
        if (Math.abs(z1.x - z2.x) < 0.01) {
            // calculate and draw line in plane
            const minXY = planeCanvas.screenPosToPoint(new Vector2d(0, planeCanvas.canvas.height))
            const maxXY = planeCanvas.screenPosToPoint(new Vector2d(planeCanvas.canvas.width, 0))

            planeCanvas.connectPoints([
                new Vector2d(z1.x, 0),
                new Vector2d(z1.x, maxXY.y),
            ], {color: "lightblue", width: 2})

            for (let i = 0; i < numConnectingPoints; i++) {
                const linePos = new Vector2d(z1.x, i / 10)
                connectingPoints.push(linePos)
            }
        } else {
            // calculate and draw half circle in plane
            const midPoint = z1.add(z2).scale(0.5)
            const tanAlpha = Math.tan(z1.angleTo(z2))
            const halfCircleCentre = new Vector2d(midPoint.x + tanAlpha * midPoint.y, 0)
            const halfCirlceRadius = halfCircleCentre.distance(z1)

            planeCanvas.drawCircle(halfCircleCentre, halfCirlceRadius, {
                endAngle: Math.PI, clockwise: false, color: "lightblue", width: 2
            })

            for (let i = 0; i < numConnectingPoints; i++) {
                const unitCirclePos = Vector2d.fromAngle(i / (numConnectingPoints - 1) * Math.PI)
                const circlePos = unitCirclePos.scale(halfCirlceRadius).add(halfCircleCentre)
                connectingPoints.push(circlePos)
            }
        }

        diskCanvas.connectPoints(connectingPoints.map(p => planeToDiskIso(p)), {color: "lightblue", width: 2})
    }

    let draggingPoint = null
    const dragMaxDistancePx = 30

    const pointFromEvent = (canvas, event) => {
        const screenPos = Vector2d.fromEvent(event, canvas.canvas)
        return canvas.screenPosToPoint(screenPos)
    }

    const halfPlanePointInFunc = (event) => {
        const regularPlanePos = pointFromEvent(planeCanvas, event)
        regularPlanePos.y = Math.abs(regularPlanePos.y)
        return regularPlanePos.scale(10).round().scale(0.1)
    }

    const halfPlanePointOutFunc = point => planeCanvas.pointToScreenPos(point)

    const diskPointInFunc = (event) => {
        const normalPlanePos = pointFromEvent(diskCanvas, event)
        const planePos = diskToPlaneIso(normalPlanePos)
        return planePos
    }

    const diskPointOutFunc = point => diskCanvas.pointToScreenPos(planeToDiskIso(point))

    for (const [canvas, pointInFunc, pointOutFunc] of [
        [planeCanvas, halfPlanePointInFunc, halfPlanePointOutFunc],
        [diskCanvas, diskPointInFunc, diskPointOutFunc]
    ]) {
        canvas.canvas.addEventListener("mousedown", event => {
            const mousePos = pointInFunc(event)
            const mouseScreenPos = pointOutFunc(mousePos)
            for (const point of movablePoints) {
                if (pointOutFunc(point).distance(mouseScreenPos) <= dragMaxDistancePx) {
                    draggingPoint = point
                    draggingPoint.set(mousePos)
                    return redraw()
                }
            }
        })

        canvas.canvas.addEventListener("touchstart", event => {
            const mousePos = pointInFunc(event)
            const mouseScreenPos = pointOutFunc(mousePos)
            for (const point of movablePoints) {
                if (pointOutFunc(point).distance(mouseScreenPos) <= dragMaxDistancePx) {
                    draggingPoint = point
                    draggingPoint.set(mousePos)
                    return redraw()
                }
            }
            event.preventDefault()
        })

        canvas.canvas.addEventListener("mousemove", event => {
            if (draggingPoint !== null) {
                const mousePos = pointInFunc(event)
                draggingPoint.set(mousePos)
                redraw()
            }
        })

        canvas.canvas.addEventListener("touchmove", event => {
            if (draggingPoint !== null) {
                const mousePos = pointInFunc(event)
                draggingPoint.set(mousePos)
                redraw()
                event.preventDefault()
            }
        })

        canvas.canvas.addEventListener("mouseup", event => {
            draggingPoint = null
            redraw()
        })

        canvas.canvas.addEventListener("touchend", event => {
            draggingPoint = null
            redraw()
            event.preventDefault()
        })
    }

    redraw()

}, {
    description: "spawn a simulation of the hyperbolic disk and half-plane model",
    args: {
        "?w=width:i:22~100": "width of each screen in characters",
        "?h=height:i:10~100": "height of each screen in characters",
    },
    defaultValues: {
        width: 50,
        height: 40
    }
})