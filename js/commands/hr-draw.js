terminal.addCommand("hr-draw", async function(args) {
    const makeCanvas = (data, width=30) => {
        const canvas = terminal.document.createElement("canvas")

        const sizePx = width * terminal.charWidth
        canvas.width = sizePx
        canvas.height = canvas.width * (data.length / data[0].length)

        terminal.parentNode.appendChild(canvas)
        terminal.addLineBreak()

        return canvas
    }

    const drawPixelData = (context, data) => {
        const canvas = context.canvas

        const xStep = canvas.width / data[0].length
        const yStep = canvas.height / data.length

        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = "blue"
        for (let x = 0; x < data[0].length; x++) {
            for (let y = 0; y < data.length; y++) {
                if (data[y][x]) {
                    context.fillRect(
                        x * xStep, y * yStep,
                        xStep, yStep
                    )
                }
            }
        }
    }
    
    let pixelData = Array.from({length: args.height},
        () => Array.from({length: args.width}, () => false))
    
    const canvas = makeCanvas(pixelData)
    const context = canvas.getContext("2d")

    let mouseLeftDown = false
    let mouseRightDown = false

    terminal.window.addEventListener("mousedown", event => {
        if (event.button == 0) mouseLeftDown = true
        if (event.button == 2) mouseRightDown = true
        canvas.onmousemove(event)
    })
    terminal.window.addEventListener("contextmenu", event => {
        event.preventDefault()
    })
    terminal.window.addEventListener("mouseup", _ => {
        mouseLeftDown = false
        mouseRightDown = false
    })

    const eventToPos = event => {
        let rect = canvas.getBoundingClientRect()
        let xPx = event.clientX - rect.left
        let yPx = event.clientY - rect.top
        let x = Math.floor(xPx / (canvas.width / pixelData[0].length))
        let y = Math.floor(yPx / (canvas.height / pixelData.length))
        x = Math.min(Math.max(0, x), pixelData[0].length - 1)
        y = Math.min(Math.max(0, y), pixelData.length - 1)
        return {x, y}
    }

    canvas.onmousemove = event => {
        let {x, y} = eventToPos(event)
        pixelData[y][x] = mouseRightDown ? false : (mouseLeftDown ? true : pixelData[y][x])
        drawPixelData(context, pixelData)
    }

    const getBinaryData = () => {
        let output = "0b"
        for (let i = 0; i < args.width * args.height; i++) {
            let x = i % args.width
            let y = (i - x) / args.height
            if (pixelData[y][x]) {
                output += "1"
            } else {
                output += "0"
            }
        }
        return output
    }

    drawPixelData(context, pixelData)

    let running = true

    terminal.onInterrupt(() => running = false)

    terminal.window.addEventListener("keydown", event => {
        if (event.key.length != 1 || !running) return
        let output = `"${event.key}": ${getBinaryData()}`
        terminal.printLine(output)
        terminal.copy(output)
    })

    while (running) {
        await sleep(100)
    }

}, {
    description: "turn drawings into bitmaps",
    args: {
        "?x=width:i:1~100": "width (pixels)",
        "?y=height:i:1~100": "height (pixels)" 
    },
    defaultValues: {
        width: 5,
        height: 5
    },
    isSecret: true
})