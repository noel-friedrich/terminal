terminal.addCommand("cardoid", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../cardoid/",
        name: "Cardoid Generator"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "start a cardoid generator"
})