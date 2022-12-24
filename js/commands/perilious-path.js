terminal.addCommand("perilious-path", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../perilious-path/",
        name: "Perilious Path Game"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play perilous path"
})