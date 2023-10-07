terminal.addCommand("physics", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../cloth/",
        name: "Click to add points, Space to simulate",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a physics simulation",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})