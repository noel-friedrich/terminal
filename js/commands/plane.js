terminal.addCommand("plane", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../flugzeug-spiel/",
        name: "Plane Game",
        fullscreen: args.fullscreen
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "play the plane game",
    args: {
        "?f=fullscreen:b": "open in fullscreen mode"
    },
    isGame: true
})