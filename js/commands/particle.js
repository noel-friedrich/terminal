terminal.addCommand("particle", async function(args) {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../particle/?p=" + encodeURIComponent(args.n),
        name: "Click to change gravity"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a particle simulation",
    args: {
        "?n:i:1000~10000000": "number of particles"
    },
    standardVals: {
        n: 100000
    }
})