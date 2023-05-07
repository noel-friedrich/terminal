terminal.addCommand("rndm", async function(args) {
    if (args.max - args.min <= 0)
        throw new Error("max value must be greater than min value")

    let randomNum = ""

    if (args.t && args.f) {
        throw new Error("cannot use both time and float options")
    }

    if (!args.f) {
        if (!Number.isInteger(args.min) || !Number.isInteger(args.max)) {
            throw new Error("min and max values must be integers in integer mode")
        }
    }

    if (args.t) {
        args.min = Math.floor(args.min)
        args.max = Math.floor(args.max + 1)

        let range = args.max - args.min
        randomNum = (Date.now() % range) + args.min
    } else if (args.f) {
        randomNum = Math.random() * (args.max - args.min) + args.min
    } else {
        args.min = Math.floor(args.min)
        args.max = Math.floor(args.max + 1)

        randomNum = Math.floor(Math.random() * (args.max - args.min) + args.min)
    }
    
    terminal.printLine(randomNum)
}, {
    description: "generate a random number based on the current time",
    args: {
        "?min:n:0~100000": "minimum value (inclusive)",
        "?max:n:0~100000": "maximum value (inclusive)",
        "?t=time:b": "use a time based random number generator",
        "?f=float:b": "generate a float instead of an integer",
    },
    standardVals: {
        min: 1,
        max: 100,
    }
})

