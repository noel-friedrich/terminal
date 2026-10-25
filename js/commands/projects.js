terminal.addCommand("projects", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../projects/",
        name: "Projects Page",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "open the projects page",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"},
    category: "information"
})