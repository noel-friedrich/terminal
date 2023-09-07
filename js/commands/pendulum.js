terminal.addCommand("pendulum", async function(args) {
    args.o /= args.n / 20
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../pendulum-wave/?n=" + encodeURIComponent(args.n) + "&o=" + encodeURIComponent(args.o),
        name: "Pendulum Wave Simulation"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "start a pendulum wave simulation",
    args: {
        "?n:i:1~10000": "number of pendulums",
        "?o:n:0~1": "offset of pendulums"
    },
    standardVals: {
        n: 20,
        o: 0.025
    }
})