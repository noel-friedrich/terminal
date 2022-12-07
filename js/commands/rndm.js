terminal.addCommand("rndm", async function(args) {
    args.min = ~~args.min
    args.max = ~~args.max + 1

    if (args.max - args.min <= 1)
        throw new Error("max value must be greater than min value")

    let range = args.max - args.min
    let randomNum = (Date.now() % range) + args.min
    terminal.printLine(randomNum)
}, {
    description: "generate a random number based on the current time",
    args: {
        "?min:n:0~100000": "minimum value (inclusive)",
        "?max:n:0~100000": "maximum value (inclusive)"
    },
    standardVals: {
        min: 1,
        max: 100,
    }
})

