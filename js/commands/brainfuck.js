terminal.addCommand("brainfuck", function(args) {
    const codeLib = {
        "test": "++++[>++++<-]>[>++++<-]",
        "helloworld": "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.",
    }

    class BrainFuckInterpreter {

        constructor(outFunc, inFunc) {
            this.outFunc = outFunc
            this.inFunc = inFunc
            this.instructionLimit = 1000000
        }

        interpret(code) {
            let memory = [0]
            let currPtr = 0
            let instructionCount = 0
            const val = () => memory[currPtr]
            let bracketsStack = Array()
            const syntaxFuncs = {
                "+": function() {
                    memory[currPtr]++
                    if (val() > 127)
                        memory[currPtr] = -128
                },
                "-": function() {
                    memory[currPtr]--
                    if (val() < -128)
                        memory[currPtr] = 127
                },
                ".": function() {
                    let char = String.fromCharCode(val())
                    if (char == "\n") {
                        terminal.addLineBreak()
                        return
                    }
                    this.outFunc(String.fromCharCode(val()))
                }.bind(this),
                ">": function() {
                    currPtr++
                    if (memory.length - 1 < currPtr) memory.push(0)
                },
                "<": () => currPtr = Math.max(0, currPtr - 1),
                "[": function(i, setI, jumpToLoopEnd) {
                    if (val() == 0) {
                        jumpToLoopEnd()
                    } else {
                        bracketsStack.push(i)
                    }
                },
                "]": function(i, setI) {
                    if (val() == 0) {
                        bracketsStack.pop()
                    } else {
                        setI(bracketsStack[bracketsStack.length - 1])
                    }
                }
            }
            
            for (let i = 0; i < code.length; i++) {
                let char = code[i]
                if (!Object.keys(syntaxFuncs).includes(char))
                    continue
                syntaxFuncs[char](i, newI => i = newI, function() {
                    let c = 1
                    while (c > 0 && i < code.length) {
                        if (code[i] == "[")
                            c++
                        if (code[i] == "]")
                            c--
                        i++
                    }
                })
                instructionCount++
                if (instructionCount > this.instructionLimit) {
                    this.outFunc(`Reached instruction-limit of ${this.instructionLimit}! Aborting...`)
                    break
                }
            }

            return memory
        }

    }

    let outputtedSomething = false

    let interpreter = new BrainFuckInterpreter(
        function(msg) {
            terminal.print(msg, Color.rgb(38, 255, 38))
            outputtedSomething = true
        }
    )

    let code = args.code
    if (Object.keys(codeLib).includes(code.toLowerCase())) {
        code = codeLib[code.toLowerCase()]
    }

    terminal.printLine("")
    let memoryResult = interpreter.interpret(code)

    function printMemory(memory) {
        let indexWidth = String(memory.length - 1).length
        let valueWidth = Math.max(String(Math.min(...memory)).length, String(Math.max(...memory)).length)
        let lineSep = `+-${stringMul("-", indexWidth)}-+-${stringMul("-", valueWidth)}-+`
        terminal.printLine(lineSep)
        for (let i = 0; i < memory.length; i++) {
            let indexStr = stringPad(String(i), indexWidth)
            let valueStr = stringPad(String(memory[i]), valueWidth)
            terminal.print("| ")
            terminal.print(indexStr, Color.COLOR_1)
            terminal.print(" | ")
            terminal.print(valueStr, Color.WHITE)
            terminal.printLine(" |")
            terminal.printLine(lineSep)
        }
    }

    if (outputtedSomething) {
        terminal.printLine("")
        terminal.printLine("")
    } else {
        terminal.printLine("Memory:")
    }
    printMemory(memoryResult)
}, {
    description: "parse given brainfuck code",
    args: ["*code"]
})