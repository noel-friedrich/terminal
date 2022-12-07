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

    let notes = [[800, 1], [800, 1], [800, 1], [800, 1]]
    let beep = [[400, 8]]

    try {
        var melodiesFolder = getFolder(["noel", "melodies"])[0].content
    } catch {
        throw new Error("Melodys Folder not found!")
    }
    let melodyNotes = []
    let i = 0
    for (let [fileName, file] of Object.entries(melodiesFolder)) {
        let melodyName = fileName.split(".", 1)[0]
        try {
            melodyNotes.push(JSON.parse(file.content))
            i++
            terminal.printf`${{[Color.COLOR_1]: i}}: ${{[Color.WHITE]: melodyName}}\n`
        } catch {}
    }

    if (melodyNotes.length > 0) {
        let promptMsg = `Which melody do you want to use [1-${melodyNotes.length}]? `
        let tuneSelection = await terminal.promptNum(promptMsg, {min: 1, max: melodyNotes.length})
        notes = melodyNotes[tuneSelection - 1]
    }

    let startTime = Date.now()

    function printStatus(width=50) {
        terminal.printLine()
        let status = Math.min((Date.now() - startTime) / ms, 1)
        let progressbar = stringMul("#", Math.ceil(status * (width - 4)))
        terminal.printLine("+" + stringMul("-", width - 2) + "+")
        terminal.printLine(`| ${stringPadBack(progressbar, width - 4)} |`)
        terminal.printLine("+" + stringMul("-", width - 2) + "+")
        let secondsDiff = (ms / 1000) - Math.floor((Date.now() - startTime) / 1000)
        if (secondsDiff < 0) secondsDiff = 0
        let seconds = Math.ceil(secondsDiff % 60)
        let minutes = 0
        while (secondsDiff >= 60) {
            minutes += 1
            secondsDiff -= 60
        }
        let timeStr = (minutes ? `${minutes}m ` : "") + `${seconds}s left`
        if (status != 1)
            terminal.printLine(`${Math.round(status * 100)}% - ${timeStr}`)
        else
            terminal.printf`${{[Color.LIGHT_GREEN]: "-- timer finished --"}}\n`
    }

    async function alarm() {
        await playMelody(notes)
    }

    let prevTextDiv = null
    while (Date.now() - startTime < ms) {
        textDiv = document.createElement("div")
        terminal.parentNode.appendChild(textDiv)
        terminal.setTextDiv(textDiv)
        printStatus()
        terminal.resetTextDiv()
        if (prevTextDiv) prevTextDiv.remove()
        prevTextDiv = textDiv
        terminal.scroll()
        if (Date.now() - startTime - ms > -3500) {
            await playMelody(beep)
        }
        await sleep(1000)
    }
    if (prevTextDiv) prevTextDiv.remove()
    printStatus()
    try {
        playFrequency(0, 0)
    } catch {}
    if (audioContext) {
        await alarm()
    }
}, {
    description: "set a timer",
    rawArgMode: true
})

