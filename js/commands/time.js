terminal.addCommand("time", async function(args) {
    const output = terminal.print("", undefined, {forceElement: true})
    output.style.fontSize = args.size + "em"
    output.style.paddingTop = "0.5em"
    output.style.paddingBottom = "0.5em"
    output.style.display = "inline-block"
    
    let startTime = 0
    if (args.start) {
        startTime = Date.now()
    }

    function makeTimeString() {
        let ms = Date.now() - startTime

        if (!args.start) {
            let offset = new Date().getTimezoneOffset()
            // offset is given in -minutes
            ms -= offset * 60 * 1000
        }

        const milliseconds = ms % 1000
        const seconds = Math.floor(ms / 1000) % 60
        const minutes = Math.floor(ms / 1000 / 60) % 60
        const hours = Math.floor(ms / 1000 / 60 / 60) % 24

        const p = (num, len=2) => {
            return num.toString().padStart(len, "0")
        }

        return `${p(hours)}:${p(minutes)}:${p(seconds)}${args.m ? `:${p(milliseconds, 3)}` : ""}`
    }

    let running = true

    function update() {
        output.textContent = makeTimeString()
        if (running)
            terminal.window.requestAnimationFrame(update)
    }

    update()

    terminal.onInterrupt(() => {
        running = false
    })

    output.textContent = makeTimeString()

    while (running) {
        await terminal.sleep(100)
    }

}, {
    description: "Shows the current time.",
    args: {
        "?m=show-milli:b": "Show milliseconds.",
        "?f=size:n:0.1~99": "Font size in em.",
        "?s=start:b": "Start a stopwatch.",
    },
    defaultValues: {
        size: 3,
    }
})