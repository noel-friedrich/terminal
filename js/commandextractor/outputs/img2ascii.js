terminal.addCommand("img2ascii", async function() {
    return new Promise(async resolve => {

        try {
            var image = await getImageFromUpload()
        } catch {
            terminal.printError("Image Upload Failed")
            resolve()
            return
        }

        let outputSize = {x: 60, y: undefined}
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

        resolve()
    })
}, {
    description: "Convert an image to ASCII art"
})

function newMathEnv() {
    let jsEnv = new JsEnvironment()
    jsEnv.setValue("sin", Math.sin)
    jsEnv.setValue("cos", Math.cos)
    jsEnv.setValue("tan", Math.tan)
    jsEnv.setValue("asin", Math.asin)
    jsEnv.setValue("acos", Math.acos)
    jsEnv.setValue("atan", Math.atan)
    jsEnv.setValue("atan2", Math.atan2)
    jsEnv.setValue("sinh", Math.sinh)
    jsEnv.setValue("cosh", Math.cosh)
    jsEnv.setValue("tanh", Math.tanh)
    jsEnv.setValue("asinh", Math.asinh)
    jsEnv.setValue("acosh", Math.acosh)
    jsEnv.setValue("atanh", Math.atanh)
    jsEnv.setValue("exp", Math.exp)
    jsEnv.setValue("log", Math.log)
    jsEnv.setValue("log10", Math.log10)
    jsEnv.setValue("sqrt", Math.sqrt)
    jsEnv.setValue("abs", Math.abs)
    jsEnv.setValue("ceil", Math.ceil)
    jsEnv.setValue("floor", Math.floor)
    jsEnv.setValue("round", Math.round)
    jsEnv.setValue("PI", Math.PI)
    jsEnv.setValue("e", Math.E)
    jsEnv.setValue("E", Math.E)
    jsEnv.setValue("LN2", Math.LN2)
    jsEnv.setValue("LN10", Math.LN10)
    jsEnv.setValue("LOG2E", Math.LOG2E)
    jsEnv.setValue("LOG10E", Math.LOG10E)
    jsEnv.setValue("SQRT1_2", Math.SQRT1_2)
    jsEnv.setValue("SQRT2", Math.SQRT2)
    return jsEnv
}

const sin = Math.sin, cos = Math.cos, tan = Math.tan, sqrt = Math.sqrt, 
      e = Math.E, pi = Math.PI, exp = Math.exp, abs = Math.abs

