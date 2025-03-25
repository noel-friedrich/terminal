terminal.addCommand("imgwarp", async function(args) {
	await terminal.modules.import("game", window)

    const priorityFunction = new Function("x", "y", `return ${args.f}`)

	function initDisplay() {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let widthPx = Math.floor(terminal.charWidth * 50)
        let heightPx = widthPx
        canvas.width = widthPx
        canvas.height = heightPx
        canvas.style.width = widthPx + "px"
        canvas.style.height = heightPx + "px"
        terminal.parentNode.appendChild(canvas)
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        return [context, canvas]
	}

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                resolve(img)   
            }
            img.onerror = (err) => {
                reject(err)
            }
            img.src = src
        })
    }

    terminal.addLineBreak()
    const backgroundImage = await loadImage("res/img/imgwarp/BlankMap-World-v2.png")
	const [context2d, canvas] = initDisplay()
	const [resultContext2d, resultCanvas] = initDisplay()

    const sorroundingDirections = [
        new Vector2d( 0,  1),
        new Vector2d( 0, -1),
        new Vector2d( 1,  0),
        new Vector2d(-1,  0)
    ]

    context2d.drawImage(backgroundImage, 0, 0)

    // start exploration

    const startPos = new Vector2d(
        Math.round(canvas.width / 2),
        Math.round(canvas.height / 2)
    )

    const pixelQueue = [[0, startPos]]

    function setPixelToRGBA(imgData, pos, r=null, g=null, b=null, a=null) {
        if (!isWithinBounds(pos)) {
            return
        }

        const i = pos.y * (canvas.width * 4) + pos.x * 4
        if (r !== null) imgData.data[i]     = r
        if (g !== null) imgData.data[i + 1] = g
        if (b !== null) imgData.data[i + 2] = b
        if (a !== null) imgData.data[i + 3] = a
    }

    function getPixelRGBA(imgData, pos) {
        const i = pos.y * (canvas.width * 4) + pos.x * 4
        return [
            imgData.data[i],
            imgData.data[i + 1],
            imgData.data[i + 2],
            imgData.data[i + 3],
        ]
    }
    
    function pixelPosToPriorityPos(pixelPos) {
        const canvasHalfWidth = canvas.width / 2
        const canvasHalfHeight = canvas.height / 2
        return new Vector2d(
            (pixelPos.x - canvasHalfWidth),
            (pixelPos.y - canvasHalfHeight)
        )
    }

    function popFromQueue() {
        if (pixelQueue.length == 0) {
            return null
        } else {
            return pixelQueue.shift()[1]
        }
    }

    function insortIntoQueue(priority, pos) {
        if (pixelQueue.length == 0) {
            pixelQueue.push([priority, pos])
            return
        }

        if (priority <= pixelQueue[0][0]) {
            pixelQueue.unshift([priority, pos])
            return
        }

        if (priority >= pixelQueue[pixelQueue.length - 1][0]) {
            pixelQueue.push([priority, pos])
            return
        }

        let left = 0
        let right = pixelQueue.length
        let lastLeft = left
        let lastRight = right
        while (left < right) {
            const middle = Math.floor((left + right) / 2)
            if (pixelQueue[middle][0] < priority) {
                left = middle
            } else if (pixelQueue[middle][0] > priority) {
                right = middle
            } else {
                left = middle
                right = middle
            }

            if (left === lastLeft && right === lastRight) {
                break
            }

            lastLeft = left
            lastRight = right   
        }

        pixelQueue.splice(right, 0, [priority, pos])
    }

    function isMarked(imgData, pos) {
        const i = pos.y * (canvas.width * 4) + pos.x * 4
        return imgData.data[i + 3] == 0
    }

    function markPixel(resultImgData, imgData, pos) {
        const pixelRGBA = getPixelRGBA(imgData, pos)
        setPixelToRGBA(imgData, pos, null, null, null, 0)
        
        const priorityPos = pixelPosToPriorityPos(pos)
        const distance = priorityFunction(priorityPos.x, priorityPos.y)
        const resultPos = new Vector2d(canvas.width, canvas.height)
            .scale(0.5)
            .add(priorityPos.normalized.scale(distance))

        const resultFlooredPos = new Vector2d(Math.floor(resultPos.x), Math.floor(resultPos.y))
        setPixelToRGBA(resultImgData, resultFlooredPos, ...pixelRGBA)
    }

    function isWithinBounds(pos) {
        return pos.x >= 0 && pos.y >= 0 && pos.x < canvas.width && pos.y < canvas.height
    }

    function explorePixel(imgData, pos) {
        for (const direction of sorroundingDirections) {
            const newPos = pos.add(direction)
            if (isWithinBounds(newPos) && !isMarked(imgData, newPos)) {
                const priorityPos = pixelPosToPriorityPos(newPos)
                const priority = priorityFunction(priorityPos.x, priorityPos.y)
                insortIntoQueue(priority, newPos)
            }
        }
    }

    const imgData = context2d.getImageData(0, 0, canvas.width, canvas.height)
    const resultImgData = resultContext2d.getImageData(0, 0, canvas.width, canvas.height)

    await sleep(100)
    terminal.scroll()
    await sleep(100)

    for (let i = 0; pixelQueue.length > 0; i++) {
        const pos = popFromQueue()
        if (isMarked(imgData, pos)) {
            continue
        }

        markPixel(resultImgData, imgData, pos)
        explorePixel(imgData, pos)

        context2d.putImageData(imgData, 0, 0)
        resultContext2d.putImageData(resultImgData, 0, 0)

        if (i % 10 == 0) {
            await sleep(0)
        }
    }

}, {
	description: "warp an image using a geometric step-distance function",
    args: {
        "f=function:s": "step distance function",
    }
})