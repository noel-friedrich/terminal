terminal.addCommand("eval", async function(argString) {
    await terminal.modules.load("mathenv", terminal)
    let [result, error] = terminal.modules.mathenv.eval(argString)
    if (error) {
        terminal.print("> ")
        terminal.printLine(error)
    } else if (result !== null) {
        terminal.print("> ")
        terminal.printLine(result)
    }
}, {
    description: "evaluate javascript code",
    rawArgMode: true
})