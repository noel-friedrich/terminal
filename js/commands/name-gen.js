terminal.addCommand("name-gen", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../names/",
        name: "AI Name Finder. Rate some and click 'done'",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a name generator",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})