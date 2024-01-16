terminal.addCommand("plotter", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../plot/",
        name: "Function Plotter",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(1000)
}, {
    description: "plot mathematical functions",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})