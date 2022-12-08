terminal.addCommand("cardoid", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../cardoid/",
        name: "Cardoid Generator"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a cardoid generator"
})