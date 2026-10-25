terminal.addCommand("sylver-coinage", async function (args) {
    const numbersSaid = []
    const remainingNumbers = new Set()

    terminal.printLine(`Play the sylver coinage game. You can only name integers 1-${args.n} that are not`)
    terminal.printLine("a linear combination of previous numbers (i.e. if 2 and 3, then only 1 remains).")
    terminal.printLine("First player to say 1 loses. Grid shows available numbers. Good luck!\n")

    for (let i = 0; i < args.n; i++) {
        remainingNumbers.add(i + 1)
    }

    // hi mr chatgpt helped with this
    function removeAllCombinations() {
        // reachable[x] === 1 iff x can be written as
        // a nonnegative integer combination of numbersSaid
        const reachable = new Uint8Array(args.n + 1)
    
        // Empty combination = 0.
        // This lets each spoken number generate itself.
        reachable[0] = 1
    
        for (const num of numbersSaid) {
            // Ascending order is important:
            // it lets us use `num` arbitrarily many times.
            for (let sum = num; sum <= args.n; sum++) {
                if (reachable[sum - num]) {
                    reachable[sum] = 1
                }
            }
        }
    
        // Modify the existing Set in-place
        for (let num = 1; num <= args.n; num++) {
            if (reachable[num]) {
                remainingNumbers.delete(num)
            }
        }
    }

    const maxNumberWidth = Math.ceil(Math.log10(args.n)) + 1

    const numOutputMap = {}
    for (let i = 0; i < args.n; i++) {
        const elem = terminal.print(`${i + 1}`.padStart(maxNumberWidth, "0"), undefined, { forceElement: true })
        terminal.print(" ")
        numOutputMap[i + 1] = elem
        if ((i + 1) % 20 == 0) {
            terminal.addLineBreak()
        }
    }

    function updateNumElements() {
        for (let i = 0; i < args.n; i++) {
            const elem = numOutputMap[i + 1]
            if (remainingNumbers.has(i + 1)) {
                elem.style.textDecoration = ""
                elem.style.backgroundColor = ""
            } else {
                elem.style.textDecoration = "line-through"
                elem.style.backgroundColor = "red"
            }
        }
    }

    let roundIndex = 0

    terminal.addLineBreak()

    while (!numbersSaid.includes(1)) {
        updateNumElements()
        const newNum = await terminal.promptNum(`Player ${roundIndex % 2 == 0 ? 'A' : 'B'}: `)    
    
        if (!remainingNumbers.has(newNum)) {
            terminal.printError(`${newNum} is not a legal move!`)
            continue
        }

        roundIndex++

        numbersSaid.push(newNum)
        removeAllCombinations()
    }
}, {
    description: "play the conway two-player sylver-coin game",
    args: {
        "?n=max-num:i:10~9999": "maximum number allowed to input"
    },
    defaultValues: {
        "max-num": 100
    },
    category: "games"
})