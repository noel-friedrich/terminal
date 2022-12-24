terminal.addCommand("reload", async function(args) {
    if (terminal.inTestMode)
        return
    const newLoadIndex = parseInt(loadIndex) + 1
    localStorage.setItem("loadIndex", newLoadIndex)
    terminal.reload()
}, {
    description: "Reloads the terminal",
})