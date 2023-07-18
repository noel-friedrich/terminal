terminal.addCommand("live-rocket", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../sport/",
        name: "Live Rocket Avoid Game"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "a simple avoid game that you steer using camera input",
})