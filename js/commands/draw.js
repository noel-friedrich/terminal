terminal.addCommand("draw", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../draw/",
        name: "Draw"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start simple drawing app"
})