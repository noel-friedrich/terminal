terminal.addCommand("morse", async function(args) {
    function mostPopularChar(string) {
        string = string.toLowerCase().trim()
        let occurences = {}
        for (let char of string) {
            if (!"abcdefghijklmnopqrstuvwxyz.-".includes(char))
                continue
            if (char in occurences) {
                occurences[char]++
            } else {
                occurences[char] = 1
            }
        }
        let mostPopularC = null
        let mostOccurences = 0
        for (let [char, count] of Object.entries(occurences)) {
            if (count > mostOccurences) {
                mostOccurences = count
                mostPopularC = char
            }
        }
        return mostPopularC
    }
    
    MORSE = {
        A: ".-", B: "-...", C: "-.-.",
        D: "-..", E: ".", F: "..-.",
        G: "--.", H: "....", I: "..",
        J: ".---", K: "-.-", L: ".-..",
        M: "--", N: "-.", O: "---",
        P: ".--.", Q: "--.-", R: ".-.",
        S: "...", T: "-", U: "..-",
        V: "...-", W: ".--", X: "-..-",
        Y: "-.--", Z: "--..",
        "0": "----", "1": ".----",
        "2": "..---", "3": "...--",
        "4": "....-", "5": ".....",
        "6": "-....", "7": "--...",
        "8": "---..", "9": "----.",
        ".": ".-.-.-", ",": "--..--",
        "?": "..--..", "'": ".----.",
        "!": "-.-.--", "/": "-..-.",
        "(": "-.--.", ")": "-.--.-",
        "&": ".-...", ":": "---...",
        ";": "-.-.-.", "=": "-...-",
        "+": ".-.-.", "-": "-....-",
        "_": "..--.-", '"': ".-..-.",
        "$": "...-..-", "@": ".--.-."
    }
    let text = args.text.trim().toUpperCase()
    const noinput = () => terminal.printError("No input given.")
    try {
        playFrequency(0, 0)
    } catch {}
    let audioSpeed = 0.4
    if (text.length > 30) audioSpeed = 0.1
    if ([".", "-"].includes(mostPopularChar(text))) {
        text += " "
        let tempLine = "" 
        let tempChar = ""
        for (let char of text) {
            tempChar += char
            if (char == " ") {
                for (let [morseChar, morseCode] of Object.entries(MORSE)) {
                    if (tempChar.trim() == morseCode) {
                        tempLine += morseChar
                        tempChar = ""
                    }
                }
                tempLine += tempChar
                tempChar = ""
            }
            if (tempLine.length > 40) {
                terminal.printLine(tempLine)
                tempLine = ""
            }
        }
        if (tempLine) terminal.printLine(tempLine)
        if (!text) noinput()
    } else {
        for (let char of text) {
            if (char in MORSE) {
                let morseCode = `${MORSE[char].replaceAll(".", "•")}`
                for (let morseChar of morseCode) {
                    terminal.print(morseChar)
                    if (morseChar == "•") {
                        playFrequency(300, 300 * audioSpeed)
                        await sleep(600 * audioSpeed)
                    } else if (morseChar == "-") {
                        playFrequency(600, 600 * audioSpeed)
                        await sleep(900 * audioSpeed)
                    }
                }
                if (audioContext) {
                    await sleep(800 * audioSpeed)
                }
                terminal.print(" ")
            } else if (char == " ") {
                if (audioContext) {
                    await sleep(1000 * audioSpeed)
                }
                terminal.printLine()
            } else {
                terminal.print(char)
            }
        }
        terminal.printLine()
        if (!text) noinput()
    }
}, {
    description: "translate latin to morse or morse to latin",
    args: {
        "*text": "text to translate"
    }
})

