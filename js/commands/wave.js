terminal.addCommand("wave", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../wave/",
        name: "Wave Simulator"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play with a wave"
})