terminal.addCommand("bezier", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../bezier/",
        name: "Bezier Playground"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play with bezier curves"
})