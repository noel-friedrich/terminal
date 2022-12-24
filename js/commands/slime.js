terminal.addCommand("slime", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../slime/",
        name: "Slime Simulation"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "Start a slime simulation"
})