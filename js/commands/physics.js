terminal.addCommand("physics", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../cloth/",
        name: "Click to add points, Space to simulate"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a physics simulation"
})