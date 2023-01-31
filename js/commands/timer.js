terminal.addCommand("timer", async function(rawArgs) {
    let words = rawArgs.split(" ").filter(w => w.length > 0)
    let ms = 0
    for (let word of words) {
        if (/^[0-9]+s$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 1000
        } else if (/^[0-9]+m$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 60 * 1000
        } else if (/^[0-9]+h$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 60 * 60 * 1000
        } else {
            throw new Error(`Invalid time '${word}'`)
        }
    }

    if (ms == 0) {
        terminal.printLine("An example time could be: '1h 30m 20s'")
        throw new Error("Invalid time!")
    }

    const progressBarWidth = 30

    class Timer {

        firstPrint() {
            terminal.printLine("+" + "-".repeat(progressBarWidth) + "+")
            terminal.print("|")
            this.progressOutput = terminal.print("", undefined, {forceElement: true})
            terminal.printLine("|")
            terminal.printLine("+" + "-".repeat(progressBarWidth) + "+")
            this.timeLeftOutput = terminal.print("", undefined, {forceElement: true})
            terminal.addLineBreak()
        }

        constructor() {
            this.progressOutput = null
            this.timeLeftOutput = null

            this.startTime = Date.now()
            this.endTime = this.startTime + ms
            this.firstPrint()
            this.running = true
            this.interval = setInterval(this.update.bind(this), 100)
        }

        update() {
            if (!this.running) return

            let timeLeft = this.endTime - Date.now()
            if (timeLeft <= 0) {
                this.stop()
            } else {
                let seconds = Math.floor(timeLeft / 1000) % 60
                let minutes = Math.floor(timeLeft / (60 * 1000)) % 60
                let hours = Math.floor(timeLeft / (60 * 60 * 1000))
                this.timeLeftOutput.textContent = `Time left: ${hours}h ${minutes}m ${seconds}s`
                let progressCount = Math.floor((progressBarWidth * (ms - timeLeft)) / ms)
                let percent = Math.floor((100 * (ms - timeLeft)) / ms)
                let progress = stringPadMiddle(`${percent}%`, progressCount, "=")
                this.progressOutput.textContent = stringPadBack(progress, progressBarWidth, " ")
            }
        }

        async alarm() {
            let frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5]
            let duration = 100

            for (let i = 0; i < 2; i++) {
                for (let freq of frequencies) {
                    await playFrequency(freq, duration)
                }

                for (let freq of frequencies.reverse()) {
                    await playFrequency(freq, duration)
                }
            }
        }

        stop() {
            if (!this.running) return
            clearInterval(this.interval)
            this.running = false
            this.alarm()
            this.timeLeftOutput.textContent = "Time's up!"
            this.progressOutput.textContent = stringPadMiddle("100%", progressBarWidth, "=")
        }

    }

    let timer = new Timer()

    while (timer.running) await sleep(100)

}, {
    description: "set a timer",
    rawArgMode: true
})

