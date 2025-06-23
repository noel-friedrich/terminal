terminal.addCommand("construct", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    const terminalWindow = terminal.modules.window.make({
        name: "Number Construction Animation",
        fullscreen: args.fullscreen
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    class ModelCanvas {

        constructor(viewCentre, viewHeight) {
            this.context = context
            this.canvas = canvas

            this.viewCentre = viewCentre
            this.viewHeight = viewHeight
        }

        get width() {
            return this.canvas.width
        }

        get height() {
            return this.canvas.height
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

        clear(fillColor) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            if (fillColor) {
                this.fill(fillColor)
            }
        }

        drawPoint(point, {atScreenPos=false, radius=5, color="blue",
            label=null, labelSize=13, labelColor=null, labelOffset=null,
            labelBaseline="top", labelAlign="left"
        }={}) {
            labelColor ??= "black"
            
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
            color ??= "black"

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

        drawAxes({color="black", drawGrid=true, gridColor=null, drawLabels=true, labelColor=null}={}) {
            gridColor ??= color
            labelColor ??= color

            const minXY = this.screenPosToPoint(new Vector2d(0, this.canvas.height))
            const maxXY = this.screenPosToPoint(new Vector2d(this.canvas.width, 0))

            if (drawGrid) {
                for (let x = Math.floor(minXY.x); x <= maxXY.x; x++) {
                    this.connectPoints([
                        new Vector2d(x, minXY.y),
                        new Vector2d(x, maxXY.y)
                    ], {color: gridColor})
                }
                
                for (let y = Math.floor(minXY.y); y <= maxXY.y; y++) {
                    this.connectPoints([
                        new Vector2d(minXY.x, y),
                        new Vector2d(maxXY.x, y)
                    ], {color: gridColor})
                }
            }

            // x axis
            this.connectPoints([
                new Vector2d(Math.floor(minXY.x) - 1, 0),
                new Vector2d(Math.ceil(maxXY.x) + 1, 0)
            ], {color})

            // y axis
            this.connectPoints([
                new Vector2d(0, Math.floor(minXY.y) - 1),
                new Vector2d(0, Math.ceil(maxXY.y) + 1)
            ], {color})

            const pinStyling = {color, radius: 3, labelColor}

            if (!drawLabels) return

            for (let x = Math.floor(minXY.x); x <= Math.ceil(maxXY.x); x++) {
                if (x == 0) continue
                this.drawPoint(new Vector2d(x, 0), {label: x, ...pinStyling})
            }

            for (let y = Math.floor(minXY.y); y <= Math.ceil(maxXY.y); y++) {
                const label = Math.abs(y) > 1 ? `${y}i` : (y < 0 ? "-i" : (y > 0 ? "i" : "0"))
                this.drawPoint(new Vector2d(0, y), {label, ...pinStyling})
            }
        }

        drawCircle(point, radius, {atScreenPos=false, color=null, dashed=false, width=1, startAngle=0, endAngle=Math.PI * 2, clockwise=true}={}) {
            color ??= "black"
            if (!atScreenPos) {
                radius = radius / this.viewHeight * this.canvas.height
            }

            this.context.beginPath()
            const screenPos = atScreenPos ? point : this.pointToScreenPos(point)
            this.context.arc(screenPos.x, screenPos.y, radius, startAngle, endAngle, !clockwise)
            this.context.strokeStyle = color
            if (dashed) {
                this.context.setLineDash([5, 5])
            }
            this.context.lineWidth = width
            this.context.stroke()
            this.context.setLineDash([])
        }
        
        fill(color) {
            this.context.fillStyle = color
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }

    }

    const modelCanvas = new ModelCanvas(new Vector2d(0, 0), 10)

    class DrawnPoint {

        constructor(pos, name, color) {
            this.pos = pos
            this.name = name
            this.color = color
        }

        draw() {
            modelCanvas.drawPoint(this.pos, {
                label: this.name,
                color: this.color
            })
        }

    }

    class DrawnArc {

        constructor(pos, radius, {startAngle=0, endAngle=Math.PI * 2, color=null, clockwise=true}={}) {
            this.pos = pos
            this.radius = radius
            this.startAngle = startAngle
            this.endAngle = endAngle
            this.color = color
            this.clockwise = clockwise
        }

        draw() {
            modelCanvas.drawCircle(this.pos, this.radius, {
                startAngle: this.startAngle,
                endAngle: this.endAngle,
                color: this.color,
                clockwise: this.clockwise
            })
        }

    }

    class DrawnLine {

        constructor(pos1, pos2, {width=null, color=null}={}) {
            this.pos1 = pos1
            this.pos2 = pos2
            this.width = width
            this.color = color
        }

        get xDiff() {
            return this.pos2.x - this.pos1.x
        }
        
        get yDiff() {
            return this.pos2.y - this.pos1.y
        }

        get length() {
            return this.pos1.sub(this.pos2).length
        }

        get midpoint() {
            return this.pos1.lerp(this.pos2, 0.5)
        }

        draw() {
            modelCanvas.connectPoints([this.pos1, this.pos2], {
                color: this.color,
                width: this.width
            })
        }

    }

    class Compass {

        constructor(pos1, pos2, hidden) {
            this.pos1 = pos1
            this.pos2 = pos2
            this.hidden = hidden
        }

        get angle() {
            return this.pos2.sub(this.pos1).angle
        }

        get screenAngle() {
            return this.screenPos2.sub(this.screenPos1).angle
        }

        get midpoint() {
            return this.pos1.lerp(this.pos2, 0.5)
        }

        get screenMidpoint() {
            return this.screenPos1.lerp(this.screenPos2, 0.5)
        }

        get screenPos1() {
            return modelCanvas.pointToScreenPos(this.pos1)
        }
        
        get screenPos2() {
            return modelCanvas.pointToScreenPos(this.pos2)
        }

        draw() {
            if (this.hidden) {
                return
            }

            const size = Math.min(modelCanvas.width, modelCanvas.height) * 0.3

            const tangentDir = Vector2d.fromAngle(this.screenAngle - Math.PI / 2)
            const headPos = this.screenMidpoint.add(tangentDir.scale(size))

            const cirlceRadius = size * 0.13
            const tipPos = this.screenMidpoint.add(tangentDir.scale(size + cirlceRadius))
            const tiptipPos = this.screenMidpoint.add(tangentDir.scale(size + cirlceRadius * 2))

            modelCanvas.drawCircle(headPos, cirlceRadius, {
                atScreenPos: true,
            })

            context.fillStyle = "rgba(0, 0, 0, 0.2)"
            context.fill()

            modelCanvas.connectPoints([
                this.screenPos1, headPos, this.screenPos2
            ], {atScreenPos: true})
            
            modelCanvas.connectPoints([
                tipPos, tiptipPos
            ], {atScreenPos: true})
        }

    }

    class Ruler {

        constructor(pos, direction, hidden) {
            this.pos = pos
            this.direction = direction
            this.hidden = hidden
        }

        get screenPos() {
            return modelCanvas.pointToScreenPos(this.pos)
        }

        draw() {
            if (this.hidden) {
                return
            }

            const width = Math.max(modelCanvas.width, modelCanvas.height)
            const height = Math.min(modelCanvas.width, modelCanvas.height) * 0.2
            const dir = Vector2d.fromAngle(this.direction)
            const tangentDir = Vector2d.fromAngle(this.direction + Math.PI / 2)

            const imperfectOffset = 4
            const pos1 = this.screenPos.sub(dir.scale(width))
            const pos2 = this.screenPos.add(dir.scale(width))
            pos1.iadd(tangentDir.scale(imperfectOffset))
            pos2.iadd(tangentDir.scale(imperfectOffset))
            const pos3 = pos2.add(tangentDir.scale(height))
            const pos4 = pos1.add(tangentDir.scale(height))

            modelCanvas.connectPoints([pos1, pos2, pos3, pos4], {
                atScreenPos: true, color: "#777"
            })

            context.fillStyle = "rgba(0, 0, 0, 0.2)"
            context.fill()
            
            modelCanvas.connectPoints([pos1, pos2], {
                atScreenPos: true, color: "black", width: 2
            })
        }

    }
    
    const origin = new DrawnPoint(new Vector2d(0, 0), "0")
    const unitPoint = new DrawnPoint(new Vector2d(1, 0), "1")
    const drawnObjects = [origin, unitPoint]

    const compass = new Compass(new Vector2d(0, 0), new Vector2d(1, 0), true)
    const ruler = new Ruler(new Vector2d(0, 0), -0.2, true)
    
    function redraw() {
        modelCanvas.clear("white")
        modelCanvas.drawAxes({color: "#333", drawGrid: true, gridColor: "#ccc", drawLabels: false})
        
        compass.draw()
        ruler.draw()

        for (const obj of drawnObjects) {
            obj.draw()
        }
    }
    
    const fps = args.fps
    
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })

    redraw()

    async function drawCircleWithCompass(point, otherPoint, {steps=50, color=null}={}) {
        compass.pos1 = point
        compass.pos2 = otherPoint
        compass.hidden = false
        
        const radius = point.sub(otherPoint).length
        const offsetAngle = point.angleTo(otherPoint)
        const arc = new DrawnArc(point, radius, {clockwise: false, color})
        arc.startAngle = -offsetAngle

        drawnObjects.push(arc)

        for (let i = 1; i < steps; i++) {
            const angle = offsetAngle + Math.PI * 2 * (i / steps)
            const dir = Vector2d.fromAngle(angle).scale(radius)

            compass.pos2 = point.add(dir)
            arc.endAngle = Math.PI * 2 - angle

            redraw()
            await sleep(1000 / fps)
        }

        arc.startAngle = 0
        arc.endAngle = Math.PI * 2
        compass.hidden = true

        redraw()

        return arc
    }

    async function drawLineWithRuler(pos1, pos2, {width=null, color=null, steps=50}={}) {
        ruler.hidden = false
        ruler.pos = pos1
        ruler.direction = -pos1.angleTo(pos2)

        const line = new DrawnLine(pos1, pos1, {color, width})
        drawnObjects.push(line)

        for (let i = 0; i < steps; i++) {
            line.pos2 = pos1.lerp(pos2, i / steps)

            redraw()
            await sleep(1000 / fps)
        }

        line.pos2 = pos2

        ruler.hidden = true
        redraw()
    }

    async function changeZoomTo(viewHeight, viewCentre, {steps=30}={}) {
        const startHeight = modelCanvas.viewHeight
        const startCentre = modelCanvas.viewCentre.copy()
        for (let i = 0; i < steps + 1; i++) {
            const t = i / steps
            modelCanvas.viewHeight = startHeight + (viewHeight - startHeight) * t
            modelCanvas.viewCentre = startCentre.lerp(viewCentre, t)
            redraw()
            await sleep(1000 / fps)
        }
    }

    async function doubleLine(pos1, pos2, numSteps=1) {
        let prevPoint = pos1
        const midpoint = pos1.lerp(pos2, 0.5)
        let point = null
        for (let i = 0; i < numSteps + 1; i++) {
            const n = 2 ** i
            point = new DrawnPoint(pos1.lerp(pos2, n), null, "red")
            
            await changeZoomTo(pos1.sub(point.pos).length * 3, midpoint)
            await drawLineWithRuler(prevPoint, point.pos, {color: "red"})
            
            drawnObjects.push(point)
            redraw()

            if (i + 1 < numSteps + 1) {
                await sleep(300)
                await drawCircleWithCompass(point.pos, pos1, {color: "blue"})
            }

            prevPoint = point.pos
        }

        return point
    }

    async function naturalScaleLine(pos1, pos2, steps) {
        const power2Components = []
        for (let i = Math.floor(Math.log2(steps)); i >= 0; i--) {
            const powerOf2 = 2 ** i
            if (steps >= powerOf2) {
                steps -= powerOf2
                power2Components.push(i)
            }
        }

        const line = new DrawnLine(pos1.copy(), null)

        let lastEndPoint = pos1
        let nextStartPoint = pos2
        const delta = pos2.sub(pos1)
        for (const i of power2Components) {
            lastEndPoint = (await doubleLine(lastEndPoint, nextStartPoint, i)).pos
            nextStartPoint = lastEndPoint.add(delta)

            if (i != power2Components[power2Components.length - 1]) {
                await changeZoomTo(pos1.sub(pos2).length * 3, lastEndPoint)
                await drawCircleWithCompass(lastEndPoint, nextStartPoint, {color: "blue"})
            }
        }

        line.pos2 = lastEndPoint

        await changeZoomTo(Math.max(Math.abs(line.xDiff), Math.abs(line.yDiff)) * 1.5, line.midpoint)

        return line
    }

    const line = await naturalScaleLine(origin.pos, unitPoint.pos, 10)

}, {
    description: "animate the construction of a given number (using ruler and compass only)",
    args: {
        "number:s": "the number to construct (form: 'sqrt(20)+3')",
        "?f=fullscreen:b": "enable fullscreen mode",
        "?fps:i:1~99999": "fps of animation"
    },
    defaultValues: {
        fps: 30
    },
    isSecret: true
})