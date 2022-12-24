terminal.addCommand("kill", async function(args) {
    if (args.process.toLowerCase() == "turtlo") {
        await terminal.modules.load("turtlo", terminal)
        if (terminal.modules.turtlo.kill()) {
            terminal.printLine("done.")
        } else {
            terminal.printLine("i see no turtlo alive here")
        }
    } else {
        terminal.printLine("sorry no killing allowed here (except turtlo)")
    }
}, {
    description: "kill a process",
    args: {
        "process": "the process to kill"
    }
})

