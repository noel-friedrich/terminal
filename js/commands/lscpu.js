terminal.addCommand("lscpu", function() {
    const runs = 150000000
    const start = performance.now()
    for (let i = runs; i > 0; i--) {}
    const end = performance.now()
    const ms = end - start
    const cyclesPerRun = 2
    const speed = (runs / ms / 1000000) * cyclesPerRun
    const ghz = Math.round(speed * 10) / 10

    terminal.printLine(`platform: ${navigator.platform}`)
    terminal.printLine(`cores: ${navigator.hardwareConcurrency}`)
    terminal.printLine(`clock speed (guess): ${ghz}ghz`)
}, {
    description: "get some helpful info about your cpu"         
})

