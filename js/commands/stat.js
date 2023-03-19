terminal.addCommand("stat", async function(args) {
    await terminal.modules.import("statistics", window)

    let dataset = null

    const options = {
        random: "a random data set",
        randomSorted: "a random sorted data set",
        gauss: "a gaussian distribution",
        sin: "a sine wave",
        triangle: "a triangle wave",
        square: "a square wave",
        pendulum: "a pendulum wave"
    }

    if (args.nums == null) {
        terminal.printLine("Usage: stat [options] [nums|dataset]")
        for (let key in options) {
            let command = `stat ${key}`
            terminal.printCommand(`${key.padEnd(12)} ${options[key]}`, command)
        }
        return
    }

    switch (args.nums.trim()) {
        case "random":
            dataset = Dataset.random({length: 50})
            break
        case "randomSorted":
            dataset = Dataset.randomSorted({length: 500})
            break
        case "gauss":
            dataset = Dataset.fromFunc(x => {
                return Math.exp(-Math.pow(x, 2))
            }, {min: -3, max: 3, length: 100})
            break
        case "sin":
            dataset = Dataset.fromFunc(x => {
                return Math.sin(x) + 1
            }, {min: 0, max: Math.PI * 4, length: 100})
            break
        case "triangle":
            dataset = Dataset.fromFunc(x => {
                return Math.abs(x % 2 - 1)
            }, {min: 0, max: 4, length: 100})
            break
        case "square":
            dataset = Dataset.fromFunc(x => {
                return x % 2 < 1 ? 1 : 0
            }, {min: 0, max: 5, length: 100})
            break
        case "pendulum":
            dataset = Dataset.fromFunc(x => {
                return Math.sin(x)* Math.exp(-x / 10) + 0.7
            }, {min: 1, max: Math.PI * 12, length: 200})
            break
        default:
            dataset = Dataset.fromString(args.nums)
    }

    const canvas = document.createElement("canvas")
    canvas.width = args.width
    canvas.height = args.height
    const context = canvas.getContext("2d")
    terminal.parentNode.appendChild(canvas)
    terminal.scroll()

    const plot = (d=dataset) => {
        d.lineplot(context, {
            xAxisName: args.x,
            yAxisName: args.y,
            paddingPx: args.padding,
            arrowSize: 5,
            xAxisNameColor: args["axis-color"],
            yAxisNameColor: args["axis-color"],
            color: args["axis-color"]
        }, {
            color: args.color
        })
    }

    if (args.animateMs) {
        let intervalMs = args.animateMs / dataset.numbers.length
        let startTime = Date.now()
        let interval = setInterval(() => {
            let time = Date.now() - startTime
            let index = Math.floor(time / intervalMs)
            if (index >= dataset.numbers.length) {
                index = dataset.numbers.length - 1
                clearInterval(interval)
            }
            plot(new Dataset(dataset.numbers.slice(0, index + 1)))
        }, intervalMs)
    } else {
        plot()
    }

    terminal.addLineBreak()
}, {
    description: "show a statistic of a given data set",
    args: {
        "?*nums:s": "the numbers to show the statistic of",
        "?width:n:1~9999": "the width of the canvas",
        "?height:n:1~9999": "the height of the canvas",
        "?x=x-name:s": "the name of the x axis",
        "?y=y-name:s": "the name of the y axis",
        "?p=padding:n:0~9999": "the padding of the canvas",
        "?c=color:s": "the color of plot",
        "?axis-color:s": "the color of the axis",
        "?a=animateMs": "animate the plot"
    },
    defaultValues: {
        nums: null,
        width: 640,
        height: 400,
        x: null,
        y: null,
        padding: 20,
        "axis-color": "black",
        color: "red",
        animateMs: 1000
    }
})