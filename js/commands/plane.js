terminal.addCommand("plane", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../flugzeug-spiel/",
        name: "Plane Game"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "play the plane game",
    isGame: true
})