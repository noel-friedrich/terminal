terminal.addCommand("terminal", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.window.location.href,
        name: "Terminal inside Terminal"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "a terminal inside a terminal"
})