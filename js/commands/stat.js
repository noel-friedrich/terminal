terminal.addCommand("stat", async function(args) {
    await terminal.modules.import("statistics", window)

    if (args.color !== null && args["axis-color"] === null) {
        args["axis-color"] = args.color
    }

    if (args.color === null) {
        args.color = terminal.data.foreground.toString()
    }

    if (args["axis-color"] === null) {
        args["axis-color"] = terminal.data.foreground.toString()
    }

    if (args.background === null) {
        args.background = terminal.data.background.toString()
    }

    let dataset = null

    if (args.function) {
        if (args.nums) {
            throw new Error("Cannot specify both nums and function")
        }

        if (!args.x) {
            args.x = "x"
            args["x-name"] = "x"
        }

        if (!args.y) {
            args.y = "y"
            args["y-name"] = "y"
        }

        await terminal.modules.load("mathenv", terminal)

        let func = x => {
            terminal.modules.mathenv.setValue("x", x)
            let [result, error] = terminal.modules.mathenv.eval(args.function)
            if (error)
                throw new Error(error)
            if (isNaN(result))
                throw new Error("Function returned NaN")
            return result
        }

        dataset = Dataset.fromFunc(func, {min: args.min, max: args.max, length: args.length})
    }

    const options = {
        random: "a random data set",
        randomSorted: "a random sorted data set",
        gauss: "a gaussian distribution",
        sin: "a sine wave",
        triangle: "a triangle wave",
        square: "a square wave",
        pendulum: "a pendulum wave"
    }

    if (args.nums == null && dataset == null) {
        terminal.printLine("Usage: stat [options] [nums|dataset]")
        for (let key in options) {
            let command = `stat ${key}`
            terminal.printCommand(`${key.padEnd(12)} ${options[key]}`, command)
        }
        return
    }

    if (dataset == null)
    switch (args.nums.trim()) {
        case "random":
            dataset = Dataset.random({length: args.length})
            break
        case "randomSorted":
            dataset = Dataset.randomSorted({length: args.length})
            break
        case "gauss":
            dataset = Dataset.fromFunc(x => {
                return Math.exp(-Math.pow(x, 2))
            }, {min: -3, max: 3, length: args.length})
            break
        case "sin":
            dataset = Dataset.fromFunc(x => {
                return Math.sin(x) + 1
            }, {min: 0, max: Math.PI * 4, length: args.length})
            break
        case "triangle":
            dataset = Dataset.fromFunc(x => {
                return Math.abs(x % 2 - 1)
            }, {min: 0, max: 4, length: args.length})
            break
        case "square":
            dataset = Dataset.fromFunc(x => {
                return x % 2 < 1 ? 1 : 0
            }, {min: 0, max: 5, length: args.length})
            break
        case "pendulum":
            dataset = Dataset.fromFunc(x => {
                return Math.sin(x)* Math.exp(-x / 10) + 0.7
            }, {min: 1, max: Math.PI * 12, length: args.length})
            break
        default:
            dataset = Dataset.fromString(args.nums)
    }

    if (dataset.length < 2) {
        throw new Error("not enough data points")
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
            color: args["axis-color"],
            backgroundColor: args.background
        }, {
            color: args.color,
            lineWidth: args.linewidth,
            displayPoints: !args.nopoints
        })
    }

    if (args.animateMs) {
        let intervalMs = args.animateMs / dataset.numbers.length
        let startTime = Date.now()
        let interval = setInterval(() => {
            let time = Date.now() - startTime
            let index = Math.max(Math.floor(time / intervalMs), 1)
            if (index >= dataset.numbers.length) {
                index = dataset.numbers.length - 1
                clearInterval(interval)
            }
            plot(new Dataset(dataset.numbers.slice(0, index + 1)))
        }, intervalMs)
        plot(new Dataset(dataset.numbers.slice(0, 1)))
    } else {
        plot()
    }

    terminal.addLineBreak()
}, {
    description: "show a statistic of a given data set",
    args: {
        "?*nums:s": "the numbers to show the statistic of",
        "?f=function:s": "the function to plot",    
        "?min:n": "the minimum value of the function",
        "?max:n": "the maximum value of the function",
        "?width:n:1~9999": "the width of the canvas",
        "?height:n:1~9999": "the height of the canvas",
        "?x=x-name:s": "the name of the x axis",
        "?y=y-name:s": "the name of the y axis",
        "?p=padding:n:0~9999": "the padding of the canvas",
        "?color=foreground:s": "the color of plot",
        "?axis-color:s": "the color of the axis",
        "?a=animateMs": "animate the plot",
        "?background": "the background color of the canvas",
        "?l=length:i:2~99999": "the length of a data set",
        "?linewidth:n:1~999": "the width of the line in pixels",
        "?nopoints:b": "disable the points being displayed"
    },
    defaultValues: {
        nums: null,
        width: 640,
        height: 400,
        x: null,
        y: null,
        min: -10,
        max: 10,
        padding: 20,
        "axis-color": null,
        color: null,
        animateMs: 500,
        background: null,
        length: 100,
        linewidth: 2,
    }
})