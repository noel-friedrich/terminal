terminal.addCommand("blobber", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../blobber/",
        name: "Blobber"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start blobber"
})