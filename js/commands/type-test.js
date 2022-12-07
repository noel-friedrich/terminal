terminal.addCommand("type-test", async function(args) {
    await terminal.modules.import("game", window)

    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    
    function generateText(length) {
        let text = ""
        for (let i = 0; i < length; i++) {
            let randomCharIndex = Math.floor(Math.random() * chars.length)
            let randomChar = chars[randomCharIndex]
            text += randomChar
        }
        return text
    }
    
    terminal.addLineBreak()
    
    let text = generateText(60)
    let typeIndex = -1
    let charElements = []
    for (let char of text) {
        let element = terminal.print(char, undefined, {forceElement: true})
        element.style.fontSize = "2em"
        charElements.push(element)
        if (charElements.length % 30 == 0) {
            terminal.addLineBreak()
        }
    }
    
    terminal.addLineBreak()
    let outputLine = terminal.printLine("Start the text by typing the highlighted character!")
    
    let ended = false
    let startTime = null
    let started = false
    let correctCount = 0
    
    function endTypeTest() {
        ended = true
    }
    
    function advanceCharIndex(success) {
        if (typeIndex == 0) {
            startTime = Date.now()
            started = true
        }
        let prevCharElement = charElements[typeIndex]
        let nextCharElement = charElements[typeIndex + 1]
        if (prevCharElement && success) {
            prevCharElement.style.color = "lightgreen"
            prevCharElement.style.backgroundColor = "transparent"
            correctCount++
        } else if (prevCharElement && !success) {
            prevCharElement.style.color = "red"
            prevCharElement.style.backgroundColor = "transparent"
            correctCount = Math.max(correctCount - 1, 0)
        }
        if (!nextCharElement) {
            endTypeTest()
        } else {
            nextCharElement.style.backgroundColor = "white"
            nextCharElement.style.color = "black"
        }
        typeIndex++
    }
    
    advanceCharIndex(false)
    
    let listener = addEventListener("keydown", event => {
        if (ended) return
        let upperKey = event.key.toUpperCase()
        if (event.key == "c" && event.ctrlKey) {
            removeEventListener("keydown", listener)
            ended = true
        } else if (chars.includes(upperKey)) {
            let success = upperKey == text[typeIndex]
            advanceCharIndex(success)
        }
    })
    
    let seconds = 0
    let cpm = 0
    
    function updateDisplays() {
        seconds = Math.floor((Date.now() - startTime) / 100) / 10
        cpm = Math.ceil(correctCount / (seconds / 60))
        outputLine.textContent = `seconds: ${seconds}, cpm=${cpm}`
    }
    
    terminal.scroll()
    
    while (!ended) {
        await sleep(50)
        if (started)
            updateDisplays()
    }
    
    removeEventListener("keydown", listener)
    
    terminal.printLine("FINISHED!")
    terminal.printLine(`You took ${seconds} seconds for ${correctCount} chars.`)
    terminal.printLine(`That evaluates to a score of ${cpm} cpm!`)
    
    await HighscoreApi.registerProcess("type-test")
    await HighscoreApi.uploadScore(cpm)
    
}, {
    description: "test your typing speed",
    isGame: true
})