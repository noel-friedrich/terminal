terminal.addCommand("raycasting", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../raycasting/",
        name: "Raycasting Demo",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play with raycasting",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})