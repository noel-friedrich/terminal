terminal.addCommand("mill2player", async function() {

    //     #-----------#-----------#
    //     |           |
    //     |   #-------#-------#
    //     |   |       |      
    //     |   |   #---#---#
    //     |   |   |       |
    //     #---#---#       #
    //     |   |   |       |
    //     |   |   #---#---#

    const N = "#", X = "X", O = "O"
    let fields = Array.from(Array(3)).map(() => Array.from(Array(8)).map(() => N))

    let PHASE = 1

    function nextPhase() {
        PHASE++
        terminal.printLine("the game enters the next phase.")
        if (PHASE == 2) {
            terminal.printLine("now you may move your points.")
        } else if (PHASE == 3) {
            terminal.printLine("a player has only 3 stones left: they may jump anywhere now!")
        }
    }

    const lookup = [
        [0, 0], [0, 1], [0, 2], [1, 0],
        [1, 1], [1, 2], [2, 0], [2, 1],
        [2, 2], [0, 7], [1, 7], [2, 7],
        [2, 3], [1, 3], [0, 3], [2, 6],
        [2, 5], [2, 4], [1, 6], [1, 5],
        [1, 4], [0, 6], [0, 5], [0, 4]
    ]

    function getField(n) {
        let [i, j] = lookup[n]
        return fields[i][j]
    }

    function doubleToSingle(a, b) {
        for (let i = 0; i < lookup.length; i++) {
            let look = lookup[i]
            if (look[0] == a && look[1] == b)
                return i
        }
        return -1
    }

    function printField() {
        let lines = "\n"
        lines += "#-----------#-----------#\n"
        lines += "|           |           |\n"
        lines += "|   #-------#-------#   |\n"
        lines += "|   |       |       |   |\n"
        lines += "|   |   #---#---#   |   |\n"
        lines += "|   |   |       |   |   |\n"
        lines += "#---#---#       #---#---#\n"
        lines += "|   |   |       |   |   |\n"
        lines += "|   |   #---#---#   |   |\n"
        lines += "|   |       |       |   |\n"
        lines += "|   #-------#-------#   |\n"
        lines += "|           |           |\n"
        lines += "#-----------#-----------#\n"

        let i = 0
        for (let char of lines) {
            if (char == "#") {
                let val = getField(i)
                if (val == X) terminal.print(X, Color.YELLOW)
                if (val == O) terminal.print(O, Color.BLUE)
                if (val == N) terminal.print(N, Color.rgb(100, 100, 100))
                i++
            } else {
                terminal.print(char)
            }
        }
    }

    function setField(n, val) {
        let [i, j] = lookup[n]
        fields[i][j] = val
    }

    let playerMills = {[X]: [], [O]: []}

    const possibleWins = [
        [[0, 0], [0, 1], [0, 2]],
        [[0, 2], [0, 3], [0, 4]],
        [[0, 4], [0, 5], [0, 6]],
        [[0, 6], [0, 7], [0, 0]],
        [[1, 0], [1, 1], [1, 2]],
        [[1, 2], [1, 3], [1, 4]],
        [[1, 4], [1, 5], [1, 6]],
        [[1, 6], [1, 7], [1, 0]],
        [[2, 0], [2, 1], [2, 2]],
        [[2, 2], [2, 3], [2, 4]],
        [[2, 4], [2, 5], [2, 6]],
        [[2, 6], [2, 7], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 3], [1, 3], [2, 3]],
        [[0, 5], [1, 5], [2, 5]],
        [[0, 7], [1, 7], [2, 7]],
    ]

    function getMills(player) {
        let mills = []
        for (let possibleWin of possibleWins) {
            let count = 0
            for (let i = 0; i < 3; i++) {
                let [j, k] = possibleWin[i]
                if (fields[j][k] == player)
                    count++
            }
            if (count == 3) {
                mills.push(possibleWin)
            }
        }
        return mills
    }

    function possibleMoves(pos) {
        let poses = []
        for (let possibleWin of possibleWins) {
            for (let i = 0; i < 3; i++) {
                let tempPos = doubleToSingle(possibleWin[i][0], possibleWin[i][1])
                if (tempPos == pos) {
                    if (i == 0)
                        poses = poses.concat([
                            doubleToSingle(possibleWin[0][0], possibleWin[0][1]),
                            doubleToSingle(possibleWin[1][0], possibleWin[1][1])
                        ])
                    if (i == 1) 
                        poses = poses.concat([
                            doubleToSingle(possibleWin[0][0], possibleWin[0][1]),
                            doubleToSingle(possibleWin[1][0], possibleWin[1][1]),
                            doubleToSingle(possibleWin[2][0], possibleWin[2][1])
                        ])
                    if (i == 2)
                        poses = poses.concat([
                            doubleToSingle(possibleWin[1][0], possibleWin[1][1]),
                            doubleToSingle(possibleWin[2][0], possibleWin[2][1])
                        ])
                }
            }
        }
        return poses
    }

    function oppositePlayer(player) {
        return (player == X) ? O : X
    }

    function countStones(player) {
        let count = 0
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 8; j++) {
                if (fields[i][j] == player)
                    count++
            }
        }
        return count
    }

    function stoneInMill(stone) {
        let allMills = getMills(X).concat(getMills(O))
            .map(m => m.map(e => doubleToSingle(e[0], e[1]))).flat()
        return allMills.includes(stone)
    }

    async function checkMillSituation(player) {
        let numMills = getMills(player).length
        if (numMills > playerMills[player]) {
            printField()
            let a = await terminal.promptNum(`${player} take one [1-24]: `, {min: 1, max: 24}) - 1
            while (getField(a) != oppositePlayer(player) || stoneInMill(a)) {
                terminal.printLine("field must be of opposite player and not in mill!")
                a = await terminal.promptNum(`${player} take one [1-24]: `, {min: 1, max: 24}) - 1
            }
            setField(a, N)
        }
        playerMills[player] = numMills
    }

    async function playerInput(player, phase=PHASE) {
        if (phase == 1) {
            let a = await terminal.promptNum(`${player} set [1-24]: `, {min: 1, max: 24}) - 1
            if (getField(a) != N) {
                terminal.printLine("field must be free!")
                return await playerInput(player)
            }
            setField(a, player)
            await checkMillSituation(player)
        } else if (countStones(player) <= 3) {
            let a = await terminal.promptNum(`${player} move from [1-24]: `, {min: 1, max: 24}) - 1
            let b = await terminal.promptNum(`${player} move to [1-24]: `, {min: 1, max: 24}) - 1
            if (getField(b) != N || getField(a) != player) {
                terminal.printLine("Invalid move!")
                return await playerInput(player)
            }
            let temp = getField(a)
            setField(a, N)
            playerMills[player] = getMills(player).length
            setField(b, temp)
            await checkMillSituation(player)
        } else if (phase > 1) {
            let a = await terminal.promptNum(`${player} move from [1-24]: `, {min: 1, max: 24}) - 1
            let moves = possibleMoves(a)
            if (moves.length == 1) {
                var b = moves[0]
            } else {
                var b = await terminal.promptNum(`${player} move to [1-24]: `, {min: 1, max: 24}) - 1
            }
            if (getField(b) != N || getField(a) != player || !moves.includes(b)) {
                terminal.printLine("Invalid move!")
                return await playerInput(player)
            }
            let temp = getField(a)
            setField(a, N)
            playerMills[player] = getMills(player).length
            setField(b, temp)
            await checkMillSituation(player)
        }
    }

    let playerDecks = {[X]: 9, [O]: 9}

    while (playerDecks[O] > 0) {
        for (let player of [X, O]) {
            printField()
            await playerInput(player)
            playerDecks[player]--
        }
    }

    nextPhase()

    while (countStones(X) >= 3 && countStones(O) >= 3) {
        for (let player of [X, O]) {
            printField()
            await playerInput(player)
        }
    }

    let winner = (countStones(X) > countStones(O)) ? X : O
    terminal.printLine(`the winner is: ${winner}`)

}, {
    description: "play a game of mill with a friend locally",
    isGame: true
})