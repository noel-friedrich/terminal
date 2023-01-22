class EnigmaWheel {

    constructor(permutation, overflowLetter, offset, name) {
        this.permutation = permutation
        this.overflowLetter = overflowLetter
        this.offset = offset
        this.name = name
    }

    translate(letter, reverse=false) {
        if (!reverse) {
            let letterIndex = letter.charCodeAt(0) - 65
            let translatedIndex = (letterIndex + this.offset) % 26
            let translatedLetter = this.permutation[translatedIndex]
            return translatedLetter
        } else {
            let letterIndex = this.permutation.indexOf(letter)
            let translatedIndex = (letterIndex - this.offset + 26) % 26
            let translatedLetter = String.fromCharCode(translatedIndex + 65)
            return translatedLetter
        }
    }

    toString() {
        return this.permutation + " " + this.overflowLetter + " " + this.offset
    }

    rotate() {
        this.offset = (this.offset + 1) % 26
        // return true if the wheel has rotated to the overflow letter
        return this.offset == this.overflowLetter.charCodeAt(0) - 65
    }

    reset() {
        this.offset = 0
    }

    static get DEFAULTS() {
        return {
            I: new EnigmaWheel("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, "I"),
            II: new EnigmaWheel("AJDKSIRUXBLHWTMCQGZNPYFVOE", "E", 0, "II"),
            III: new EnigmaWheel("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V", 0, "III"),
            IV: new EnigmaWheel("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J", 0, "IV"),
            V: new EnigmaWheel("VZBRGITYUPSDNHLXAWMJQOFECK", "Z", 0, "V")
        }
    }

}

terminal.wheel = EnigmaWheel

function flipObject(obj) {
    let flipped = {}
    for (let key in obj) {
        flipped[obj[key]] = key
    }
    return flipped
}

class EnigmaPlugboard {

    constructor(swaps={}) {
        this.swaps = swaps
    }

    static fromString(str) {
        if (str == " ")
            return new EnigmaPlugboard({})

        // str is "AB CD EF GH IJ KL MN OP QR ST UV WX YZ"
        if (!/^(?:[A-Z]{2}\s)*$/.test(str)) {
            throw new Error("Invalid plugboard string")
        }

        let swaps = {}
        for (let pair of str.split(" ")) {
            if (pair.length == 0)
                continue
            if (pair.length == 2) {
                let flippedSwaps = flipObject(swaps)
                if (pair[0] in swaps || pair[1] in swaps
                    || pair[0] in flippedSwaps || pair[1] in flippedSwaps)
                    throw new Error("Cannot swap a letter with multiple letters")

                swaps[pair[0]] = pair[1]

                if (Object.keys(swaps).length > 10)
                    throw new Error("Too many swaps")

                if (pair[0] == pair[1])
                    throw new Error("Cannot swap a letter with itself")
            } else {
                throw new Error("Invalid plugboard string")
            }
        }

        return new EnigmaPlugboard(swaps)
    }

    get reverseSwaps() {
        return flipObject(this.swaps)
    }

    translate(letter) {
        if (letter in this.swaps) {
            return this.swaps[letter]
        }
        if (letter in this.reverseSwaps) {
            return this.reverseSwaps[letter]
        }
        return letter
    }

    toString() {
        let output = ""
        for (let key in this.swaps) {
            output += `${key}${this.swaps[key]} `
        }
        if (output.length > 0) {
            return output.slice(0, -1)
        } else {
            return "No swaps"
        }
    }

}

class EnigmaReflector extends EnigmaPlugboard {

    constructor(swaps, name) {
        super(swaps)
        this.name = name
    }

    static get DEFAULTS() {
        return {
            UKW_A: new EnigmaReflector({
                "A": "E", "B": "J", "C": "M", "D": "Z",
                "F": "L", "G": "Y", "H": "X", "I": "V",
                "K": "W", "N": "R", "O": "Q", "P": "U",
                "S": "T"
            }, "UKW-A"),
            UKW_B: new EnigmaReflector({
                "A": "Y", "B": "R", "C": "U", "D": "H",
                "E": "Q", "F": "S", "G": "L", "I": "P",
                "J": "X", "K": "N", "M": "O", "T": "Z",
                "V": "W"
            }, "UKW-B"),
            UKW_C: new EnigmaReflector({
                "A": "F", "B": "V", "C": "P", "D": "J",
                "E": "I", "G": "O", "H": "Y", "K": "R",
                "L": "Z", "M": "X", "N": "W", "Q": "T",
                "S": "U"
            }, "UKW-C")
        }
    }

}

class EnigmaMachine {

    constructor() {
        this.wheels = [
            EnigmaWheel.DEFAULTS.I,
            EnigmaWheel.DEFAULTS.II,
            EnigmaWheel.DEFAULTS.III
        ]
        this.reflector = EnigmaReflector.DEFAULTS.UKW_A
        this.plugboard = new EnigmaPlugboard()

        this.letterOutputs = null
        this.inputOutput = null
        this.encryptedOutput = null

        this.running = false

        this.keyListener = terminal.window.addEventListener("keydown", event => {
            let key = event.key.toUpperCase()
            if (this.running && !event.repeat && !event.ctrlKey && !event.altKey) {
                if (key.length == 1 && key.match(/[A-Z]/)) {
                    let output = this.input(key)
                    this.lightupLetter(output)
                }
            }
        })

        this.pendingTimeouts = []
    }

    clearPendingTimeouts() {
        this.pendingTimeouts.forEach(timeout => clearTimeout(timeout))
        this.pendingTimeouts = []
    }

    reset() {
        this.wheels.forEach(wheel => wheel.reset())
    }

    rotate() {
        let rotateNextWheel = true
        for (let i = this.wheels.length - 1; i >= 0; i--) {
            if (rotateNextWheel) {
                rotateNextWheel = this.wheels[i].rotate()
            }
        }
    }

    input(letter) {
        let translatedLetter = letter
        translatedLetter = this.plugboard.translate(translatedLetter)
        for (let i = this.wheels.length - 1; i >= 0; i--) {
            translatedLetter = this.wheels[i].translate(translatedLetter)
        }
        translatedLetter = this.reflector.translate(translatedLetter)
        for (let i = 0; i < this.wheels.length; i++) {
            translatedLetter = this.wheels[i].translate(translatedLetter, true)
        }
        translatedLetter = this.plugboard.translate(translatedLetter)

        this.rotate()

        if (this.inputOutput) {
            this.inputOutput.textContent += letter
            this.encryptedOutput.textContent += translatedLetter
        }

        return translatedLetter
    }

    lightupLetter(letter, destroyElse=true, ms=1000) {
        if (!this.letterOutputs) {
            return
        }

        if (destroyElse) {
            this.clearPendingTimeouts()
        }

        for (let key in this.letterOutputs) {
            if (key == letter) {
                this.letterOutputs[key].style.backgroundColor = "var(--accent-color-1)"
                this.letterOutputs[key].style.color = "var(--background)"
                this.pendingTimeouts.push(setTimeout(() => {
                    this.letterOutputs[key].style.backgroundColor = "var(--background)"
                    this.letterOutputs[key].style.color = "var(--foreground)"
                }, ms))
            } else if (destroyElse) {
                this.letterOutputs[key].style.backgroundColor = "var(--background)"
                this.letterOutputs[key].style.color = "var(--foreground)"
            }
        }
    }

    printKeyboard() {
        this.letterOutputs = {}

        //  Q W E R T Z U I O
        //   A S D F G H J K
        //  P Y X C V B N M L

        const printLetter = letter => {
            let element = null
            for (let char of letter) {
                let temp = terminal.print(char, undefined, {forceElement: true})
                if (/[A-Z]/.test(char)) {
                    element = temp
                }
            }
            return element
        }

        terminal.printLine("+" + "-".repeat(19) + "+")
        terminal.print("| ")

        this.letterOutputs["Q"] = printLetter("Q ")
        this.letterOutputs["W"] = printLetter("W ")
        this.letterOutputs["E"] = printLetter("E ")
        this.letterOutputs["R"] = printLetter("R ")
        this.letterOutputs["T"] = printLetter("T ")
        this.letterOutputs["Z"] = printLetter("Z ")
        this.letterOutputs["U"] = printLetter("U ")
        this.letterOutputs["I"] = printLetter("I ")
        this.letterOutputs["O"] = printLetter("O")

        terminal.printLine(" |")
        terminal.print("| ")

        this.letterOutputs["A"] = printLetter(" A ")
        this.letterOutputs["S"] = printLetter("S ")
        this.letterOutputs["D"] = printLetter("D ")
        this.letterOutputs["F"] = printLetter("F ")
        this.letterOutputs["G"] = printLetter("G ")
        this.letterOutputs["H"] = printLetter("H ")
        this.letterOutputs["J"] = printLetter("J ")
        this.letterOutputs["K"] = printLetter("K ")

        terminal.printLine(" |")
        terminal.print("| ")

        this.letterOutputs["P"] = printLetter("P ")
        this.letterOutputs["Y"] = printLetter("Y ")
        this.letterOutputs["X"] = printLetter("X ")
        this.letterOutputs["C"] = printLetter("C ")
        this.letterOutputs["V"] = printLetter("V ")
        this.letterOutputs["B"] = printLetter("B ")
        this.letterOutputs["N"] = printLetter("N ")
        this.letterOutputs["M"] = printLetter("M ")
        this.letterOutputs["L"] = printLetter("L")

        terminal.printLine(" |")
        terminal.printLine("+" + "-".repeat(19) + "+")

        for (let [letter, element] of Object.entries(this.letterOutputs)) {
            element.classList.add("clickable")

            element.addEventListener("click", () => {
                if (!this.running) {
                    return
                }
                let translatedLetter = this.input(letter)
                this.lightupLetter(translatedLetter)
            })
        }

        terminal.printLine()
        terminal.print("Input:  ")
        this.inputOutput = terminal.print("", undefined, {forceElement: true})
        terminal.printLine()
        terminal.print("Output: ")
        this.encryptedOutput = terminal.print("", undefined, {forceElement: true})
        terminal.printLine()
    }

}

let enigmaMachine = new EnigmaMachine()
terminal.enigma = enigmaMachine

terminal.addCommand("enigma", async function(args) {
    function printHelp() {
        const printOpt = (opt, desc) => terminal.printCommand(` -${opt}: ${desc}`, `enigma -${opt}`)

        terminal.printLine("Use one of the following arguments:")
        printOpt("t", "translation mode")
        printOpt("c", "config mode")
        printOpt("s", "show current settings")
        printOpt("r", "reset")
    }

    let numArgsSpecified = [args.c, args.t, args.r, args.s].map(Boolean).reduce((a, b) => a + b, 0)
    if (numArgsSpecified > 1) {
        terminal.printError("Too many arguments specified")
        printHelp()
        return
    }

    if (args.s) {

        terminal.printLine("Current settings:")
        terminal.printLine(` - Rotors:`)
        for (let rotor of enigmaMachine.wheels) {
            terminal.printLine(`   - Rotor#${rotor.name} (${rotor.toString()})`)
        }
        terminal.printLine(` - Reflector: ${enigmaMachine.reflector.name} (${enigmaMachine.reflector.toString()})`)
        terminal.printLine(` - Plugboard: ${enigmaMachine.plugboard.toString()}`)

    } else if (args.c) {

        let availableRotors = Object.keys(EnigmaWheel.DEFAULTS)
        let availableReflectors = Object.keys(EnigmaReflector.DEFAULTS)

        const choose = async (msg, options, wheel=false) => {
            terminal.printLine(msg)
            let i = 0
            for (let [name, value] of Object.entries(options)) {
                terminal.printLine(`  [${i + 1}] ${name} (${value})`)
                i++
            }
            let input = await terminal.promptNum(`Choose a number [1-${i}]: `, {min: 1, max: i})
            let returnValue = Object.values(options)[input - 1]
            if (wheel) {
                let offset = await terminal.promptNum("Choose an offset [1-26]: ", {min: 1, max: 26})
                returnValue.offset = offset - 1
            }
            terminal.printLine()
            return returnValue
        }

        const choosePlugboard = async () => {
            terminal.printLine("Enter the plugboard settings (e.g. AB CD EF)")
            terminal.printLine("Leave empty to use the default plugboard")
            const promptP = async () => {
                return await terminal.prompt("> ")
            }
            while (true) {
                let input = (await promptP()).trim() + " "
                try {
                    return EnigmaPlugboard.fromString(input)
                } catch (e) {
                    terminal.printError(e.message)
                }
            }
        }

        let rotors = []
        rotors.push(await choose("Choose the first Rotor", EnigmaWheel.DEFAULTS, true))
        rotors.push(await choose("Choose the second Rotor", EnigmaWheel.DEFAULTS, true))
        rotors.push(await choose("Choose the third Rotor", EnigmaWheel.DEFAULTS, true))

        let reflector = await choose("Choose the reflector", EnigmaReflector.DEFAULTS)

        let plugboard = await choosePlugboard()

        enigmaMachine.wheels = rotors
        enigmaMachine.reflector = reflector
        enigmaMachine.plugboard = plugboard

        terminal.printSuccess("Enigma machine configured")

        terminal.print("Use ")
        terminal.printCommand("enigma -s", "enigma -s", undefined, false)
        terminal.printLine(" to see the current settings")

    } else if (args.t) {

        terminal.printLine("Click on a letter to translate it (Use Ctrl+C to exit)\n")
        enigmaMachine.printKeyboard()
        enigmaMachine.running = true

        terminal.onInterrupt(() => {
            enigmaMachine.running = false
        })

        terminal.scroll()

        while (enigmaMachine.running) {
            await sleep(100)
        }

    } else if (args.r) {

        enigmaMachine.reset()
        terminal.printSuccess("Enigma machine reset")
        terminal.printLine("All Rotors are now set to A again")

    } else {
        terminal.printError("No arguments specified")
        printHelp()
    }
}, {
    description: "Simulate an Enigma machine",
    args: {
        "?c=config:b": "Enables config mode",
        "?t=translate:b": "Enables translation mode",
        "?r=reset:b": "Resets the machine",
        "?s=show:b": "Shows the current settings"
    }
})