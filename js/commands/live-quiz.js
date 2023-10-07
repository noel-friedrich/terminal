terminal.addCommand("live-quiz", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../quiz/",
        name: "Live Quiz Game",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "a simple quiz game that uses your camera as input for your answer",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})