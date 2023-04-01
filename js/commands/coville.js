terminal.addCommand("coville", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../coville/",
        name: "Covid in Coville"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "interactive virus simulation (in german)"
})