terminal.addCommand("ant-opt", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../path-finder/",
        name: "Interactive Ant Colony Optimization"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "interactive solution to the travelling salesman problem using ant colony optimization"
})