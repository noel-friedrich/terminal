terminal.addCommand("reload", async function(args) {
    if (terminal.inTestMode)
        return
    const newLoadIndex = parseInt(loadIndex) + 1
    localStorage.setItem("loadIndex", newLoadIndex)
    terminal.reload()
}, {
    description: "forces a reload of all website assets",
    category: "terminal-manipulation"
})