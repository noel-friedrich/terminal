terminal.addCommand("eval", function(argString) {
    let [result, error] = evalJsEnv.eval(argString)
    if (error) {
        terminal.printf`${{[Color.RED]: "Error"}}: ${{[Color.WHITE]: error}}\n`
    } else if (result !== undefined) {
        terminal.printf`${{[Color.rgb(38, 255, 38)]: ">>>"}} ${{[Color.WHITE]: String(result)}}\n`
    }
}, {
    description: "evaluate javascript code",
    rawArgMode: true
})

