terminal.addCommand("clear", async function() {
    terminal.clear()
    terminal.standardInputPrompt()
}, {
    description: "clear the terminal"
})