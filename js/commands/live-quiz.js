terminal.addCommand("live-quiz", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../quiz/",
        name: "Live Quiz Game"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "a simple quiz game that uses your camera as input for your answer"
})