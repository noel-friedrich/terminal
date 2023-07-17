terminal.addCommand("img2ascii", async function(args) {
    await terminal.modules.load("upload", terminal)

    let image = await terminal.modules.upload.image()

    let outputSize = {x: args.width, y: 0}
    outputSize.y = parseInt(outputSize.x * (image.height / image.width) * 0.6)

    let asciiChars = " .:-=+*#%@"

    let tempCanvas = document.createElement("canvas")
    tempCanvas.style.display = "none"
    document.body.appendChild(tempCanvas)
    tempCanvas.width = image.width
    tempCanvas.height = image.height

    let context = tempCanvas.getContext("2d")
    context.drawImage(image, 0, 0)

    let imageData = context.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

    let xStep = parseInt(tempCanvas.width / outputSize.x)
    let yStep = parseInt(tempCanvas.height / outputSize.y)
    
    function getAverageColor(blockX, blockY) {
        let colorSum = 0
        let colorCount = 0
        let i = blockY * yStep * tempCanvas.width * 4 + blockX * 4 * xStep
        for (let y = 0; y < yStep; y++) {
            for (let x = 0; x < xStep; x++) {
                colorSum += imageData.data[i + 0]
                colorSum += imageData.data[i + 1]
                colorSum += imageData.data[i + 2]
                colorCount += 3
                i += 4
            }
            i += tempCanvas.width * 4 - xStep * 4
        }
        return colorSum / colorCount
    }

    terminal.printLine()
    for (let i = 0; i < outputSize.y; i++) {
        for (let j = 0; j < outputSize.x; j++) {
            let averageColor = getAverageColor(j, i)
            let char = asciiChars[parseInt((asciiChars.length - 1) * (averageColor / 255))]
            terminal.print(char)
        }
        terminal.printLine()
    }
}, {
    description: "Convert an image to ASCII art",
    args: {
        "?w=width:i:1~500": "the width of the output image in characters"
    },
    defaultValues: {
        width: 60
    }
})