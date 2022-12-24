terminal.addCommand("bc", async function() {
    await terminal.modules.load("mathenv", terminal)
    while (true) {
        let text = await terminal.prompt()
        let [result, error] = terminal.modules.mathenv.eval(text)
        if (error) {
            terminal.print("> ")
            terminal.printLine(error)
        } else if (result !== null) {
            terminal.print("> ")
            terminal.printLine(result)
        }
    }
}, {
    description: "start a bc (basic calculator) session"
})

