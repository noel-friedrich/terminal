terminal.addCommand("ant-opt", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../path-finder/",
        name: "Interactive Ant Colony Optimization",
        fullscreen: args.fullscreen
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "interactive solution to the travelling salesman problem using ant colony optimization",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})