terminal.addCommand("raycasting", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../raycasting/",
        name: "Raycasting Demo"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play with raycasting"
})