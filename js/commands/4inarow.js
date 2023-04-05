terminal.addCommand("4inarow", async function(args) {
    await terminal.modules.import("game", window)

    const N = " ", X = "X", O = "O"
    let field = Array.from(Array(6)).map(() => Array(7).fill(N))

    let DEPTH = args.depth

    function printField(f=field) {
        const betweenRow = "+---+---+---+---+---+---+---+"
        terminal.printLine("+-1-+-2-+-3-+-4-+-5-+-6-+-7-+")
        for (let row of f) {
            terminal.print("| ")
            for (let item of row) {
                switch(item) {
                    case X: terminal.print(X, Color.YELLOW); break;
                    case O: terminal.print(O, Color.BLUE); break;
                    case N: terminal.print(" ")
                }
                terminal.print(" | ")
            }
            terminal.printLine("\n" + betweenRow)
        }
    }

    function putIntoField(n, val, f=field) {
        for (let i = 5; i >= 0; i--) {
            if (f[i][n] == N) {
                f[i][n] = val
                return true
            }
        }
        return false
    }

    function popUpper(n, f=field) {
        for (let i = 0; i < 6; i++) {
            if (f[i][n] != N) {
                f[i][n] = N
                return true
            }
        }
        return false
    }

    function rowFree(n, f=field) {
        for (let i = 0; i < 6; i++)
            if (f[i][n] == N) return true
        return false
    }

    function makeFieldMove(oldField, n, val) {
        let newField = JSON.parse(JSON.stringify(oldField))
        putIntoField(n, val, newField)
        return newField
    }

    async function getUserMove() {
        input = await terminal.promptNum("Your move [1-7]: ", {min: 1, max: 7}) - 1
        if (!rowFree(input)) {
            terminal.printLine("Field is not free.")
            return getUserMove()
        } else {
            return input
        }
    }

    function getWinner(f=field) {
        for (let player of [X, O]) {

            for (let i = 0; i < 7; i++) {
                let count = 0
                for (let j = 0; j < 6; j++) {
                    if (f[j][i] == player) count++
                    else count = 0

                    if (count == 4)
                        return player
                }
            }

            for (let i = 0; i < 6; i++) {
                let count = 0
                for (let j = 0; j < 7; j++) {
                    if (f[i][j] == player) count++
                    else count = 0

                    if (count == 4)
                        return player
                }
            }

            for (let i = -2; i < 4; i++) {
                let j = i
                let count = 0
                for (let k = 0; k < 6; k++) {
                    if (j < 0 || j > 6) {
                        j++
                        continue
                    }

                    if (f[k][j] == player) count++
                    else count = 0

                    if (count == 4)
                        return player
                    j++
                }
            }

            for (let i = 8; i >= 3; i--) {
                let j = i
                let count = 0
                for (let k = 0; k < 6; k++) {
                    if (j < 0 || j > 6) {
                        j++
                        continue
                    }

                    if (f[k][j] == player) count++
                    else count = 0

                    if (count == 4)
                        return player
                    j--
                }
            }

        }

        return null
    }

    function isDraw(f=field) {
        for (let i = 0; i < 7; i++) { 
            for (let j = 0; j < 6; j++) {
                if (f[j][i] == N) return false
            }
        }
        return true
    }
    
    const possibleWins = [
        // HORIZONTAL
        [[0, 0], [0, 1], [0, 2], [0, 3]],
        [[0, 1], [0, 2], [0, 3], [0, 4]],
        [[0, 2], [0, 3], [0, 4], [0, 5]],
        [[0, 3], [0, 4], [0, 5], [0, 6]],
        [[1, 0], [1, 1], [1, 2], [1, 3]],
        [[1, 1], [1, 2], [1, 3], [1, 4]],
        [[1, 2], [1, 3], [1, 4], [1, 5]],
        [[1, 3], [1, 4], [1, 5], [1, 6]],
        [[2, 0], [2, 1], [2, 2], [2, 3]],
        [[2, 1], [2, 2], [2, 3], [2, 4]],
        [[2, 2], [2, 3], [2, 4], [2, 5]],
        [[2, 3], [2, 4], [2, 5], [2, 6]],
        [[3, 0], [3, 1], [3, 2], [3, 3]],
        [[3, 1], [3, 2], [3, 3], [3, 4]],
        [[3, 2], [3, 3], [3, 4], [3, 5]],
        [[3, 3], [3, 4], [3, 5], [3, 6]],
        [[4, 0], [4, 1], [4, 2], [4, 3]],
        [[4, 1], [4, 2], [4, 3], [4, 4]],
        [[4, 2], [4, 3], [4, 4], [4, 5]],
        [[4, 3], [4, 4], [4, 5], [4, 6]],
        [[5, 0], [5, 1], [5, 2], [5, 3]],
        [[5, 1], [5, 2], [5, 3], [5, 4]],
        [[5, 2], [5, 3], [5, 4], [5, 5]],
        [[5, 3], [5, 4], [5, 5], [5, 6]],

        // VERTICAL
        [[0, 0], [1, 0], [2, 0], [3, 0]],
        [[1, 0], [2, 0], [3, 0], [4, 0]],
        [[2, 0], [3, 0], [4, 0], [5, 0]],
        [[0, 1], [1, 1], [2, 1], [3, 1]],
        [[1, 1], [2, 1], [3, 1], [4, 1]],
        [[2, 1], [3, 1], [4, 1], [5, 1]],
        [[0, 2], [1, 2], [2, 2], [3, 2]],
        [[1, 2], [2, 2], [3, 2], [4, 2]],
        [[2, 2], [3, 2], [4, 2], [5, 2]],
        [[0, 3], [1, 3], [2, 3], [3, 3]],
        [[1, 3], [2, 3], [3, 3], [4, 3]],
        [[2, 3], [3, 3], [4, 3], [5, 3]],
        [[0, 4], [1, 4], [2, 4], [3, 4]],
        [[1, 4], [2, 4], [3, 4], [4, 4]],
        [[2, 4], [3, 4], [4, 4], [5, 4]],
        [[0, 5], [1, 5], [2, 5], [3, 5]],
        [[1, 5], [2, 5], [3, 5], [4, 5]],
        [[2, 5], [3, 5], [4, 5], [5, 5]],
        [[0, 6], [1, 6], [2, 6], [3, 6]],
        [[1, 6], [2, 6], [3, 6], [4, 6]],
        [[2, 6], [3, 6], [4, 6], [5, 6]],

        // DIAGONAL
        [[2, 0], [3, 1], [4, 2], [5, 3]],
        [[1, 0], [2, 1], [3, 2], [4, 3]],
        [[0, 0], [1, 1], [2, 2], [3, 3]],
        [[2, 1], [3, 2], [4, 3], [5, 4]],
        [[1, 1], [2, 2], [3, 3], [4, 4]],
        [[0, 1], [1, 2], [2, 3], [3, 4]],
        [[2, 2], [3, 3], [4, 4], [5, 5]],
        [[1, 2], [2, 3], [3, 4], [4, 5]],
        [[0, 2], [1, 3], [2, 4], [3, 5]],
        [[2, 3], [3, 4], [4, 5], [5, 6]],
        [[1, 3], [2, 4], [3, 5], [4, 6]],
        [[0, 3], [1, 4], [2, 5], [3, 6]],

        [[2, 3], [3, 2], [4, 1], [5, 0]],
        [[1, 3], [2, 2], [3, 1], [4, 0]],
        [[0, 3], [1, 2], [2, 1], [3, 0]],
        [[2, 4], [3, 3], [4, 2], [5, 1]],
        [[1, 4], [2, 3], [3, 2], [4, 1]],
        [[0, 4], [1, 3], [2, 2], [3, 1]],
        [[2, 5], [3, 4], [4, 3], [5, 2]],
        [[1, 5], [2, 4], [3, 3], [4, 2]],
        [[0, 5], [1, 4], [2, 3], [3, 2]],
        [[2, 6], [3, 5], [4, 4], [5, 3]],
        [[1, 6], [2, 5], [3, 4], [4, 3]],
        [[0, 6], [1, 5], [2, 4], [3, 3]],
    ]

    function evaluateField(f=field) {
        let score = 0

        for (let player of [X, O]) {
            let factor = (player == X) ? 1 : -1
            for (let possibleWin of possibleWins) {
                let count = 0
                for (let pos of possibleWin) {
                    if (f[pos[0]][pos[1]] == player) {
                        count++
                    }
                }
                if (count == 4 && player == X) {
                    score += 1000000
                } else if (count == 4 && player == O) {
                    score -= 1000100
                } else if (count == 3) {
                    score += 10 * factor
                } else if (count == 2) {
                    score += 0.1 * factor
                }
            }
        }

        return score
    }

    class Board {

        constructor(field) {
            this.field = field
            this.movingColor = O
            this.lastMoves = []
            this.prevMoveOrder = [3, 4, 2, 5, 0, 6, 1]
        }

        get lastMove() {
            return this.lastMoves[this.lastMoves.length - 1]
        }

        swapColor() {
            this.movingColor = (this.movingColor == X) ? O : X
        }

        makeMove(move) {
            putIntoField(move, this.movingColor, this.field)
            this.swapColor()
            this.lastMoves.push(move)
        }

        unmakeMove(move) {
            popUpper(move, this.field)
            this.swapColor()
            this.lastMoves.pop()
        }

        evaluate() {
            let evaluation = evaluateField(this.field)
            if (this.movingColor == O) evaluation *= -1
            return evaluation
        }

        getBestMove(depth, alpha=-Infinity, beta=Infinity) {
            totalEvaluations++
            let evaluation = this.evaluate()
            if (depth == 0 || Math.abs(evaluation) > 10000) {
                return {
                    move: null,
                    score: evaluation
                }
            }

            let moves = this.prevMoveOrder.filter(m => rowFree(m, this.field))
            let moveEval = Array.from(Array(7), () => -10000000)
            let bestMove = null
            for (let move of moves) {
                this.makeMove(move)
                let score = -this.getBestMove(depth - 1, -beta, -alpha).score
                moveEval[move] = score
                this.unmakeMove(move)
                if (score >= beta) {
                    return {
                        move: null,
                        score: beta
                    }
                }
                if (score > alpha) {
                    alpha = score
                    bestMove = move
                }
            }

            if (DEPTH == depth) {
                this.prevMoveOrder.sort(function(a, b) {
                    return moveEval[a] - moveEval[b]
                })
            }

            return {
                move: bestMove,
                score: alpha
            }
        }

    }

    let totalEvaluations = 0

    while (!isDraw() && !getWinner()) {
        printField()
        let userMove = await getUserMove()
        putIntoField(userMove, X)
        if (isDraw() || getWinner())
            break
        totalEvaluations = 0
        let evaluation = new Board(field).getBestMove(DEPTH)
        let computerMove = evaluation.move
        let moveScore = ~~evaluation.score
        terminal.printLine(`(depth=${DEPTH}, eval=${moveScore})`)
        if (totalEvaluations < 1000)
            DEPTH += 4
        else if (totalEvaluations < 10000)
            DEPTH++
        if (computerMove == null) {
            terminal.printLine("The computer resigns. You win!")
            terminal.printEasterEgg("4inarow-Master-Egg")
            return
        }
        putIntoField(computerMove, O)
    }

    let winner = getWinner()
    printField()
    if (winner) {
        terminal.printLine(`The winner is ${winner}`)
        if (winner == X)
            terminal.printEasterEgg("4inarow-Master-Egg")
    } else {
        terminal.printLine("It's a draw!")
    }
}, {
    description: "play a game of Connect Four against the computer",
    args: {
        "?depth:i:1~100": "The depth of the search tree",
    },
    standardVals: {
        depth: 4
    },
    isGame: true
})