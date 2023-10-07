terminal.addCommand("perilious-path", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../perilious-path/",
        name: "Perilious Path Game",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "play perilous path",
    isGame: true,
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})