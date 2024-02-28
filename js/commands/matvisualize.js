terminal.addCommand("matvisualize", async function(args) {
    await terminal.modules.import("matrix", window)
    await terminal.modules.import("game", window)

    let matrix = null
    if (args.matrix) {
        matrix = Matrix.fromArray(args.matrix)
    } else {
        matrix = await inputMatrix(new MatrixDimensions(2, 2))
        terminal.addLineBreak()
    }

    if (!matrix.containsOnlyNumbers()) {
        throw new Error("Matrix may not contain any variables")
    }

    if (matrix.nRows != 2 || matrix.nCols != 2) {
        throw new Error("Matrix must be 2x2")
    }

    function makeCanvas({widthChars=30}={}) {
        const container = document.createElement("div")
        container.style.position = "relative"

        const canvas = document.createElement("canvas")
        canvas.style.width = `calc(var(--font-size) * ${widthChars})`
        canvas.style.height = `calc(var(--font-size) * ${widthChars})`

        container.appendChild(canvas)
        terminal.parentNode.appendChild(container)
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight

        return {canvas, container}
    }

    const {canvas, container} = makeCanvas()
    const context = canvas.getContext("2d")

    function makeCornerButton(text, {
        left = undefined,
        right = undefined,
        top = undefined,
        bottom = undefined
    }={}) {
        const button = document.createElement("button")
        button.textContent = text

        button.style.position = "absolute"
        if (left   !== undefined) button.style.left = left
        if (right  !== undefined) button.style.right = right
        if (top    !== undefined) button.style.top = top
        if (bottom !== undefined) button.style.bottom = bottom

        container.appendChild(button)
        return button
    }

    context.fillStyle = "blue"
    context.fillRect(20, 20, 50, 50)

    const zoomInButton = makeCornerButton("+", {left: 0, top: 0})
    const zoomOutButton = makeCornerButton("-", {left: "30px", top: 0})

    const slider = document.createElement("input")
    slider.type = "range"
    slider.value = 0
    slider.min = 0
    slider.max = 500

    slider.style.display = "block"
    slider.style.width = canvas.style.width
    terminal.parentNode.appendChild(slider)

    let viewCenter = new Vector2d(args.x, args.y)
    let zoomFactor = args.zoom
    const pointSizeFactor = (zoomFactor / 5)

    let startPoints = []
    let startPointColors = []

    const minZoomFactor = 0.01
    const maxZoomFactor = 99999999

    function pointToScreenPos(point) {
        const normalisedPos = point.sub(viewCenter).scale(1 / zoomFactor)
        normalisedPos.y *= -1
        return new Vector2d(
            canvas.width / 2 + normalisedPos.x * canvas.width / 2,
            canvas.height / 2 + normalisedPos.y * canvas.height / 2
        )
    }

    function screenPosToPoint(pos) {
        const normalisedPos = pos.scale(1 / (canvas.width / 2)).sub(new Vector2d(1, 1))
        normalisedPos.y *= -1
        return normalisedPos.scale(zoomFactor).add(viewCenter)
    }

    function drawLine(p1, p2, {
        color = terminal.data.foreground.toString(),
        lineWidth = 2
    }={}) {
        context.beginPath()
        context.moveTo(p1.x, p1.y)
        context.lineTo(p2.x, p2.y)
        context.strokeStyle = color
        context.lineWidth = lineWidth
        context.stroke()
    }

    function drawText(point, text, {
        color = terminal.data.foreground.toString(),
        fontSize = 0.03,
        offset = new Vector2d(0.01, 0.01)
    }={}) {
        context.fillStyle = color
        context.font = `${fontSize * canvas.width}px monospace`
        context.textBaseline = "top"
        context.textAlign = "left"
        const textPos = point.add(offset.scale(canvas.width))
        context.fillText(text, textPos.x, textPos.y)
    }

    function drawGrid() {
        const minXY = screenPosToPoint(new Vector2d(0, canvas.height))
        const maxXY = screenPosToPoint(new Vector2d(canvas.width, 0))
        
        drawLine( // x axis
            pointToScreenPos(new Vector2d(0, minXY.y)),
            pointToScreenPos(new Vector2d(0, maxXY.y)))

        drawLine( // y axis
            pointToScreenPos(new Vector2d(minXY.x, 0)),
            pointToScreenPos(new Vector2d(maxXY.x, 0)))

        const xJumpSize = 10 ** Math.round(Math.log10((maxXY.x - minXY.x) / 10) + 0.2)
        const yJumpSize = 10 ** Math.round(Math.log10((maxXY.y - minXY.y) / 10))

        let currX = Math.floor(minXY.x) - Math.floor(minXY.x) % xJumpSize
        while (currX < Math.ceil(maxXY.x) + 1) {
            drawText(pointToScreenPos(new Vector2d(currX, 0)), Math.round(currX * 100) / 100)
            currX += xJumpSize
        }

        let currY = Math.floor(minXY.y) - Math.floor(minXY.y) % yJumpSize
        while (currY < Math.ceil(maxXY.y) + 1) {
            if (currY != 0) {
                // only draw it once (in the x loop)
                drawText(pointToScreenPos(new Vector2d(0, currY)), Math.round(currY * 10) / 10)
            }
            currY += yJumpSize
        }
    }

    function applyTransform(point, t) {
        const columnVector = Matrix.fromArray([[point.x], [point.y]])
        const resultMatrix = matrix.multiply(columnVector)
        const resultPoint = new Vector2d(resultMatrix.getCellValue(0, 0), resultMatrix.getCellValue(1, 0))
        return point.lerp(resultPoint, t)
    }

    function drawCirlce(pos, {
        radius = 0.05,
        color = terminal.data.accentColor1,
    }={}) {
        context.fillStyle = color
        context.beginPath()
        context.arc(pos.x, pos.y, Math.max(radius * canvas.width / zoomFactor * pointSizeFactor, 2), 0, 2 * Math.PI)
        context.fill()
    }

    function drawPoints(t) {
        for (let i = 0; i < startPoints.length; i++) {
            const transformedPoint = applyTransform(startPoints[i], t)
            drawCirlce(pointToScreenPos(transformedPoint),
                {color: startPointColors[i]})
        }
    }

    function updateDrawing() {
        const t = slider.value / slider.max
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = terminal.data.background.toString()
        context.fillRect(0, 0, canvas.width, canvas.height)

        drawGrid()
        drawPoints(t)
    }

    function generateStartPoints(n) {
        const randomPoints = Array.from({length: n})
            .map(() => Vector2d.fromFunc(Math.random).scale(canvas.width))
            .map(v => screenPosToPoint(v))
        
        const linePoints = []

        const corner1 = screenPosToPoint(new Vector2d(0, 0))
        const corner2 = screenPosToPoint(new Vector2d(canvas.width, 0))
        const corner3 = screenPosToPoint(new Vector2d(canvas.width, canvas.height))
        const corner4 = screenPosToPoint(new Vector2d(0, canvas.height))
        for (let t = 0; t < 1; t += 0.01) {
            linePoints.push(corner1.lerp(corner2, t))
            linePoints.push(corner2.lerp(corner3, t))
            linePoints.push(corner3.lerp(corner4, t))
            linePoints.push(corner4.lerp(corner1, t))
        }

        return randomPoints.concat(linePoints)
    }

    function generateStartPointColors(points) {
        return points.map(p => {
            const normalisedPos = pointToScreenPos(p).scale(2 / canvas.width).add(new Vector2d(-1, -1))
            const angle = Math.atan2(normalisedPos.y, normalisedPos.x) / Math.PI * 180
            const hue = Math.round(angle)
            return Color.hsl(hue / 360, 1, 0.5)
        })
    }

    startPoints = generateStartPoints(500)
    startPointColors = generateStartPointColors(startPoints)

    function getEventPoint(event, {attrX="clientX", attrY="clientY"}={}) {
        let rect = canvas.getBoundingClientRect()
        return screenPosToPoint(new Vector2d(
            event[attrX] - rect.left,
            event[attrY] - rect.top
        ))
    }

    let dragStartPoint = null
    let dragStartViewOffset = null
    let dragEndViewOffset = null

    canvas.onmousedown = event => {
        dragStartPoint = getEventPoint(event, {
            attrX: "clientX", attrY: "clientY"
        })
        dragStartViewOffset = viewCenter.copy()
        dragEndViewOffset = dragStartViewOffset.copy()
    }

    canvas.onmousemove = event => {
        if (!dragStartPoint) {
            return
        }

        const point = getEventPoint(event, {
            attrX: "clientX", attrY: "clientY"
        })
        const diff = point.sub(dragStartPoint).scale(-1)
        dragEndViewOffset = dragStartViewOffset.add(diff)

        viewCenter = dragEndViewOffset
        updateDrawing()
        viewCenter = dragStartViewOffset
    }

    canvas.onmouseup = () => {
        viewCenter = dragEndViewOffset
        updateDrawing()
        dragStartPoint = null
    }

    canvas.onwheel = (event, steps=1) => {
        const delta = Math.sign(event.deltaY)
        for (let i = 0; i < steps; i++) {
            if (delta > 0) {
                zoomFactor /= 0.95
            } else if (delta < 0) {
                zoomFactor *= 0.95
            } else {
                return
            }
        }

        zoomFactor = Math.max(Math.min(zoomFactor, maxZoomFactor), minZoomFactor)
        if (event.preventDefault) {
            event.preventDefault()
        }
        updateDrawing()
    }

    zoomInButton.onclick = () => canvas.onwheel({deltaY: -1}, 6)
    zoomOutButton.onclick = () => canvas.onwheel({deltaY: 1}, 6)

    terminal.scroll()

    updateDrawing(0)

    function easeInOut(t) {
        if ((t /= 1 / 2) < 1) return 1 / 2 * t * t
        return -1 / 2 * ((--t) * (t - 2) - 1)
    }

    let endAnimationFlag = false
    slider.oninput = () => {
        updateDrawing()
        endAnimationFlag = true
    }

    async function playAnimation() {
        let animationProgress = 0
        while (animationProgress < 1 && !endAnimationFlag) {
            animationProgress = Math.min(animationProgress + 0.005, 1)
            const t = easeInOut(animationProgress)
            slider.value = Math.round(t * 500)
            updateDrawing()
            await sleep(1000 / 60)
        }
    }

    playAnimation()

    terminal.printLine("\n- Use the slider to go through the animation")
    terminal.printLine("- Use your mouse wheel / buttons to zoom in & out")

}, {
    description: "visualize a given 2x2 matrix transformation",
    args: {
        "?m=matrix:sm": "2x2 matrix to left-multiply by",
        "?x:n": "x coordinate of center",
        "?y:n": "y coordinate of center",
        "?z=zoom:n:0.01~99999": "zoom level"
    },
    defaultValues: {
        x: 0,
        y: 0,
        zoom: 5
    }
})