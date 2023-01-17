terminal.addCommand("bin", async function(args) {
    let result = parseInt(args.n, args.f).toString(args.t)
    terminal.printLine(result)
}, {
    description: "convert a number to another base",
    args: {
        "n": "number to convert",
        "?t=to-base:i:2~36": "base to convert to",
        "?f=from-base:i:2~36": "base to convert from"
    },
    standardVals: {
        t: 2,
        f: 10
    }
})