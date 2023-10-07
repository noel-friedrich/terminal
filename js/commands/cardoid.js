terminal.addCommand("cardoid", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../cardoid/",
        name: "Cardoid Generator",
        fullscreen: args.fullscreen
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "start a cardoid generator",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})