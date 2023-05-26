terminal.addCommand("wave", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../wave/",
        name: "Wave Simulator"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })

    while (true) await sleep(100)
}, {
    description: "play with a wave"
})