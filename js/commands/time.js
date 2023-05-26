terminal.addCommand("time", async function(args) {
    const output = terminal.print("", undefined, {forceElement: true})
    output.style.fontSize = args.size + "em"
    output.style.paddingTop = "0.5em"
    output.style.paddingBottom = "0.5em"
    output.style.display = "inline-block"

    function makeTimeString() {
        const date = new Date()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()
        const milliseconds = date.getMilliseconds()

        const p = (num, len=2) => {
            return num.toString().padStart(len, "0")
        }

        return `${p(hours)}:${p(minutes)}:${p(seconds)}${args.m ? `:${p(milliseconds, 3)}` : ""}`
    }

    const interval = setInterval(() => {
        output.textContent = makeTimeString()
    }, 10)

    terminal.onInterrupt(() => {
        clearInterval(interval)
    })

    output.textContent = makeTimeString()

    while (true) {
        await terminal.sleep(100)
    }

}, {
    description: "Shows the current time.",
    args: {
        "?m=show-milli:b": "Show milliseconds.",
        "?s=size:n:0.1~99": "Font size in em."
    },
    defaultValues: {
        size: 3,
    }
})