class ProgressBar {

    constructor({
        width = 40
    }={}) {
        this.width = width
        this.outputElement = terminal.print("", undefined, {forceElement: true})
        this.removed = false
    }

    update(progress) {
        if (this.removed) {
            return
        }

        const borderHorizontal = "+" + "-".repeat(this.width - 2) + "+"
        const text = borderHorizontal + "\n|"
        const middleChars = Array.from({length: this.width - 2}).map((_, i) => {
            const p = i / (this.width - 3)
            return (p <= progress) ? "#" : " "
        })

        const progressText = Math.floor(100 * progress) + "%"
        let cursorIndex = Math.round(middleChars.length / 2 - Math.floor(progressText.length / 2))
        middleChars[cursorIndex - 1] = " "
        middleChars[cursorIndex + progressText.length] = " "
        for (let i = 0; i < progressText.length; i++) {
            middleChars[cursorIndex + i] = progressText[i]
        }

        this.outputElement.textContent = text + middleChars.join("") + "|\n" + borderHorizontal + "\n"
    }

    finish() {
        this.update(1)
    }

    remove() {
        this.outputElement.remove()
        this.removed = true
    }

}

function printProgressBar(opts) {
    const bar = new ProgressBar(opts)
    bar.update(0)
    return bar
}

terminal.modules.progressbar = {
    printProgressBar, ProgressBar
}