terminal.addCommand("name-gen", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../names/",
        name: "AI Name Finder. Rate some and click 'done'"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a name generator"
})