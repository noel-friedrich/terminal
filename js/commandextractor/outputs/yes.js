terminal.addCommand("yes", async function(args) {
    let message = args.message
    let stop = false
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.key.toLowerCase() == "c") {
            stop = true
        }
    })
    while (!stop) {
        let element = terminal.printLine(message)
        element.scrollIntoView()
        await sleep(args.f ? 0 : 100)
    }
    terminal.printLine("^C")
}, {
    description: "print a message repeatedly",
    args: {
        "?message": "the message to print",
        "?f": "fast mode"
    },
    standardVals: {message: "y"}
})

