class TuringError {

    constructor(message, lineNum, lineContent) {
        this.message = message
        this.lineNum = lineNum
        this.lineContent = lineContent
    }

    print() {
        terminal.printError(this.message)
        if (this.lineContent !== undefined) {
            terminal.printLine(`  > ${this.lineContent}`)
            if (this.lineNum !== undefined)
                terminal.printLine(`    on line #${this.lineNum}`)
        }
    }

}

class TuringInstruction {

    constructor(state, content, newContent, direction, newState) {
        this.state = state
        this.content = content
        this.newContent = newContent
        this.direction = direction
        this.newState = newState
    }

}

class TuringMachine {

    error(message, lineNum, lineContent) {
        this.errors.push(new TuringError(message, lineNum, lineContent))
    }

    parseCode(code) {
        const removeComments = code => code.split("\n")
            .map(line => line
                .trim()
                .split(";")[0]
                .split("//")[0]
            )
            .join("\n")

        code = removeComments(code)

        let lineNum = 0
        for (let line of code.split("\n")) {
            lineNum++

            if (line.length === 0) continue

            let parts = line.split(" ").map(p => p.trim()).filter(p => p.length > 0)
            if (parts.length !== 5) {
                this.error("Invalid Number of Instructions", lineNum, line)
                continue
            }

            let [
                state,
                content,
                newContent,
                direction,
                newState
            ] = parts

            this.states.add(state)
            this.states.add(newState)
            this.alphabet.add(content)
            this.alphabet.add(newContent)

            if (!direction.match(/^(left|right|l|r|L|R|\*)$/)) {
                this.error("Invalid Direction", lineNum, line)
                continue
            } else if (direction === "l" || direction === "L" || direction === "left") {
                direction = -1
            } else if (direction === "r" || direction === "R" || direction === "right") {
                direction = 1
            } else if (direction === "*") {
                direction = 0
            }

            if (!this.instructions[state]) this.instructions[state] = {}

            if (newContent == "*") newContent = content
            if (newState == "*") newState = state

            this.instructions[state.toString()][content.toString()] = new TuringInstruction(
                state, content, newContent, direction, newState
            )

        }

    }

    constructor(code, {
        startState="0",
        startTapeContent="",
        standardTapeContent="_",
        turbo=false,
        maxSteps=100000
    }={}) {
        this.turboMode = turbo
        this.standardTapeContent = standardTapeContent
        this.tape = Array.from(startTapeContent) || []
        this.state = startState
        this.tapeIndex = 0
        this.errors = []
        this.states = new Set()
        this.alphabet = new Set()
        this.instructions = {}
        this.actualTapeIndex = 0
        this.stepCount = 0
        this.maxSteps = maxSteps
        this.parseCode(code)
    }

    get tapeContent() {
        return this.tape[this.tapeIndex]
    }

    set tapeContent(content) {
        this.tape[this.tapeIndex] = content
    }

    moveTape(direction) {
        if (direction === 0) return
        this.tapeIndex += direction
        this.actualTapeIndex += direction
        if (this.tapeIndex < 0) {
            this.tape.unshift(this.standardTapeContent)
            this.tapeIndex = 0
        } else if (this.tapeIndex >= this.tape.length) {
            this.tape.push(this.standardTapeContent)
        }

        while (this.tape[0] === this.standardTapeContent
        && this.tapeIndex > 0) {
            this.tape.shift()
            this.tapeIndex--
        }

        while (this.tape[this.tape.length - 1] === this.standardTapeContent
        && this.tapeIndex < this.tape.length - 1) {
            this.tape.pop()
        }
    }

    firstDraw() {
        terminal.print("[")
        this.tapeOut = terminal.print("", undefined, {forceElement: true})
        terminal.printLine("]")
        terminal.print(" ")
        this.pointerOut = terminal.print("", undefined, {forceElement: true})
        terminal.printLine(" ")
        terminal.print("Current State: ")
        this.stateOut = terminal.print("", undefined, {forceElement: true})
        terminal.addLineBreak()
        terminal.print("Current Index: ")
        this.indexOut = terminal.print("", undefined, {forceElement: true})
        terminal.addLineBreak()
        this.draw(true)
    }

    draw(force) {
        if (this.turboMode && !force) return
        this.tapeOut.textContent = this.tape.join("")
        this.pointerOut.textContent = " ".repeat(this.tapeIndex) + "^"
        this.stateOut.textContent = this.state
        this.indexOut.textContent = this.actualTapeIndex
    }

    step() {
        this.stepCount++

        let possibleInstructions = this.instructions[this.state]
        if (!possibleInstructions) {
            return false
        }
        let instruction = possibleInstructions[this.tapeContent]
        if (!instruction) {
            instruction = possibleInstructions["*"]
        }
        if (!instruction) {
            return false
        }

        if (this.stepCount > this.maxSteps) {
            this.error("Max Steps Reached")
            return false
        }

        if (instruction.newContent !== "*")
            this.tapeContent = instruction.newContent
        this.state = instruction.newState
        this.moveTape(instruction.direction)

        return true
    }

}

terminal.addCommand("turing", async function(args) {

    const file = terminal.getFile(args.file)
    const machine = new TuringMachine(file.content, {
        startTapeContent: args.startTape,
        startState: args.startingState,
        turbo: args.turbo,
        maxSteps: args.maxSteps
    })
    if (machine.errors.length > 0) {
        machine.errors[0].print()
        return
    }

    terminal.machine = machine

    machine.firstDraw()
    for (let i = 0;; i++) {
        if (!args.turbo)
            await terminal.sleep(args.s)
        if (!machine.step()) {
            if (machine.errors.length > 0)
                machine.errors[0].print()
            break
        }
        machine.draw()
    }
    machine.draw(true)
}, {
    description: "run a turing machine file",
    args: {
        "file": "file to run",
        "?t=startTape": "starting tape content",
        "?s=sleep:i:0~10000": "sleep time between steps (in ms)",
        "?d=startingState": "starting state",
        "?m=maxSteps:i:0~10000000": "maximum number of steps to run",
        "?turbo:b": "run as fast as possible",
    },
    standardVals: {
        startTape: "",
        s: 100,
        d: "0",
        m: 100000,
    }
})