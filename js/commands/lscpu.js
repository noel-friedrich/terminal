terminal.addCommand("lscpu", function() {
    const runs = 150000000
    const start = performance.now()
    for (let i = runs; i > 0; i--) {}
    const end = performance.now()
    const ms = end - start
    const cyclesPerRun = 2
    const speed = (runs / ms / 1000000) * cyclesPerRun
    const ghz = Math.round(speed * 10) / 10

    let vendor = "unknown"
    let renderer = "unknown"

    try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (gl) {
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
            vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
            renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        } else {
            throw new Error()
        }
    } catch {
        terminal.printError("Couldn't access gpu info")
    }

    terminal.printTable([
        ["logical cpu cores", navigator.hardwareConcurrency],
        ["platform (guess)", navigator.platform],
        ["cpu clockspeed (guess)", `${ghz} ghz`],
        ["gpu vendor", vendor],
        ["gpu renderer", renderer]
    ])
}, {
    description: "get some helpful info about your cpu"         
})

