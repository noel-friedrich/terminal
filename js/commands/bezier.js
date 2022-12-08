terminal.addCommand("bezier", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "https://noel-friedrich.de/bezier/",
        name: "Bezier Playground"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play with bezier curves"
})