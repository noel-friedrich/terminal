terminal.addCommand("plotter", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../plot/",
        name: "Function Plotter"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "plot mathematical functions"
})