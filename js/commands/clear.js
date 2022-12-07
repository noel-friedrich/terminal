terminal.addCommand("clear", async function() {
    terminal.reload()
    await sleep(3000)
    throw new Error("did reloading fail?")
}, {
    description: "clear the terminal"
})