terminal.addCommand("coville", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../coville/",
        name: "Covid in Coville",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "interactive virus simulation (in german)",
    isSecret: true,
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})