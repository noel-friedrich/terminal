terminal.addCommand("coville", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../coville/",
        name: "Covid in Coville"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "interactive virus simulation (in german)",
    isSecret: true
})