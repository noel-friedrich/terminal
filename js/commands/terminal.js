terminal.addCommand("terminal", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.window.location.href,
        name: "Terminal inside Terminal",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "a terminal inside a terminal",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})