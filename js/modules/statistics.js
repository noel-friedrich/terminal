function drawLine(context, x1, y1, x2, y2, {
    color = "black",
    lineWidth = 1
}={}) {
    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}

function drawTurnedText(context, text, x, y, {
    angle = 0
}={}) {
    context.save()
    context.translate(x, y)
    context.rotate(angle)
    context.fillText(text, 0, 0)
    context.restore()
}

function drawTriangle(context, x, y, width, height, {
    color = "black",
    angle = 0
}={}) {
    let pos1 = {
        x: 0,
        y: -height
    }

    let pos2 = {
        x: -width,
        y: height
    }

    let pos3 = {
        x: width,
        y: height
    }

    context.save()
    context.translate(x, y)
    context.rotate(angle)
    context.beginPath()
    context.fillStyle = color
    context.moveTo(pos1.x, pos1.y)
    context.lineTo(pos2.x, pos2.y)
    context.lineTo(pos3.x, pos3.y)
    context.closePath()
    context.fill()
    context.restore()
}

function drawAxis(context, {
    color = "black",
    xAxisName = null,
    yAxisName = null,
    xAxisNameColor = "black",
    yAxisNameColor = "black",
    xAxisNameSize = 20,
    yAxisNameSize = 20,
    font = "monospace",
    lineWidth = 1,
    backgroundColor = "white",
    paddingPx = 50,
    arrowSize = 0
}={}) {
    fillBackground(context, {color: backgroundColor})

    const canvas = context.canvas

    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.font = `${xAxisNameSize}px ${font}`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.beginPath()

    let yAxisStartX = paddingPx
    let xAxisStartY = canvas.height - paddingPx
    let xAxisEndX = canvas.width - paddingPx
    let xAxisMiddleY = (xAxisStartY + paddingPx) / 2
    let yAxisMiddleX = (yAxisStartX + canvas.width - paddingPx) / 2

    if (xAxisName != null) {
        context.fillStyle = xAxisNameColor
        while (context.measureText(xAxisName).width > canvas.width - paddingPx * 2) {
            xAxisNameSize--
            context.font = `${xAxisNameSize}px ${font}`
        }
        context.fillText(xAxisName, yAxisMiddleX, xAxisStartY)
        xAxisStartY -= xAxisNameSize
    }

    if (yAxisName != null) {
        context.fillStyle = yAxisNameColor
        while (context.measureText(yAxisName).width > canvas.height - paddingPx * 2) {
            yAxisNameSize--
            context.font = `${yAxisNameSize}px ${font}`
        }
        drawTurnedText(context, yAxisName, yAxisStartX, xAxisMiddleY, {
            angle: -Math.PI / 2
        })
        yAxisStartX += yAxisNameSize
    }
    
    drawLine(context, yAxisStartX, paddingPx, yAxisStartX, xAxisStartY, {color, lineWidth})
    drawLine(context, yAxisStartX, xAxisStartY, xAxisEndX, xAxisStartY, {color, lineWidth})

    if (arrowSize > 0) {
        drawTriangle(context, yAxisStartX, paddingPx + arrowSize / 2, arrowSize, arrowSize, {color, angle: 0})
        drawTriangle(context, xAxisEndX - arrowSize / 2, xAxisStartY, arrowSize, arrowSize, {color, angle: Math.PI / 2 * 5})
    }

    return {
        x: yAxisStartX,
        y: xAxisStartY,
        width: xAxisEndX - yAxisStartX,
        height: xAxisStartY - paddingPx
    }
}

function fillBackground(context, {
    color = "white",
}={}) {
    const canvas = context.canvas
    context.fillStyle = color
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillRect(0, 0, canvas.width, canvas.height)
}

function drawCircle(context, x, y, radius) {
    context.beginPath()
    context.arc(x, y, radius, 0, 2 * Math.PI)
    context.fill()
}

class Dataset {

    constructor(numbers) {
        this.numbers = numbers
    }

    static random({
        length=10,
        min=0,
        max=10,
    }={}) {
        let numbers = []
        for (let i = 0; i < length; i++)
            numbers.push(Math.random() * (max - min) + min)
        return new Dataset(numbers)
    }

    static randomSorted({
        length=10,
        min=0,
        max=10,
    }={}) {
        let numbers = []
        for (let i = 0; i < length; i++)
            numbers.push(Math.random() * (max - min) + min)
        numbers.sort((a, b) => a - b)
        return new Dataset(numbers)
    }

    static fromFunc(func, {
        min=0,
        max=10,
        length=10
    }={}) {
        let numbers = []
        let step = (max - min) / length
        let x = min
        for (let i = 0; i < length; i++) {
            x += step
            numbers.push(func(x))
        }
        return new Dataset(numbers)
    }

    get length() {
        return this.numbers.length
    }

    static fromString(string) {
        const numbersRegex = /^(?:-?\d+(\.\d+)?\s?)+$/g
        if (!numbersRegex.test(string))
            throw new Error("Invalid numbers format. Use \"1 2 3 4 5\"")
        let numbers = string.split(" ").map(n => parseFloat(n))
        return new Dataset(numbers)
    }

    toString() {
        let out = "Dataset(["
        for (let i = 0; i < this.numbers.length; i++) {
            out += this.numbers[i]
            if (i < this.numbers.length - 1)
                out += ","
        }
        return out + `], length=${this.length})`
    }

    get average() {
        let sum = 0
        for (let i = 0; i < this.numbers.length; i++)
            sum += this.numbers[i]
        return sum / this.numbers.length
    }
    
    get median() {
        let sorted = this.numbers.slice().sort((a, b) => a - b)
        let middle = Math.floor(sorted.length / 2)
        if (sorted.length % 2 === 0)
            return (sorted[middle - 1] + sorted[middle]) / 2
        else
            return sorted[middle]
    }

    get mode() {
        let counts = {}
        for (let i = 0; i < this.numbers.length; i++) {
            let num = this.numbers[i]
            if (counts[num] === undefined)
                counts[num] = 0
            counts[num]++
        }
        let max = 0
        let maxNum = null
        for (let num in counts) {
            if (counts[num] > max) {
                max = counts[num]
                maxNum = num
            }
        }
        return maxNum
    }

    get range() {
        let min = this.numbers[0]
        let max = this.numbers[0]
        for (let i = 1; i < this.numbers.length; i++) {
            let num = this.numbers[i]
            if (num < min)
                min = num
            if (num > max)
                max = num
        }
        return max - min
    }

    get variance() {
        let avg = this.average
        let sum = 0
        for (let i = 0; i < this.numbers.length; i++)
            sum += Math.pow(this.numbers[i] - avg, 2)
        return sum / this.numbers.length
    }

    get standardDeviation() {
        return Math.sqrt(this.variance)
    }

    get max() {
        return Math.max(...this.numbers)
    }

    get min() {
        return Math.min(...this.numbers)
    }

    subset(start, end) {
        return new Dataset(this.numbers.slice(start, end))
    }

    lineplot(context, axisOptions={}, {
        color="red",
        lineWidth=1,
        displayPoints=true,
    }={}) {
        const drawArea = drawAxis(context, axisOptions)

        context.strokeStyle = color
        context.fillStyle = color
        let xStep = drawArea.width / (this.numbers.length - 1)
        let prevX = null
        let prevY = null
        let minValue = Math.min(...this.numbers)
        let maxValue = Math.max(...this.numbers)
        let yRange = maxValue - minValue
        let yStep = drawArea.height / yRange
        if (yRange == 0) {
            yStep = 0
            minValue = 0
            yRange = 1
        }
        for (let i = 0; i < this.numbers.length; i++) {
            let x = drawArea.x + i * xStep
            let y = drawArea.y - (this.numbers[i] - minValue) * yStep
            let circleSize = Math.min(xStep * 0.4, 5)
            if (circleSize > 1.5 && displayPoints)
                drawCircle(context, x, y, circleSize)
            if (prevX != null && prevY != null)
                drawLine(context, prevX, prevY, x, y, {color, lineWidth})
            prevX = x
            prevY = y
        }
    }

}

terminal.modules.statistics = {
    Dataset,
}