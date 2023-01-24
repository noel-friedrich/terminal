terminal.addCommand("tictactoe", async function(args) {
    await terminal.modules.import("game", window)

    const N = " "
    const X = "X"
    const O = "O"

    let field = [[N, N, N], [N, N, N], [N, N, N]]

    function setField(n, val) {
        let row = (n + 2) % 3
        let index = Math.floor((n -0.1) / 3)
        field[index][row] = val
    }

    function getField(n) {
        let row = (n + 2) % 3
        let index = Math.floor((n - 0.1) / 3)
        return field[index][row]
    }

    function printField() {
        terminal.printLine(` ${getField(1)} | ${getField(2)} | ${getField(3)} `)
        terminal.printLine(`---+---+---`)
        terminal.printLine(` ${getField(4)} | ${getField(5)} | ${getField(6)} `)
        terminal.printLine(`---+---+---`)
        terminal.printLine(` ${getField(7)} | ${getField(8)} | ${getField(9)} `)
    }

    async function getUserInput() {
        input = await terminal.promptNum("Your move [1-9]: ", {min: 1, max: 9})
        if (getField(input) != N) {
            terminal.printLine("Field is not free.")
            return getUserInput()
        } else {
            return input
        }
    }

    function isWon() {
        function any(l) {
            for (let e of l)
                if (e)
                    return true
            return false
        }
        const possibleWins = [
            [1, 2, 3], [4, 5, 6], [7, 8, 9],
            [1, 4, 7], [2, 5, 8], [3, 6, 9],
            [1, 5, 9], [3, 5, 7]
        ]
        for (let winner of [X, O]) {
            for (let winConfig of possibleWins) {
                let winConfigTrue = true
                for (let condition of winConfig) {
                    if (getField(condition) != winner)
                        winConfigTrue = false
                }
                if (winConfigTrue) {
                    return winner
                }
            }
        }
        return false
    }

    function isDraw() {
        for (let i = 0; i < 9; i++)
            if (getField(i + 1) == N)
                return false
        return true
    }

    function getComputerInputRandom() {
        let a = Math.floor(Math.random() * 9) + 1
        while (getField(a) != 0)
            a = Math.floor(Math.random() * 9) + 1
        return a
    }

    function getComputerInputNormal() {
        const possibleWins = [
            [1, 2, 3], [4, 5, 6], [7, 8, 9],
            [1, 4, 7], [2, 5, 8], [3, 6, 9],
            [1, 5, 9], [3, 5, 7]
        ]

        for (let player of [X, O]) {
            for (let possibleWin of possibleWins) {
                let count = 0
                for (let num of possibleWin) {
                    if (getField(num) == player)
                        count++
                }
                if (count == 2) {
                    for (let num of possibleWin) {
                        if (getField(num) == N)
                            return num
                    }
                }
            } 
        }

        return getComputerInputRandom()
    }

    const bots = {
        "normal": getComputerInputNormal,
        "easy": getComputerInputRandom
    }

    let getComputerInput = bots[args.d]

    if (getComputerInput == undefined) {
        terminal.printError(`Unknown difficulty: ${args.d}`)
        terminal.printLine("Available difficulties:")
        for (let difficulty of Object.keys(bots)) {
            terminal.print("- ")
            terminal.printCommand(difficulty, `tictactoe ${difficulty}`)
        }
        return
    }

    if (Math.random() < 0.5) {
        setField(getComputerInput(), O)
    }

    while (!isWon() && !isDraw()) {
        printField()
        setField(await getUserInput(), X)
        if (isWon() || isDraw())
            break
        setField(getComputerInput(), O)
        terminal.addLineBreak()
    }

    let winner = isWon()
    terminal.printLine("the game has ended...")
    await sleep(2000)
    printField()
    if (winner) {
        terminal.printLine(`${winner} has won!`)
    } else {
        terminal.printLine("It's a draw!")
    }

}, {
    description: "play a game of tic tac toe against the computer.",
    args: {
        "?d=difficulty": "play against an unbeatable computer."
    },
    standardVals: {
        d: "normal"
    },
    isGame: true
})