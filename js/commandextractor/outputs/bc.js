terminal.addCommand("bc", async function() {
    while (true) {
        let text = await terminal.prompt()
        let [result, error] = evalJsEnv.eval(text)
        if (error) {
            terminal.printf`${{[Color.rgb(38, 255, 38)]: ">"}} ${{[Color.WHITE]: error}}\n`
        } else if (result !== null) {
            terminal.printf`${{[Color.rgb(38, 255, 38)]: ">"}} ${{[Color.WHITE]: String(result)}}\n`
        }
    }
}, {
    description: "start a bc (basic calculator) session"
})

