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
        const f = Array.from({length: 9}).map((v, i) => getField(i + 1)).map(f => f == " " ? "_" : f)
        const originalF = f.slice()

        function randomChoice(lst) {
            const index = Math.floor(Math.random() * lst.length)
            if (originalF[index] != "_") {
                return randomChoice(lst)
            }
            return lst[index]
        }

        function seite() {
            return randomChoice([2, 4, 6, 8])
        }

        function ecke() {
            return randomChoice([1, 3, 7, 9])
        }

        function zufall() {
            return getComputerInputRandom()
        }

        ueberpruefung = 0;
        if(f[4]=="_") {f[4]="O";} else {//3 in der Reihe für O:
        if(f[0]=="O"&&f[1]=="O"&&f[2]=="_") {f[2]="O";} else { //012
        if(f[1]=="O"&&f[2]=="O"&&f[0]=="_") {f[0]="O";} else {
        if(f[0]=="O"&&f[2]=="O"&&f[1]=="_") {f[1]="O";} else {
        if(f[3]=="O"&&f[4]=="O"&&f[5]=="_") {f[5]="O";} else { //345
        if(f[4]=="O"&&f[5]=="O"&&f[3]=="_") {f[3]="O";} else {
        if(f[5]=="O"&&f[3]=="O"&&f[4]=="_") {f[4]="O";} else {
        if(f[6]=="O"&&f[7]=="O"&&f[8]=="_") {f[8]="O";} else { //678
        if(f[7]=="O"&&f[8]=="O"&&f[6]=="_") {f[6]="O";} else {
        if(f[6]=="O"&&f[8]=="O"&&f[7]=="_") {f[7]="O";} else {
        if(f[0]=="O"&&f[3]=="O"&&f[6]=="_") {f[6]="O";} else { //036
        if(f[6]=="O"&&f[0]=="O"&&f[3]=="_") {f[3]="O";} else {
        if(f[6]=="O"&&f[3]=="O"&&f[0]=="_") {f[0]="O";} else {
        if(f[1]=="O"&&f[4]=="O"&&f[7]=="_") {f[7]="O";} else { //147
        if(f[4]=="O"&&f[7]=="O"&&f[1]=="_") {f[1]="O";} else {
        if(f[7]=="O"&&f[1]=="O"&&f[4]=="_") {f[4]="O";} else {
        if(f[8]=="O"&&f[5]=="O"&&f[2]=="_") {f[2]="O";} else { //258
        if(f[2]=="O"&&f[8]=="O"&&f[5]=="_") {f[5]="O";} else {
        if(f[2]=="O"&&f[5]=="O"&&f[8]=="_") {f[8]="O";} else {
        if(f[0]=="O"&&f[8]=="O"&&f[4]=="_") {f[4]="O";} else { //048
        if(f[4]=="O"&&f[8]=="O"&&f[0]=="_") {f[0]="O";} else {
        if(f[4]=="O"&&f[0]=="O"&&f[8]=="_") {f[8]="O";} else {
        if(f[4]=="O"&&f[2]=="O"&&f[6]=="_") {f[6]="O";} else { //246
        if(f[2]=="O"&&f[6]=="O"&&f[4]=="_") {f[4]="O";} else {
        if(f[6]=="O"&&f[4]=="O"&&f[2]=="_") {f[2]="O";} else {    //X aufhalten:
        if(f[0]=="X"&&f[1]=="X"&&f[2]=="_") {f[2]="O";} else { //012
        if(f[1]=="X"&&f[2]=="X"&&f[0]=="_") {f[0]="O";} else {
        if(f[0]=="X"&&f[2]=="X"&&f[1]=="_") {f[1]="O";} else {
        if(f[3]=="X"&&f[4]=="X"&&f[5]=="_") {f[5]="O";} else { //345
        if(f[4]=="X"&&f[5]=="X"&&f[3]=="_") {f[3]="O";} else {
        if(f[5]=="X"&&f[3]=="X"&&f[4]=="_") {f[4]="O";} else {
        if(f[6]=="X"&&f[7]=="X"&&f[8]=="_") {f[8]="O";} else { //678
        if(f[7]=="X"&&f[8]=="X"&&f[6]=="_") {f[6]="O";} else {
        if(f[6]=="X"&&f[8]=="X"&&f[7]=="_") {f[7]="O";} else {
        if(f[0]=="X"&&f[3]=="X"&&f[6]=="_") {f[6]="O";} else { //036
        if(f[6]=="X"&&f[0]=="X"&&f[3]=="_") {f[3]="O";} else {
        if(f[6]=="X"&&f[3]=="X"&&f[0]=="_") {f[0]="O";} else {
        if(f[1]=="X"&&f[4]=="X"&&f[7]=="_") {f[7]="O";} else { //147
        if(f[4]=="X"&&f[7]=="X"&&f[1]=="_") {f[1]="O";} else {
        if(f[7]=="X"&&f[1]=="X"&&f[4]=="_") {f[4]="O";} else {
        if(f[8]=="X"&&f[5]=="X"&&f[2]=="_") {f[2]="O";} else { //258
        if(f[2]=="X"&&f[8]=="X"&&f[5]=="_") {f[5]="O";} else {
        if(f[2]=="X"&&f[5]=="X"&&f[8]=="_") {f[8]="O";} else {
        if(f[0]=="X"&&f[8]=="X"&&f[4]=="_") {f[4]="O";} else { //048
        if(f[4]=="X"&&f[8]=="X"&&f[0]=="_") {f[0]="O";} else {
        if(f[4]=="X"&&f[0]=="X"&&f[8]=="_") {f[8]="O";} else {
        if(f[4]=="X"&&f[2]=="X"&&f[6]=="_") {f[6]="O";} else { //246
        if(f[2]=="X"&&f[6]=="X"&&f[4]=="_") {f[4]="O";} else {
        if(f[6]=="X"&&f[4]=="X"&&f[2]=="_") {f[2]="O";} else {    //Zwickmühlenverhinderung felder 0, 1 und 3 etc. (vorrausschauend):
        if(f[1]=="X"&&f[3]=="X"&&f[0]=="_"&&f[2]=="_"&&f[6]=="_") {f[0]="O";} else { //0
        if(f[1]=="X"&&f[6]=="X"&&f[0]=="_"&&f[2]=="_"&&f[3]=="_") {f[0]="O";} else {
        if(f[2]=="X"&&f[3]=="X"&&f[0]=="_"&&f[1]=="_"&&f[6]=="_") {f[0]="O";} else {
        if(f[1]=="X"&&f[5]=="X"&&f[2]=="_"&&f[0]=="_"&&f[8]=="_") {f[2]="O";} else { //2
        if(f[1]=="X"&&f[8]=="X"&&f[2]=="_"&&f[0]=="_"&&f[5]=="_") {f[2]="O";} else {
        if(f[0]=="X"&&f[5]=="X"&&f[2]=="_"&&f[8]=="_"&&f[1]=="_") {f[2]="O";} else {
        if(f[5]=="X"&&f[7]=="X"&&f[8]=="_"&&f[2]=="_"&&f[6]=="_") {f[8]="O";} else { //8
        if(f[2]=="X"&&f[7]=="X"&&f[8]=="_"&&f[6]=="_"&&f[5]=="_") {f[8]="O";} else {
        if(f[5]=="X"&&f[6]=="X"&&f[8]=="_"&&f[2]=="_"&&f[7]=="_") {f[8]="O";} else {
        if(f[3]=="X"&&f[7]=="X"&&f[6]=="_"&&f[0]=="_"&&f[8]=="_") {f[6]="O";} else { //6
        if(f[0]=="X"&&f[7]=="X"&&f[6]=="_"&&f[8]=="_"&&f[3]=="_") {f[6]="O";} else {
        if(f[3]=="X"&&f[8]=="X"&&f[6]=="_"&&f[0]=="_"&&f[7]=="_") {f[6]="O";} else {
        if(f[2]=="_"&&f[4]=="X"||f[6]=="_"&&f[4]=="X"||f[8]=="_"&&f[4]=="X"||f[0]=="_"&&f[4]=="X") {ecke(); ueberpruefung++;}
        if(f[4]!="_"&&ueberpruefung==0) {if(f[1]=="_"||f[5]=="_"||f[3]=="_"||f[7]=="_") {seite();}} else if(ueberpruefung==0) {zufall();}
        }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

        for (let i = 0; i < 9; i++) {
            if (originalF[i] != f[i]) {
                return i + 1
            }
        }

        return getComputerInputRandom()
    }

    const bots = {
        "impossible": getComputerInputNormal,
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
        d: "impossible"
    },
    isGame: true
})