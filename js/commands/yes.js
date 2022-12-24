terminal.addCommand("yes", async function(args) {
    let message = args.message
    while (true) {
        terminal.printLine(message)
        terminal.scroll("auto")
        await sleep(args.s ? 100 : 0)
    }
}, {
    description: "print a message repeatedly",
    args: {
        "?message": "the message to print",
        "?s:b": "slow mode"
    },
    standardVals: {
        message: "y"
    }
})

