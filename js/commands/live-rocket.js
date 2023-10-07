terminal.addCommand("live-rocket", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../sport/",
        name: "Live Rocket Avoid Game",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "a simple avoid game that you steer using camera input",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})