// ------------------- 2048.js --------------------
terminal.addCommand("2048", async function(args) {
    await terminal.modules.import("game", window)

    let cells = [
       [0, 0, 0, 0],
       [0, 0, 0, 0],
       [0, 0, 0, 0],
       [0, 0, 0, 0]
   ]

   function addRandomCell(tries=0) {
       let x = Math.floor(Math.random() * 4)
       let y = Math.floor(Math.random() * 4)
       if (cells[y][x] == 0) {
           cells[y][x] = 2
       } else if (tries < 1000) {
           // probability of missing in 1000 tries is ~ 9 * 10^(-29)
           // and thus negligible
           addRandomCell(tries + 1)
       } else {
           gameRunning = false
       }
   }

   addRandomCell()
   addRandomCell()

   const cellColors = {
       2: "#6198f3",
       4: "lightgreen",
       8: "yellow",
       16: "orange",
       32: "red",
       64: "purple",
       128: "#f18585",
       256: "cyan",
       512: "lime",
       1024: "magenta",
       2048: "teal"
   }

   let elements = []
   function makeElements() {
       terminal.printLine("  +--------+--------+--------+--------+")
       for (let y = 0; y < 4; y++) {
           terminal.printLine("  |        |        |        |        |")

           let line = []
           for (let x = 0; x < 4; x++) {
               terminal.print("  |  ")
               line.push(terminal.print("    ", undefined, {forceElement: true}))
           }
           elements.push(line)

           terminal.printLine("  |")
           terminal.printLine("  |        |        |        |        |")
           terminal.printLine("  +--------+--------+--------+--------+")
       }
   }
   makeElements()

   function draw() {
       for (let y = 0; y < 4; y++) {
           for (let x = 0; x < 4; x++) {
               let cell = cells[y][x]
               if (cell == 0) {
                   elements[y][x].textContent = "    "
               } else {
                   let text = stringPad(cell, 4)
                   elements[y][x].textContent = text
               }
               elements[y][x].style.color = cellColors[cell] || "white"
           }
       }
       scoreElement.textContent = score
   }

   function cellsCopy() {
       let copy = []
       for (let y = 0; y < 4; y++) {
           let line = []
           for (let x = 0; x < 4; x++) {
               line.push(cells[y][x])
           }
           copy.push(line)
       }
       return copy
    }

    let score = 0

    function shift(d, tempCells) {
        let movedCount = 0
        let countScore = tempCells == undefined
        tempCells ??= cells
        for (let i = 0; i < 4; i++) {
            for (let x = 0; x < 4; x++) {
                for (let y = 0; y < 4; y++) {
                    let newX = x + d[0]
                    let newY = y + d[1]
                    if (Math.max(newX, newY) > 3 || Math.min(newX, newY) < 0)
                        continue
                    if (tempCells[newY][newX] == 0) {
                        tempCells[newY][newX] = tempCells[y][x]
                        tempCells[y][x] = 0
                        movedCount++
                    }
                    if (tempCells[newY][newX] == tempCells[y][x]) {
                        tempCells[newY][newX] *= 2
                        tempCells[y][x] = 0
                        movedCount++
                        if (countScore)
                            score += tempCells[newY][newX]
                    }
                }
            }
        }
        return movedCount
    }

    function checkPossible() {
        let movedCount = 0
        movedCount += shift([1, 0], cellsCopy())
        movedCount += shift([-1, 0], cellsCopy())
        movedCount += shift([0, 1], cellsCopy())
        movedCount += shift([0, -1], cellsCopy())
        return movedCount > 0
    }

    function checkWin() {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (cells[y][x] == 2048) {
                    return true
                }
            }
        }
        return false
    }

    let gameRunning = true

    function keydown(event) {

        if (event.repeat) return
        if (gameRunning == false) return
        let combinedCount = 0
        if (event.key == "ArrowUp") {
            combinedCount += shift([0, -1])
            event.preventDefault()
        } else if (event.key == "ArrowDown") {
            combinedCount += shift([0, 1])
            event.preventDefault()
        } else if (event.key == "ArrowLeft") {
            combinedCount += shift([-1, 0])
            event.preventDefault()
        } else if (event.key == "ArrowRight") {
            combinedCount += shift([1, 0])
            event.preventDefault()
        } else if (event.key == "c" && event.ctrlKey) {
            gameRunning = false
            removeEventListener("keydown", listener)
            return
        }
        if (combinedCount > 0) {
            addRandomCell()
        }
        draw()
        if (checkWin())
            gameRunning = false
    }

    let listener = addEventListener("keydown", keydown)

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout(
            terminal.mobileKeyboard.Layout.ARROWS
        )
        terminal.mobileKeyboard.oninput = keydown
    }

    terminal.scroll()
    terminal.printLine("  Use the arrow keys to move the tiles.")
    terminal.print("  Your Score: ")
    let scoreElement = terminal.print("0", Color.COLOR_2)
    terminal.addLineBreak()

    while (gameRunning) {
        await sleep(100)
        if (!checkPossible()) {
            gameRunning = false
        }
    }

    removeEventListener("keydown", listener)

    if (checkWin() == false)
        terminal.printLine(`  You lost!`, Color.COLOR_1)
    else
        terminal.printLine(`  You won!`, Color.COLOR_1)

    await HighscoreApi.registerProcess("2048")
    await HighscoreApi.uploadScore(score)
}, {
   description: "play a game of 2048",
   isGame: true
})
// ------------------- 4inarow.js --------------------
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
// ------------------- alias.js --------------------
terminal.addCommand("alias", function(args) {
    let actionCount = 0

    if (args.remove) {
        if (Object.keys(terminal.data.aliases).includes(args.remove)) {
            terminal.data.removeAlias(args.remove)
            terminal.printSuccess(`Removed alias "${args.remove}"`)
            actionCount++
        } else {
            throw new Error(`Alias "${args.remove}" not found`)
        }
    }

    if (args.show) {
        let longestAliasLength = Object.keys(terminal.data.aliases).reduce((p, c) => c.length > p ? c.length : p, 0)
        for (let [alias, command] of Object.entries(terminal.data.aliases)) {
            terminal.print(alias.padEnd(longestAliasLength + 2), Color.COLOR_1)
            terminal.printLine(command)
        }
        actionCount++
    }

    if (args.alias && args.command) {
        const alias = args.alias, command = args.command

        if (terminal.functions.map(f => f.name.toLowerCase()).includes(alias.toLowerCase())) {
            throw new Error("Command/Alias already exists!")
        }
        if (!String(alias).match(/^[a-zA-Z][-\_0-9a-zA-Z]*$/) || alias.length > 20) {
            throw new Error("Invalid alias!")
        }

        addAlias(alias, command)
        actionCount++

    } else if (args.alias || args.command) {
        terminal.print("Example: ")
        terminal.printCommand("alias hello hi")
        throw new Error("Must both provide alias and new command")
    }

    if (actionCount == 0) {
        TerminalParser.parseArgs(["--help"], this)
    }
}, {
    description: "create a new alias for a given function",
    args: {
        "?alias:s": "name of the new alias",
        "?*command:s": "name of the command to be aliased",
        "?s=show:b": "show all aliases",
        "?r=remove:s": "remove a given alias"
    }
})


// ------------------- ant-opt.js --------------------
terminal.addCommand("ant-opt", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../path-finder/",
        name: "Interactive Ant Colony Optimization",
        fullscreen: args.fullscreen
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "interactive solution to the travelling salesman problem using ant colony optimization",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- asteroids.js --------------------
terminal.addCommand("asteroids", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Asteroids", fullscreen: args.fullscreen
    })

    const maxNumParticles = 1000

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const canvasSize = () => new Vector2d(canvas.width, canvas.height)

    let gameRunning = true

    terminal.onInterrupt(() => {
        gameRunning = false
        terminalWindow.close()
    })

    function randomPolygon() {
        let corners = Math.floor(Math.random() * 10) + 5
        let points = []
        for (let i = 0; i < corners; i++) {
            let angle = i / corners * Math.PI * 2
            let length = Math.random() * 0.5 + 0.5
            points.push(new Vector2d(0, -length).rotate(angle))
        }
        return points
    }

    function drawTextLines(lines) {
        context.fillStyle = "white"
        context.font = "20px monospace"
        context.textAlign = "left"
        context.textBaseline = "top"
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], 10, 10 + i * 20)
        }
    }

    class Ship {

        constructor() {
            this.pos = canvasSize().scale(0.5)
            this.vel = new Vector2d(0, 0)
            this.rotation = 0 // radians
            this.thrust = 0 // 0 to 1
            this.size = 20
            this.alive = true
            this.score = 0
        }

        die() {
            if (!this.alive) return
            this.alive = false
            spawnExplosion(this.pos)

            setTimeout(() => {
                if (!gameRunning) return
                gameRunning = false
            }, 3000)
        }

        get maxSpeed() {
            return canvasSize().length * 0.01
        }

        get acceleration() {
            return canvasSize().length * 0.00008
        }

        get rotationSpeed() {
            return Math.PI * 0.03
        }

        get thrustVector() {
            return new Vector2d(0, -this.thrust).rotate(this.rotation).scale(this.acceleration)
        }

        get bulletDirection() {
            return new Vector2d(0, -1).rotate(this.rotation).scale(this.acceleration * 100)
        }

        update() {
            if (!this.alive) return
            this.vel.iadd(this.thrustVector)
            this.vel.iscale(0.995)
            this.pos.iadd(this.vel)
            if (this.vel.length > this.maxSpeed)
                this.vel.iscale(this.maxSpeed / this.vel.length)

            if (this.pos.x < -this.size) this.pos.x += canvas.width + this.size * 2
            if (this.pos.x > canvas.width + this.size) this.pos.x -= canvas.width + this.size * 2
            if (this.pos.y < -this.size) this.pos.y += canvas.height + this.size * 2
            if (this.pos.y > canvas.height + this.size) this.pos.y -= canvas.height + this.size * 2

            for (let asteroid of asteroids) {
                if (this.pos.distance(asteroid.pos) < asteroid.size + this.size) {
                    this.die()
                }
            }
        }

        drawThrust() {
            context.strokeStyle = "red"
            context.lineWidth = 2

            context.beginPath()
            context.moveTo(-this.size,  this.size * 0.6)
            context.lineTo(-this.size - this.thrust * this.size,  0)
            context.lineTo(-this.size, -this.size * 0.6)
            context.closePath()
            context.stroke()
        }
 
        spawnParticle() {
            if (!this.alive) return
            let particle = new Particle()
            particle.pos = this.pos.copy()
            particle.vel = this.bulletDirection.copy()
            particle.vel.iadd(this.vel)
            particles.unshift(particle)
        }

        draw() {
            if (!this.alive) return

            context.strokeStyle = "white"
            context.lineWidth = 2

            context.beginPath()
            context.save()
            context.translate(this.pos.x, this.pos.y)
            context.rotate(this.rotation - Math.PI / 2)

            context.moveTo( this.size,  0)
            context.lineTo(-this.size,  this.size * 0.8)
            context.lineTo(-this.size, -this.size * 0.8)
            context.lineTo( this.size,  0)
            context.closePath()
            context.stroke()

            if (this.thrust > 0) {
                this.drawThrust()
            }

            context.restore()
        }

    }

    function spawnExplosion(position, num=200) {
        let numParticles = Math.floor(Math.random() * num / 2) + Math.floor(num)
        for (let i = 0; i < numParticles; i++) {
            let particle = new ExplosionParticle(position.copy())
            explosionParticles.unshift(particle)
        }
    }

    class Asteroid {

        randomPosition() {
            const randomPos = () => new Vector2d(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            )

            let pos = randomPos()
            while (pos.distance(ship.pos) < canvasSize().length / 4) {
                pos = randomPos()
            }   

            return pos
        }

        constructor(level=3) {
            this.level = level
            this.pos = this.randomPosition()
            this.rotation = Math.random() * Math.PI * 2
            this.vel = Vector2d.random().scale(Math.random() * 1 + 0.5)
            this.size = (level * 15) + Math.random() * 3
            this.shape = randomPolygon()
            this.alive = true
        }

        die() {
            if (!this.alive) return

            ship.score++
            this.alive = false
            spawnExplosion(this.pos, this.level * 10)

            if (this.level > 1) {
                let children = Math.floor(Math.random() * 2) + 1
                for (let i = 0; i < children; i++) {
                    let asteroid = new Asteroid(this.level - 1)
                    asteroid.pos = this.pos.copy().add(Vector2d.random().scale(this.size))
                    asteroids.push(asteroid)
                }
            }
        }

        inHitBox(pos) {
            let distance = this.pos.distance(pos)
            return distance < this.size
        }

        draw() {
            context.strokeStyle = "white"
            context.lineWidth = 2

            context.beginPath()
            context.save()
            context.translate(this.pos.x, this.pos.y)
            context.rotate(this.rotation)

            for (let i = 0; i < this.shape.length; i++) {
                let p = this.shape[i]
                context.lineTo(p.x * this.size, p.y * this.size)
            }

            context.closePath()
            context.stroke()

            context.restore()
        }

        update() {
            this.pos.iadd(this.vel)

            if (this.pos.x < -this.size) this.pos.x += canvas.width + this.size * 2
            if (this.pos.x > canvas.width + this.size) this.pos.x -= canvas.width + this.size * 2
            if (this.pos.y < -this.size) this.pos.y += canvas.height + this.size * 2
            if (this.pos.y > canvas.height + this.size) this.pos.y -= canvas.height + this.size * 2
        }

    }

    class ExplosionParticle {

        constructor(pos) {
            this.pos = pos.copy()
            this.vel = Vector2d.random().scale(Math.random() * 10 + 5)
            this.size = Math.random() * 5 + 3
            this.alive = true
        }

        update() {
            this.pos.iadd(this.vel)
            this.alive = this.pos.x > 0 && this.pos.x < canvas.width &&
                         this.pos.y > 0 && this.pos.y < canvas.height
        }

        draw() {
            context.fillStyle = "rgba(255, 128, 128, 0.9)"
            context.fillRect(this.pos.x, this.pos.y, this.size, this.size)
        }

    }

    class Particle {

        constructor() {
            this.size = 3
            this.pos = new Vector2d(0, 0)
            this.vel = new Vector2d(0, 0)
            this.alive = true
            this.tickCount = 0
            this.maxTickCount = 1000
        }

        isOffScreen() {
            return this.pos.x < 0 || this.pos.x > canvas.width ||
                   this.pos.y < 0 || this.pos.y > canvas.height
        }

        die() {
            this.alive = false
        }

        update() {
            this.pos.iadd(this.vel)
            this.tickCount++

            if (this.tickCount > this.maxTickCount)
                this.die()

            if (args.chaos) {
                if (this.pos.x < 0)
                    this.pos.x = canvas.width
                if (this.pos.x > canvas.width)
                    this.pos.x = 0
                if (this.pos.y < 0)
                    this.pos.y = canvas.height
                if (this.pos.y > canvas.height)
                    this.pos.y = 0
            } else {
                this.alive = !this.isOffScreen()
            }

            for (let asteroid of asteroids) {
                if (asteroid.inHitBox(this.pos)) {
                    asteroid.die()
                    this.die()
                }
            }
        }

        draw() {
            context.fillStyle = "white"
            context.fillRect(this.pos.x, this.pos.y, this.size, this.size)
        }

    }

    function drawBackground() {
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    const keysDown = new Set()
    const validKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", " "])

    addEventListener("keydown", event => {
        if (!gameRunning) return
        if (!event.repeat) keysDown.add(event.key)
        if (validKeys.has(event.key)) event.preventDefault()
    })
    addEventListener("keyup", event => keysDown.delete(event.key))

    function handleUserInput() {
        if (keysDown.has("ArrowLeft")) {
            ship.rotation -= ship.rotationSpeed
        }

        if (keysDown.has("ArrowRight")) {
            ship.rotation += ship.rotationSpeed
        }

        if (keysDown.has("ArrowUp")) {
            ship.thrust = Math.min(1, ship.thrust + 0.1)
        } else {
            ship.thrust = 0
        }

        if (keysDown.has(" ")) {
            ship.spawnParticle()
            if (!args.chaos)
                keysDown.delete(" ")
        }
    }

    function reset() {
        ship = new Ship()
        particles = []
        explosionParticles = []
        asteroids = []
        minL3Asteroids = 8
        gameRunning = true
    }

    let ship = new Ship()
    let particles = []
    let explosionParticles = []
    let asteroids = []
    let minL3Asteroids = 8

    function loop() {
        drawBackground()
        ship.update()
        ship.draw()

        for (let particle of particles) {
            particle.update()
            particle.draw()
        }

        for (let particle of explosionParticles) {
            particle.update()
            particle.draw()
        }

        let l3AsteroidCount = 0
        for (let asteroid of asteroids) {
            asteroid.update()
            asteroid.draw()
            if (asteroid.level == 3) l3AsteroidCount++
        }

        particles = particles.filter(particle => particle.alive)
        explosionParticles = explosionParticles.filter((particle, i) => {
            if (i > maxNumParticles) return false
            if (particle.alive) return true
            return false
        })
        asteroids = asteroids.filter(asteroid => asteroid.alive)

        if (l3AsteroidCount < minL3Asteroids) {
            asteroids.push(new Asteroid())
            if (Math.random() < 0.05) {
                minL3Asteroids++
            }
        }

        drawTextLines([
            `Score: ${ship.score}`,
        ])

        handleUserInput()

        if (gameRunning)
            terminal.window.requestAnimationFrame(loop)
    }

    while (true) {
        loop()
        while (gameRunning) {
            await terminal.sleep(100)
        }

        let chosenOptionIndex = await CanvasDrawer.promptOptions(context, {
            options: [
                "Play again",
                `Upload Score (${ship.score})`,
                "Exit"
            ]
        })
    
        if (chosenOptionIndex == 0) {
            reset()
        } else if (chosenOptionIndex == 1) {
            terminalWindow.close()
            if (!args.chaos) {
                await HighscoreApi.registerProcess("asteroids", {ask: false})
                await HighscoreApi.uploadScore(ship.score)
            } else {
                terminal.printError("Cannot upload score in chaos mode")
            }
            return
        } else {
            terminalWindow.close()
            return
        }
    }

}, {
    description: "simulate a bunch of balls jumping around",
    args: {
        "?f=fullscreen:b": "start in fullscreen mode",
        "?c=chaos:b": "start with chaos mode enabled",
    },
    isGame: true
})
// ------------------- avoida.js --------------------
terminal.addCommand("avoida", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Avoida Game", fullscreen: true, removeBar: true
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT
    const xResolution = 200
    const objectScaleFactor = 1
    let displayAngle = 0.1

    canvas.style.userSelect = "none"
    canvas.style.webkitUserSelect = "none"
    canvas.style.mozUserSelect = "none"

    function makeTileMap({
        width=21,
        length=300,
        transitionHeight=15,
        copyFrom=null,
        copyOverlapHeight=10
    }={}) {
        let tileMap = Array.from({length}, 
            () => Array.from({length: width}, () => Math.random() < 0.2 ? true : false))
        
        const middleX = Math.floor(width / 2)
        let currX = middleX
        for (let i = 0; i < tileMap.length; i++) {
            tileMap[i][currX] = false
            if (currX < tileMap[0].length - 1) {
                tileMap[i][currX + 1] = false
            }

            let middleDirection = (middleX - currX) > 0 ? 1 : -1
            if (Math.random() < 0.8) {
                currX += middleDirection
            } else {
                currX -= middleDirection
            }

            currX = Math.min(tileMap[0].length - 1, Math.max(0, currX))
        }

        let offsetHeight = copyFrom == null ? 0 : copyOverlapHeight
        for (let i = offsetHeight; (i < transitionHeight + offsetHeight) && i < length; i++) {
            for (let j = 0; j < width; j++) {
                tileMap[i][j] = false
            }

            tileMap[i][Math.max(middleX - 2, 0)] = true
            tileMap[i][Math.min(middleX + 2, width - 1)] = true
        }

        for (let i = 0; i < offsetHeight; i++) {
            for (let j = 0; j < width; j++) {
                tileMap[i][j] = copyFrom[copyFrom.length - offsetHeight - 1 + i][j]
            }
        }

        return tileMap
    }

    let bitmap = makeTileMap({height: 1000})

    class Player {
        constructor() {
            this.pos = new Vector2d(bitmap[0].length / 2, 0)
            this.originalAngle = Math.PI / 2
            this.angle = this.originalAngle
            this.sideMovement = 0
            this.fov = Math.PI / 1.5
            this.viewDistance = 10
            this.speed = 1
            this.hearts = 5
        }

        move(distance) {
            this.pos.y += distance * this.speed
            this.pos.x += this.sideMovement * this.speed

            let x = Math.floor(this.pos.x)
            let y = Math.floor(this.pos.y)
            let row = bitmap[y]
            if (row) {
                let value = row[x]
                if (value === true) {
                    bitmap[y][x] = false
                    this.hearts--
                }
            }

            this.pos.x = Math.max(0, Math.min(bitmap[0].length - 1, this.pos.x))

            let distanceToEnd = bitmap.length - this.pos.y
            if (distanceToEnd < 11) {
                bitmap = makeTileMap({copyFrom: bitmap})
                this.pos.y = 0
            }

            this.speed += 0.001
        }

        get score() {
            return Math.floor(this.speed * 71) - 71
        }

        resetPos() {
            this.pos = new Vector2d(bitmap[0].length / 2, 0)
        }
    }

    let player = new Player()

    function drawHeart(startX, startY, size=10) {
        context.fillStyle = "red"
        context.fillRect(startX, startY, size, size)
    }

    function drawScore(score, textSize) {
        context.font = `${textSize}px monospace`
        context.fillText(score.toString(), 10, textSize)
    }

    function render() {
        player.fov = (canvas.width / canvas.height) * (Math.PI / 3.5)

        function raycast(start, angle, {
            maxDistance = 10,
            precision = 0.01
        }={}) {
            const delta = Vector2d.fromAngle(angle).scale(precision)
            let currPos = start.copy()
            while (currPos.distance(start) < maxDistance) {
                currPos.iadd(delta)
                const row = bitmap[Math.floor(currPos.y)]
                if (row === undefined) {
                    return Infinity
                }
                const value = row[Math.floor(currPos.x)]
                if (value) {
                    return currPos.distance(start)
                } else if (value === undefined) {
                    return Infinity
                }
            }
            return Infinity
        }

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = "white"

        const yResolution = Math.round((canvas.height / canvas.width) * xResolution)
        const startAngle = player.angle - player.fov / 2
        let heights = []
        for (let x = 0; x < xResolution; x++) {
            let angle = startAngle + player.fov * (x / (xResolution - 1))
            let result = raycast(player.pos, angle, {maxDistance: player.viewDistance})
            let height = Math.min(yResolution - 1, Math.round(yResolution / (result * objectScaleFactor)))
            heights.push(height)
        }

        const xStep = canvas.width / xResolution
        const yStep = canvas.height / yResolution

        context.save()
        context.translate(canvas.width / 2, canvas.height / 2)
        context.rotate(displayAngle)

        for (let x = 0; x < xResolution; x++) {
            const height = heights[x]
            let offset = Math.round((yResolution - height) / 2)
            const lum = Math.round(height / yResolution * 255)
            context.fillStyle = `rgb(${lum}, ${lum}, ${lum})`
            context.fillRect(xStep * x - canvas.width / 2, yStep * offset - canvas.height / 2, xStep + 1, height * yStep)
        }

        context.restore()

        let heartSize = Math.min(canvas.width, canvas.height) / 10
        for (let i = 0; i < player.hearts; i++) {
            drawHeart(canvas.width - ((i + 1) * heartSize * 1.2), heartSize * 0.2, heartSize)
        }

        drawScore(player.score, heartSize)
    }

    let gameRunning = true
    
    let keyDown = {
        "UP": false,
        "DOWN": false,
        "LEFT": false,
        "RIGHT": false
    }

    function parseKeyCode(keycode, up) {
        if (keycode == "ArrowUp" || keycode == "w") {
            keyDown.UP = !up
            return true
        } else if (keycode == "ArrowDown" || keycode == "s") {
            keyDown.DOWN = !up
            return true
        } else if (keycode == "ArrowLeft" || keycode == "a") {
            keyDown.LEFT = !up
            return true
        } else if (keycode == "ArrowRight" || keycode == "d") {
            keyDown.RIGHT = !up
            return true
        }
    }

    let upListener = addEventListener("keyup", function(event) {
        if (!gameRunning) return

        if (parseKeyCode(event.key, true)) event.preventDefault()
    })

    let downListener = addEventListener("keydown", function(event) {
        if (!gameRunning) return

        if (event.key == "c" && event.ctrlKey) {
            gameRunning = false
            removeEventListener("keydown", downListener)
            removeEventListener("keyup", upListener)
        }

        if (parseKeyCode(event.key, false)) event.preventDefault()
    })

    function updateTouchX(pageX) {
        let rect = canvas.getBoundingClientRect()
        let x = (pageX - rect.left) / canvas.clientWidth
        if (x > 0.6) {
            keyDown.RIGHT = true
            keyDown.LEFT = false
        } else if (x < 0.4) {
            keyDown.LEFT = true
            keyDown.RIGHT = false
        } else {
            keyDown.LEFT = false
            keyDown.RIGHT = false
        }
    }

    addEventListener("touchstart", event => {
        updateTouchX(event.touches[0].pageX)
    })

    addEventListener("touchmove", event => {
        updateTouchX(event.touches[0].pageX)
    })

    addEventListener("touchend", event => {
        keyDown.LEFT = false
        keyDown.RIGHT = false
    })

    canvas.addEventListener("contextmenu", event => {
        event.preventDefault()
    })

    function processInput() {
        if (keyDown.LEFT) {
            player.sideMovement += 0.03
        } else if (keyDown.RIGHT) {
            player.sideMovement -= 0.03
        } else {
            player.sideMovement -= player.sideMovement * 0.5
        }

        player.sideMovement = Math.min(player.sideMovement, 0.1)
        player.sideMovement = Math.max(player.sideMovement, -0.1)

        player.desiredAngle = player.originalAngle - player.sideMovement * 3
        player.angle += (player.desiredAngle - player.angle) * 0.1
        displayAngle = player.sideMovement * 1
    }

    terminal.onInterrupt(() => {
        gameRunning = false
        terminalWindow.close()
    })

    while (gameRunning) {
        player.move(0.2)
        render()
        processInput()

        if (player.hearts <= 0) {
            gameRunning = false
        }

        await sleep(40)
    }

    await sleep(1000)

    terminalWindow.close()
    terminal.printLine("Your score: " + player.score)

    await HighscoreApi.registerProcess("avoida")
    await HighscoreApi.uploadScore(player.score)
}, {
    description: "play a game of avoida",
    isGame: true,
})
// ------------------- background.js --------------------
const OG_BACKGROUND_COLOR = Color.rgb(3, 3, 6)

terminal.addCommand("background", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.data.background = OG_BACKGROUND_COLOR
        return
    }
    let color = parseColor(args.color)
    let distance = terminal.data.foreground.distanceTo(color)
    if (distance >= 80) {
        terminal.data.background = color
    } else {
        throw new Error("The background color is too close to the foreground color")
    }
}, {
    description: "change the background color of the terminal",
    args: ["color"]
})

// ------------------- base64.js --------------------
terminal.addCommand("base64", async function(args) {
    let msg = args.message
    let output = ""
    if (args.d) {
        output = atob(msg)
    } else {
        output = btoa(msg)
    }
    terminal.printLine(output)

    if (args.c)
        await terminal.copy(output, {printMessage: true})
}, {
    description: "encode/decode a message using base64",
    args: {
        "*message": "the message to encode/decode",
        "?d=decode:b": "decode the message instead of encoding it",
        "?c=copy:b": "copy the result to the clipboard"
    },
})
// ------------------- bc.js --------------------
terminal.addCommand("bc", async function() {
    await terminal.modules.load("mathenv", terminal)
    while (true) {
        let text = await terminal.prompt()
        let [result, error] = terminal.modules.mathenv.eval(text)
        if (error) {
            terminal.print("> ")
            terminal.printLine(error)
        } else if (result !== null) {
            terminal.print("> ")
            terminal.printLine(result)
        }
    }
}, {
    description: "start a bc (basic calculator) session"
})


// ------------------- bezier.js --------------------
terminal.addCommand("bezier", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../bezier/",
        name: "Bezier Playground"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play with bezier curves"
})
// ------------------- bin.js --------------------
terminal.addCommand("bin", async function(args) {
    let result = parseInt(args.n, args.f).toString(args.t)
    terminal.printLine(result)
}, {
    description: "convert a number to another base",
    args: {
        "n": "number to convert",
        "?t=to-base:i:2~36": "base to convert to",
        "?f=from-base:i:2~36": "base to convert from"
    },
    standardVals: {
        t: 2,
        f: 10
    }
})
// ------------------- binomcdf.js --------------------
terminal.addCommand("binomcdf", async function(args) {
    const binomcdf = (await terminal.modules.load("binom", terminal)).binomcdf
    let n = ~~args.n
    let lower = ~~args.lower
    let upper = ~~args.upper
    terminal.printLine(binomcdf(n, args.p, lower, upper))
}, {
    description: "calculate the binomial cumulative distribution function",
    args: {
        "n:n:1~1000": "the number of trials",
        "p:n:0~1": "the probability of success",
        "lower:n:0~1000": "the lower bound",
        "upper:n:0~1000": "the upper bound"
    }
})


// ------------------- binompdf.js --------------------
terminal.addCommand("binompdf", async function(args) {
    const binompdf = (await terminal.modules.load("binom", terminal)).binompdf
    let n = ~~args.n
    let k = ~~args.k
    if (k > n) {
        throw new Error("k must be smaller than n")
    }
    terminal.printLine(binompdf(n, args.p, k))
}, {
    description: "calculate binomial distribution value",
    args: {
        "n:n:0~100": "the number of trials",
        "p:n:0~1": "the probability of success",
        "k:n:0~100": "the number of successes"
    }
})


// ------------------- blocks.js --------------------
terminal.addCommand("blocks", async function(args) {
	await terminal.modules.import("game", window)
	
	function initField(size, {defaultVal=0}={}) {
		let field = []
		for (let x = 0; x < size.x; x++) {
			let row0 = []
			for (let y = 0; y < size.y; y++) {
				let row1 = []
				for (let z = 0; z < size.z; z++) {
					row1.push(defaultVal)
				}
				row0.push(row1)
			}
			field.push(row0)
		}
		return field
	}
	
	const fieldSize = new Vector3d(args.roomX, args.roomY, args.roomZ)
	const field = initField(fieldSize)
    const maxFieldDistance = fieldSize.length

    function colorFromVals(raycastResult, distance) {
        let hue = raycastResult * 360
        let lightness = 80 - distance / cameraViewDistance * 80
        let saturation = lightness
        return Color.fromHSL(hue / 360, saturation / 100, lightness / 100)
    }
	
	function isOutOfBounds(pos) {
		if (
			(pos.x < 0)
			|| (pos.y < 0)
			|| (pos.z < 0)
			|| (pos.x + 1 > fieldSize.x)
			|| (pos.y + 1 > fieldSize.y)
			|| (pos.z + 1 > fieldSize.z)
		) return true
		return false
	}
	
	function buildCube(pos, size, {f=field, val=1}={}) {
		for (let x = 0; x < size.x; x++) {
			for (let y = 0; y < size.y; y++) {
				for (let z = 0; z < size.z; z++) {
					field[x+pos.x][y+pos.y][z+pos.z] = val
				}
			}
		}
	}

    function buildRandomWalls({f=field, val=p=>1}={}) {
        for (let x = 0; x < fieldSize.x; x++) {
            for (let y = 0; y < fieldSize.y; y++) {
                for (let z = 0; z < fieldSize.z; z++) {
                    if (
                           x == 0 || x == fieldSize.x - 1
                        || y == 0 || y == fieldSize.y - 1
                        || z == 0 || z == fieldSize.z - 1
                    ) {
                        f[x][y][z] = val(new Vector3d(x, y, z))
                    }
                }
            }
        }
    }

    buildRandomWalls({val: pos => {
        return Math.random()
    }})

	const resolution = new Vector2d(args.resolution, Math.floor(args.resolution * (9 / 16)))
	
	let cameraPos = new Vector3d(4.14, 3.73, 4.12)
	let fovXDeg = args.fov / 180 * Math.PI
	let fovYDeg = fovXDeg * (resolution.y / resolution.x)
    
    let leftMostAngle = -fovXDeg / 2
    let rightMostAngle = fovXDeg / 2
    let topMostAngle = -fovYDeg / 2
    let bottomMostAngle = fovYDeg / 2

    let cameraDir = new Vector3d(0.95, 0.28, 0.09).normalized
    let cameraSpeed = 0.1

    const cameraViewDistance = args.viewDistance
	
	function initDisplay(size, {defaultVal=" "}={}) {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        canvas.style.width = terminal.charWidth * 80 + "px"
        let heightPx = Math.floor(terminal.charWidth * 80 * (size.y / size.x))
        canvas.style.height = heightPx + "px"
        terminal.parentNode.appendChild(canvas)
        canvas.width = size.x
        canvas.height = size.y
        canvas.style.imageRendering = "pixelated"
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        terminal.addLineBreak()
        return [context.getImageData(0, 0, size.x, size.y), context, canvas]
	}

	const [canvasPixelData, context2d, canvas] = initDisplay(resolution)
	
    function raycast(pos, dir, {stepScalar=0.1, maxDist=maxFieldDistance, f=field}={}) {
        const originalPos = pos.copy()
        let normalisedDir = dir
        let usingNormalisedDir = true
        let floored = pos.floor()
        let coveredDistance = 0
        while (!isOutOfBounds(floored)) {
            floored = pos.floor()
            let block = f[floored.x][floored.y][floored.z]
            if (block != 0) {
                if (usingNormalisedDir) {
                    pos = pos.sub(normalisedDir)
                    coveredDistance -= 1
                    usingNormalisedDir = false
                } else {
                    let distance = pos.distanceTo(originalPos)
                    return [block, distance]
                }
            }
            if (coveredDistance > maxDist)
                return [0, maxDist]
            if (usingNormalisedDir) {
                pos = pos.add(normalisedDir)
                coveredDistance += 1
            } else {
                pos = pos.add(normalisedDir.mul(stepScalar))
                coveredDistance += stepScalar
            }
        }
        return [0, Infinity]
    }

    function init2dArray(size, {defaultVal=0}={}) {
        let arr = []
        for (let y = 0; y < size.y; y++) {
            let row = []
            for (let x = 0; x < size.x; x++) {
                row.push(defaultVal)
            }
            arr.push(row)
        }
        return arr
    }

    function render() {
        let displayColors = init2dArray(resolution, {defaultVal: Color.BLACK})
        function renderData() {
            for (let y = 0; y < resolution.y; y++) {
                for (let x = 0; x < resolution.x; x++) {
                    let color = displayColors[y][x]
                    let index = (y * resolution.x + x) * 4
                    canvasPixelData.data[index] = color.r
                    canvasPixelData.data[index + 1] = color.g
                    canvasPixelData.data[index + 2] = color.b
                    canvasPixelData.data[index + 3] = 255
                }
            }
            context2d.putImageData(canvasPixelData, 0, 0)
        }

        let projectionPlaneTopLeft = cameraPos.add(cameraDir.rotateRight(leftMostAngle).rotateUp(topMostAngle))

        let leftRef = cameraDir.add(cameraDir.rotateRight(leftMostAngle))
        let rightRef = cameraDir.add(cameraDir.rotateRight(rightMostAngle))

        let topRef = cameraDir.add(cameraDir.rotateUp(topMostAngle))
        let bottomRef = cameraDir.add(cameraDir.rotateUp(bottomMostAngle))

        let xDiff = rightRef.sub(leftRef)
        let yDiff = bottomRef.sub(topRef)

        terminal.window.xDiff = xDiff.length
        terminal.window.yDiff = yDiff.length
        
        for (let y = 0; y < resolution.y; y++) {
            for (let x = 0; x < resolution.x; x++) {
                let xRatio = x / resolution.x
                let yRatio = y / resolution.y

                let projectionPlaneDestination = projectionPlaneTopLeft.add(
                    xDiff.mul(xRatio)).add(yDiff.mul(yRatio))
                let rayDir = projectionPlaneDestination.sub(cameraPos).normalized

                let [raycastResult, distance] = raycast(cameraPos, rayDir, {maxDist: cameraViewDistance})
                let color = colorFromVals(raycastResult, distance)
                displayColors[y][x] = color
            }
        }

        renderData()
    }

    function checkBlockCollison({f=field}={}) {
        let floored = cameraPos.floor()
        if (isOutOfBounds(floored)) return false
        return f[floored.x][floored.y][floored.z] != 0
    }

    let gameRunning = true

    function endGame() {
        gameRunning = false
        canvas.remove()
    }

    terminal.onInterrupt(endGame)

    let rotateSpeed = Math.PI / 128

    const movement = {
        FORWARD: () => cameraPos = cameraPos.add(cameraDir.mul(cameraSpeed)),
        BACKWARD: () => cameraPos = cameraPos.sub(cameraDir.mul(cameraSpeed)),
        LEFT: () => cameraPos = cameraPos.add(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed)),
        RIGHT: () => cameraPos = cameraPos.sub(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed)),
        UP: () => cameraPos = cameraPos.sub(new Vector3d(0, 0, 1).mul(cameraSpeed)),
        DOWN: () => cameraPos = cameraPos.add(new Vector3d(0, 0, 1).mul(cameraSpeed)),
        TURN_UP: () => cameraDir = cameraDir.rotateUp(-rotateSpeed),
        TURN_DOWN: () => cameraDir = cameraDir.rotateUp(rotateSpeed),
        TURN_LEFT: () => cameraDir = cameraDir.rotateZ(-rotateSpeed),
        TURN_RIGHT: () => cameraDir = cameraDir.rotateZ(rotateSpeed),
    }

    const antiKeyMappings = {
        FORWARD: "BACKWARD",
        BACKWARD: "FORWARD",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
        UP: "DOWN",
        DOWN: "UP",
        TURN_LEFT: "TURN_RIGHT",
        TURN_RIGHT: "TURN_LEFT",
        TURN_UP: "TURN_DOWN",
        TURN_DOWN: "TURN_UP"
    }

    let keyDown = {
        FORWARD: false,
        BACKWARD: false,
        LEFT: false,
        RIGHT: false,
        UP: false,
        DOWN: false,
        TURN_LEFT: false,
        TURN_RIGHT: false,
        TURN_UP: false,
        TURN_DOWN: false
    }

    const keyMappings = {
        w: "FORWARD",
        s: "BACKWARD",
        a: "LEFT",
        d: "RIGHT",
        ArrowUp: "TURN_UP",
        ArrowDown: "TURN_DOWN",
        ArrowLeft: "TURN_LEFT",
        ArrowRight: "TURN_RIGHT",
        " ": "UP",
        Shift: "DOWN"
    }

    let upListener = addEventListener("keyup", function(event) {
        if (!gameRunning) return

        let keyCode = event.key
        if (keyCode in keyMappings) {
            keyDown[keyMappings[keyCode]] = false
            event.preventDefault()
        }
    })

    let downListener = addEventListener("keydown", function(event) {
        if (gameRunning && event.repeat) event.preventDefault()
        if (!gameRunning || event.repeat) return

        let keyCode = event.key
        if (keyCode in keyMappings) {
            let keyMapping = keyMappings[keyCode]
            keyDown[keyMapping] = true
            if (keyMapping in antiKeyMappings) {
                keyDown[antiKeyMappings[keyMapping]] = false
            }
            event.preventDefault()
        }
    })

    function processInput() {
        let prevPos = cameraPos.copy()

        for (let key in keyDown) {
            if (keyDown[key]) {
                movement[key]()
            }
        }

        if (checkBlockCollison()) {
            cameraPos = prevPos
        }
    }

    terminal.printLine("Use WASD to move, arrow keys to rotate, shift and space to move up and down")

    terminal.scroll()

    function loop() {
        processInput()
        render()

        terminal.window.requestAnimationFrame(loop)
    }

    loop()

    while (gameRunning) {
        await sleep(100)
    }

}, {
	description: "3d raycasting test",
    args: {
        "?fov:i:1~720": "Field of view in degrees",
        "?res=resolution:i:1~1000": "Resolution (width) in Pixels",
        "?x=roomX:i:5~100": "Room size in x direction",
        "?y=roomY:i:5~100": "Room size in y direction",
        "?z=roomZ:i:5~100": "Room size in z direction",
        "?v=viewDistance:i:1~9999": "View distance in blocks"
    },
    defaultValues: {
        fov: 90,
        resolution: 90,
        roomX: 30,
        roomY: 10,
        roomZ: 10,
        viewDistance: 13
    }
})
// ------------------- brainfuck.js --------------------
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
// ------------------- cal.js --------------------
terminal.addCommand("cal", async function(args) {
    const today = new Date()

    const monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ]

    class PrintInstruction {

        constructor(text, color, backgroundColor) {
            this.text = text
            this.color = color
            this.backgroundColor = backgroundColor
        }
    
    }

    let tempPrintInstructions = []

    const monthsPerRow = 3
    const monthSideSpacing = 4

    function addPrint(text, color, backgroundColor) {
        tempPrintInstructions.push(new PrintInstruction(text, color, backgroundColor))
    }

    function executePrintInstructions(printInstructions) {
        for (let instruction of printInstructions) {
            if (instruction === undefined)
                continue
            terminal.print(instruction.text, instruction.color, {background: instruction.backgroundColor})
        }
    }

    function restructureInstructions(instructions) {
        let lines = []
        let tempLine = []
        for (let instruction of instructions) {
            if (instruction.text == "\n") {
                lines.push(tempLine)
                tempLine = []
            } else {
                tempLine.push(instruction)
            }
        }
        if (tempLine.length > 0)
            lines.push(tempLine)
        return lines
    }

    function combineMonthInstructions(monthInstructions) {
        let combinedInstructions = []
        if (monthInstructions.length !== 12)
            throw new Error("Invalid month instructions")

        for (let startMonth = 0; startMonth < 12; startMonth += monthsPerRow) {
            for (let lineIndex = 0; lineIndex < monthInstructions[0].length; lineIndex++) {
                for (let monthIndex = startMonth; monthIndex < startMonth + monthsPerRow; monthIndex++) {
                    combinedInstructions = combinedInstructions.concat(monthInstructions[monthIndex][lineIndex])
                    combinedInstructions.push(new PrintInstruction(" ".repeat(monthSideSpacing)))
                }
                combinedInstructions.push(new PrintInstruction("\n"))
            }
        }
        return combinedInstructions
    }

    Date.prototype.getRealDay = function() {
        return this.getDay() == 0 ? 6 : this.getDay() - 1
    }

    function printMonth(monthIndex, year) {
        tempPrintInstructions = []
        let tableData = Array.from(Array(6)).map(() => Array(7).fill("  "))
        let tableHeader = "Mo Tu We Th Fr Sa Su"
        let date = new Date()
        date.setFullYear(year, monthIndex, 1)
        let month = monthNames[date.getMonth()]
        let dayOfMonth = (new Date()).getDate()

        function printTable() {
            let headerText = `${month} ${stringPad(year, 4, "0")}`
            headerText = stringPadMiddle(headerText, tableHeader.length)
            addPrint(headerText, Color.COLOR_1)
            addPrint("\n")
            addPrint(tableHeader)
            addPrint("\n")
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 7; x++) {
                    if (dayOfMonth == parseInt(tableData[y][x]) &&
                        today.getMonth() == monthIndex &&
                        today.getFullYear() == year) {
                        addPrint(tableData[y][x], Color.BLACK, Color.WHITE)
                    } else {
                        addPrint(tableData[y][x])
                    }
                    if (x < 7 - 1)
                        addPrint(" ")
                }
                addPrint("\n")
            }

            if (monthIndex < 12 - 1) {
                addPrint("\n")
            }
        }

        let weekIndex = 0
        for (let i = 1;; i++) {
            date.setDate(i)
            if (date.getMonth() != monthNames.indexOf(month)) {
                break
            }
            if (date.getRealDay() == 0) {
                weekIndex++
            }
            tableData[weekIndex][date.getRealDay()] = stringPad(String(i), 2)
        }

        printTable()
            
        return tempPrintInstructions
    }

    let chosenYear = null
    let chosenMonth = null

    argument_loop:
    for (let argument of Object.values(args).filter(i => i != undefined)) {
        for (let month of monthNames) {
            if (month.toLowerCase().startsWith(argument.toLowerCase())) {
                chosenMonth = monthNames.indexOf(month)
                continue argument_loop
            }
        }
        if (/^[0-9]{1,4}$/.test(argument)) {
            chosenYear = parseInt(argument)
        } else if (/^[0-9]{1,2}\.[0-9]{1,4}$/.test(argument)) {
            let [month, year] = argument.split(".")
            chosenMonth = parseInt(month) - 1
            chosenYear = parseInt(year)
        } else if (/^[0-9]{1,4}\.[0-9]{1,2}$/.test(argument)) {
            let [year, month] = argument.split(".")
            chosenMonth = parseInt(month) - 1
            chosenYear = parseInt(year)
        } else {
            throw new Error(`Invalid Month/Year "${argument}"`)
        }
    }

    if (chosenYear < 0) throw new Error("Cannot look past the year 0 - sorry")
    if (chosenYear > 9999) throw new Error("Cannot look past the year 9999 - sorry")
    if (chosenMonth > 11 || chosenMonth < 0)
        throw new Error("That month doesn't exist in this world.")

    if (chosenYear == null && chosenMonth == null) {
        chosenYear = today.getFullYear()
        chosenMonth = today.getMonth()
    }

    if (chosenMonth != null && chosenYear == null) {
        chosenYear = today.getFullYear()
    }

    if (chosenMonth == null) {
        let monthInstructions = []
        for (let month = 0; month < 12; month++) {
            let printInstructions = printMonth(month, chosenYear)
            let structuredInstructions = restructureInstructions(printInstructions)
            monthInstructions.push(structuredInstructions)
        }
        let combinedInstructions = combineMonthInstructions(monthInstructions)
        executePrintInstructions(combinedInstructions)
    } else {
        executePrintInstructions(printMonth(chosenMonth, chosenYear))
    }

}, {
    description: "print a calendar",
    args: {
        "?month": "the month to print",
        "?year": "the year to print"
    }
})


// ------------------- cardoid.js --------------------
terminal.addCommand("cardoid", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../cardoid/",
        name: "Cardoid Generator",
        fullscreen: args.fullscreen
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "start a cardoid generator",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- cat.js --------------------
terminal.addCommand("cat", async function(args) {
    const specialCases = {
        "turtlo": "no, turtlo isn't a cat"
    }

    if (args.file in specialCases) {
        terminal.printLine(specialCases[args.file])
        return
    }

    await terminal.modules.load("catfunc", terminal)
    let func = terminal.modules.catfunc.makeCatFunc((content, _, file) => {
        if (file.type == FileType.PROGRAM) {
            terminal.printLink(content, content)
        } else {
            terminal.printLine(content.trimEnd())
        }
    })
    await func(args)
}, {
    description: "print file content",
    args: {
        "file:f": "file to display the content of"
    }
})
// ------------------- cd.js --------------------
terminal.addCommand("cd", function(args) {
    if (["-", ".."].includes(args.directory)) {
        if (terminal.fileSystem.currPath.length > 0) {
            terminal.fileSystem.currPath.pop()
            return
        } else {
            throw new Error("You are already at ground level")
        }
    } else if (["/", "~"].includes(args.directory)) {
        if (terminal.fileSystem.currPath.length > 0) {
            terminal.fileSystem.currPath = Array()
            terminal.updatePath()
            return
        } else {
            throw new Error("You are already at ground level")
        }
    }

    let targetFolder = terminal.getFile(args.directory, FileType.FOLDER)
    terminal.fileSystem.currPath = targetFolder.pathArray
    terminal.updatePath()
}, {
    helpVisible: true,
    args: {
        "directory": "the directory relative to your current path"
    },
    description: "change current directory",
})
// ------------------- ceasar.js --------------------
terminal.addCommand("ceasar", function(args) {
    let text = args.text
    let shiftVal = args.shift
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    function betterMod(n, m) {
        while (n < 0) n += m
        return n % m
    }
    for (let char of text.toLowerCase()) {
        let index = alphabet.indexOf(char)
        if (index == -1) {
            terminal.print(char)
            continue
        }
        let newChar = alphabet[betterMod((index + shiftVal), alphabet.length)]
        terminal.print(newChar)
    }
    terminal.printLine()
}, {
    description: "shift the letters of a text",
    args: {
        "text": "the text to shift",
        "?s=shift:i:-26~26": "the shift value"
    },
    standardVals: {
        shift: 1
    }
})


// ------------------- cheese.js --------------------
terminal.addCommand("cheese", async function(args) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        throw new Error("Device does not support MediaDevices API")

    let stream = await navigator.mediaDevices.getUserMedia({video: true})
    let canvas = document.createElement("canvas")

    let context = canvas.getContext("2d")
    let video = document.createElement("video")
    video.srcObject = stream
    video.play()

    terminal.parentNode.appendChild(canvas)
    canvas.style.display = "none"

    await sleep(1000)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (Math.max(canvas.width, canvas.height) == 0) {
        throw new Error("Invalid image source")
    }

    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    stream.getTracks().forEach(track => track.stop())

    let imgSource = canvas.toDataURL("image/png")

    terminal.printImg(imgSource, "cheese")
    terminal.addLineBreak()

}, {
    description: "take a foto with your webcam",
})


// ------------------- chess.js --------------------
const PieceType = {
    ROOK: 'R',
    KNIGHT: 'N',
    BISHOP: 'B',
    QUEEN: 'Q',
    KING: 'K',
    PAWN: 'P',
    NONE: ' '
}

const ColorType = {
    WHITE: 'w',
    BLACK: 'b',
    NONE: '-'
}

const CastlingType = {
    KINGSIDE: 'K',
    QUEENSIDE: 'Q',
    NONE: '-'
}

const centerHeatmap = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

function oppositeColor(color) {
    if (color === ColorType.WHITE) {
        return ColorType.BLACK;
    } else if (color === ColorType.BLACK) {
        return ColorType.WHITE;
    } else {
        return ColorType.NONE;
    }
}

class Position {

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    addX(x) {
        return new Position(this.x + x, this.y)
    }

    addY(y) {
        return new Position(this.x, this.y + y)
    }

    add(x, y) {
        return new Position(this.x + x, this.y + y)
    }

    addPos(pos) {
        return new Position(this.x + pos.x, this.y + pos.y)
    }

    toString() {
        const numbers = "87654321".split("")
        const letters = "abcdefgh".split("")
        return letters[this.x] + numbers[this.y]
    }

    equals(pos) {
        return this.x === pos.x && this.y === pos.y
    }

    diff(pos) {
        return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y)
    }

    copy() {
        return new Position(this.x, this.y)
    }

    static fromString(str) {
        const numbers = "87654321".split("")
        const letters = "abcdefgh".split("")
        return new Position(letters.indexOf(str[0]), numbers.indexOf(str[1]))
    }

}

class Move {
    
    constructor() {
        this.start = new Position(0, 0)
        this.end = new Position(0, 0)
        this.castling = null
        this.promotion = null
        this.enPassant = null
        this.activeEnPassant = null
        this.capture = false
    }

    setCastling(castling) {
        if (castling === undefined)
            console.error("castling is undefined")
        this.castling = castling
        return this
    }

    setPromotion(promotion) {
        this.promotion = promotion
        return this
    }

    setEnPassant(enPassant) {
        this.enPassant = enPassant
        return this 
    }

    setActiveEnPassant(activeEnPassant) {
        this.activeEnPassant = activeEnPassant
        return this
    }

    setStart(pos) {
        this.start.x = pos.x
        this.start.y = pos.y
        return this
    }

    setEnd(pos) {
        this.end.x = pos.x
        this.end.y = pos.y
        return this
    }

    static fromString(str) {
        let newMove = new Move()
        let positions = str.split("-").map(p => p.trim()) 
        newMove.start = Position.fromString(positions[0])  
        newMove.end = Position.fromString(positions[1])
        return newMove     
    }

    toString() {
        return `${this.start.toString()}_${this.end.toString()}`
    }

    equals(move) {
        return this.start.equals(move.start) && this.end.equals(move.end)
    }

}

class Piece {
        
    constructor(color, type) {
        this.color = color
        this.type = type
    }

    get value() {
        switch(this.type) {
            case PieceType.ROOK: return 5
            case PieceType.KNIGHT: return 3
            case PieceType.BISHOP: return 3
            case PieceType.QUEEN: return 9
            case PieceType.KING: return 100
            case PieceType.PAWN: return 1
            default: return 0
        }
    }

    toString() {
        if (this.color == ColorType.WHITE) {
            return this.type.toUpperCase()
        } else {
            return this.type.toLowerCase()
        }
    }

    get oppositeColor() {
        return oppositeColor(this.color)
    }

    getMoves() {
        return Array()
    }

}

class Pawn extends Piece {
    
    constructor(color) {
        super(color, PieceType.PAWN)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        let forward = (this.color == ColorType.WHITE) ? -1 : 1
        let startRank = (this.color == ColorType.WHITE) ? 6 : 1
        let endRank = (this.color == ColorType.WHITE) ? 0 : 7
        
        if (board.isFree(pos.addY(forward))) {
            allMoves.push(new Move().setStart(pos).setEnd(pos.addY(forward))
                .setPromotion((pos.y + forward == endRank) ? PieceType.QUEEN : null))
            if (pos.y == startRank && board.isFree(pos.addY(forward * 2))) {
                allMoves.push(new Move().setStart(pos).setEnd(pos.addY(forward * 2)).
                    setEnPassant(pos.addY(forward)))
            }
        }
        let frontLeft = pos.add(-1, forward)
        let frontLeftPiece = board.get(frontLeft)
        let frontRight = pos.add(1, forward)
        let frontRightPiece = board.get(frontRight)
        if (frontLeftPiece && ((frontLeftPiece.color == this.oppositeColor) || (board.enPassant && frontLeft.equals(board.enPassant)))) {
            allMoves.push(new Move().setStart(pos).setEnd(frontLeft)
            .setPromotion((pos.y + forward == endRank) ? PieceType.QUEEN : null))
            if (board.enPassant && frontLeft.equals(board.enPassant)) {
                allMoves[allMoves.length - 1].setActiveEnPassant(frontLeft)
            }
        }
        if (frontRightPiece && ((frontRightPiece.color == this.oppositeColor) || (board.enPassant && frontRight.equals(board.enPassant)))) {
            allMoves.push(new Move().setStart(pos).setEnd(frontRight)
            .setPromotion((pos.y + forward == endRank) ? PieceType.QUEEN : null))
            if (board.enPassant && frontRight.equals(board.enPassant)) {
                allMoves[allMoves.length - 1].setActiveEnPassant(frontRight)
            }
        }
        return allMoves
    }

}

class Rook extends Piece {

    constructor(color) {
        super(color, PieceType.ROOK)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position(0, 1),
            new Position(0, -1),
            new Position(1, 0),
            new Position(-1, 0)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            while (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                currentPos = currentPos.addPos(direction)
            }
            let currPiece = board.get(currentPos)
            if (currPiece && currPiece.color == this.oppositeColor) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            }
        }
        return allMoves
    }

}

class Bishop extends Piece {
    
    constructor(color) {
        super(color, PieceType.BISHOP)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 1),
            new Position( 1,-1),
            new Position(-1, 1),
            new Position(-1,-1)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            while (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                currentPos = currentPos.addPos(direction)
            }
            let currPiece = board.get(currentPos)
            if (currPiece && currPiece.color == this.oppositeColor) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            }
        }
        return allMoves
    }

}

class Queen extends Piece {
    
    constructor(color) {
        super(color, PieceType.QUEEN)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 1),
            new Position( 1,-1),
            new Position(-1, 1),
            new Position(-1,-1),
            new Position( 0, 1),
            new Position( 0,-1),
            new Position( 1, 0),
            new Position(-1, 0)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            while (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                currentPos = currentPos.addPos(direction)
            }
            let currPiece = board.get(currentPos)
            if (currPiece && currPiece.color == this.oppositeColor) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            }
        }
        return allMoves
    }

}

class Knight extends Piece {

    constructor(color) {
        super(color, PieceType.KNIGHT)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 2),
            new Position( 2, 1),
            new Position(-1, 2),
            new Position(-2, 1),
            new Position( 1,-2),
            new Position( 2,-1),
            new Position(-1,-2),
            new Position(-2,-1)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            if (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            } else {
                let currPiece = board.get(currentPos)
                if (currPiece && currPiece.color == this.oppositeColor) {
                    allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                }
            }
        }
        return allMoves
    }

}

class King extends Piece {

    constructor(color) {
        super(color, PieceType.KING)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 1),
            new Position( 1,-1),
            new Position(-1, 1),
            new Position(-1,-1),
            new Position( 0, 1),
            new Position( 0,-1),
            new Position( 1, 0),
            new Position(-1, 0)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            if (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            } else {
                let currPiece = board.get(currentPos)
                if (currPiece && currPiece.color == this.oppositeColor) {
                    allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                }
            }
        }
        if (board.castling[this.color][CastlingType.KINGSIDE]) {
            if (board.isFree(new Position(pos.x + 2, pos.y))) {
                if (board.isFree(new Position(pos.x + 1, pos.y))) {
                    allMoves.push(new Move()
                                        .setStart(pos)
                                        .setEnd(new Position(pos.x + 2, pos.y))
                                        .setCastling(CastlingType.KINGSIDE))
                }
            }
        }
        if (board.castling[this.color][CastlingType.QUEENSIDE]) {
            if (board.isFree(new Position(pos.x - 3, pos.y))) {
                if (board.isFree(new Position(pos.x - 2, pos.y))) {
                    if (board.isFree(new Position(pos.x - 1, pos.y))) {
                        allMoves.push(new Move()
                                            .setStart(pos)
                                            .setEnd(new Position(pos.x - 2, pos.y))
                                            .setCastling(CastlingType.QUEENSIDE))
                    }
                }
            }
        }
        return allMoves
    }

}

class ChessBoard {

    constructor(fenStr) {
        this.board = new Array(8)
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array(8)
            for (let j = 0; j < 8; j++) {
                this.board[i][j] = new Piece(ColorType.NONE, PieceType.NONE)
            }
        }

        this.castling = {
            [ColorType.WHITE]: {
                [CastlingType.KINGSIDE]: true,
                [CastlingType.QUEENSIDE]: true
            },
            [ColorType.BLACK]: {
                [CastlingType.KINGSIDE]: true,
                [CastlingType.QUEENSIDE]: true
            }
        }
        this.enPassant = null
        this.halfMoveClock = 0
        this.fullMoveClock = 1
        this.fen = fenStr
        this.computerColor = ColorType.BLACK
        this.LEGALMOVES = Object()
        this.PSEUDOLEGALMOVES = Object()
        this.whiteToMove = true
        this.parseFen(fenStr)
    }

    get playerColor() {
        return oppositeColor(this.computerColor)
    }

    isFree(pos) {
        let piece = this.get(pos)
        if (!piece) {
            return null
        }
        return piece.color == ColorType.NONE
    }

    get(pos) {
        if (pos.x < 0 || pos.x > 7 || pos.y < 0 || pos.y > 7) {
            return null
        }
        return this.board[pos.y][pos.x]
    }

    set(pos, piece) {
        this.board[pos.y][pos.x] = piece
    }

    getPsuedoLegalMoves(color) {
        if (this.PSEUDOLEGALMOVES[this.toFen() + color]) {
            return this.PSEUDOLEGALMOVES[this.toFen() + color]
        }
        let allMoves = Array()
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == color) {
                    let moves = piece.getMoves(this, new Position(j, i))
                    allMoves = allMoves.concat(moves)
                }
            }
        }
        this.PSEUDOLEGALMOVES[this.toFen() + color] = allMoves
        return allMoves
    }

    makeMove(move) {
        this.whiteToMove = !this.whiteToMove
        let moveInfo = {
            startPiece: this.get(move.start),
            endPiece: this.get(move.end),
            extraMove: null,
            extraMoveStart: null,
            extraMoveEnd: null,
            prevEnPassant: (this.enPassant) ? this.enPassant.copy() : null,
            removedPiece: null,
            removedPiecepos: null,
            prevCastling: {
                [ColorType.WHITE]: {
                    [CastlingType.KINGSIDE]: this.castling[ColorType.WHITE][CastlingType.KINGSIDE],
                    [CastlingType.QUEENSIDE]: this.castling[ColorType.WHITE][CastlingType.QUEENSIDE]
                },
                [ColorType.BLACK]: {
                    [CastlingType.KINGSIDE]: this.castling[ColorType.BLACK][CastlingType.KINGSIDE],
                    [CastlingType.QUEENSIDE]: this.castling[ColorType.BLACK][CastlingType.QUEENSIDE]
                }
            }
        }
        let piece = this.get(move.start)
        this.set(move.start, new Piece(ColorType.NONE, PieceType.NONE))
        this.set(move.end, piece)

        if (move.castling) {
            if (move.castling == CastlingType.KINGSIDE) {
                moveInfo.extraMove = new Move().setStart(move.end.addX(1)).setEnd(move.end.addX(-1))
                moveInfo.extraMoveStart = this.get(move.end.addX(1))
                moveInfo.extraMoveEnd = this.get(move.end.addX(-1))
                this.set(move.end.addX(-1), this.get(move.end.addX(1)))
                this.set(move.end.addX(1), new Piece(ColorType.NONE, PieceType.NONE))
            } else if (move.castling == CastlingType.QUEENSIDE) {
                moveInfo.extraMove = new Move().setStart(move.end.addX(-2)).setEnd(move.end.addX(1))
                moveInfo.extraMoveStart = this.get(move.end.addX(-2))
                moveInfo.extraMoveEnd = this.get(move.end.addX(1))
                this.set(move.end.addX(1), this.get(move.end.addX(-2)))
                this.set(move.end.addX(-2), new Piece(ColorType.NONE, PieceType.NONE))
            }
        }

        if (move.promotion) {
            this.set(move.end, new Queen(piece.color))
        }

        if (move.activeEnPassant) {
            let forward = (piece.color == ColorType.WHITE) ? 1 : -1
            moveInfo.removedPiece = this.get(move.end.addY(forward))
            this.set(move.end.addY(forward), new Piece(ColorType.NONE, PieceType.NONE))
            moveInfo.removedPiecepos = move.end.addY(forward)
        }

        if (this.enPassant) {
            this.enPassant = null
        }

        if (move.enPassant) {
            this.enPassant = move.enPassant
        }

        if (piece.type == PieceType.KING) {
            this.castling[piece.color][CastlingType.KINGSIDE] = false
            this.castling[piece.color][CastlingType.QUEENSIDE] = false
        }

        if (piece.type == PieceType.ROOK) {
            if (move.start.x == 0) {
                this.castling[piece.color][CastlingType.QUEENSIDE] = false
            } else if (move.start.x == 7) {
                this.castling[piece.color][CastlingType.KINGSIDE] = false
            }
        }

        return moveInfo
    }

    unmakeMove(move, moveInfo) {
        this.whiteToMove = !this.whiteToMove
        this.set(move.start, moveInfo.startPiece)
        this.set(move.end, moveInfo.endPiece)

        this.castling = moveInfo.prevCastling
        this.enPassant = moveInfo.prevEnPassant

        if (move.castling) {
            this.set(moveInfo.extraMove.start, moveInfo.extraMoveStart)
            this.set(moveInfo.extraMove.end, moveInfo.extraMoveEnd)
        }

        if (move.activeEnPassant) {
            this.set(moveInfo.removedPiecepos, moveInfo.removedPiece)
        }
    }

    isCheck(chosenColor=null) {
        let color = (chosenColor) ? chosenColor : (this.whiteToMove ? ColorType.BLACK : ColorType.WHITE)
        let moves = this.getPsuedoLegalMoves(oppositeColor(color))
        for (let i = 0; i < moves.length; i++) {
            let endPos = this.get(moves[i].end)
            if (endPos.color == color && endPos.type == PieceType.KING) {
                return true
            }
        }
        return false
    }

    generateMoves(color) {
        if (this.LEGALMOVES[this.toFen() + color]) {
            return this.LEGALMOVES[this.toFen() + color]
        }
        let allMoves = Array()
        for (let move of this.getPsuedoLegalMoves(color)) {
            let moveInfo = this.makeMove(move)
            if (!this.isCheck()) {
                allMoves.push(move)
            }
            this.unmakeMove(move, moveInfo)
        }
        this.LEGALMOVES[this.toFen() + color] = allMoves
        return allMoves
    }

    parseFen(fenStr) {
        function pieceFromChar(char) {
            switch (char) {
                case 'P': return new Pawn(ColorType.WHITE)
                case 'N': return new Knight(ColorType.WHITE)
                case 'B': return new Bishop(ColorType.WHITE)
                case 'R': return new Rook(ColorType.WHITE)
                case 'Q': return new Queen(ColorType.WHITE)
                case 'K': return new King(ColorType.WHITE)
                case 'p': return new Pawn(ColorType.BLACK)
                case 'n': return new Knight(ColorType.BLACK)
                case 'b': return new Bishop(ColorType.BLACK)
                case 'r': return new Rook(ColorType.BLACK)
                case 'q': return new Queen(ColorType.BLACK)
                case 'k': return new King(ColorType.BLACK)
                default: return new Piece(ColorType.NONE, PieceType.NONE)
            }
        }
        let split = fenStr.split(' ')
        let fenPieces = {
            piecePos: split[0],
            color: split[1],
            castle: split[2],
            enPassant: split[3],
            halfMoveClock: split[4],
            fullMoveClock: split[5]
        }

        let currPos = new Position(0, 0)
        for (let char of fenPieces.piecePos) {
            let piece = pieceFromChar(char)
            if (piece.color == ColorType.NONE && String(char).match(/[1-8]/)) {
                currPos.x += parseInt(char)
            } else if (piece.color == ColorType.NONE && char == '/') {
                currPos.x = 0
                currPos.y++
            } else {
                this.set(currPos, piece)
                currPos.x++
            }
        }

        this.whiteToMove = fenPieces.color == "w"
        this.castling = {
            [ColorType.WHITE]: {
                [CastlingType.KINGSIDE]: (fenPieces.castle.indexOf('K') != -1),
                [CastlingType.QUEENSIDE]: (fenPieces.castle.indexOf('Q') != -1)
            },
            [ColorType.BLACK]: {
                [CastlingType.KINGSIDE]: (fenPieces.castle.indexOf('k') != -1),
                [CastlingType.QUEENSIDE]: (fenPieces.castle.indexOf('q') != -1)
            }
        }
        if (fenPieces.enPassant != "-")
            this.enPassant = Position.fromString(fenPieces.enPassant)
        this.halfMoveClock = parseInt(fenPieces.halfMoveClock)
        this.fullMoveClock = parseInt(fenPieces.fullMoveClock)
    }

    toNiceString() {
        let alphabet = "87654321"
        let lineString = "  +---+---+---+---+---+---+---+---+\n"
        for (let i = 0; i < 8; i++) {
            lineString += alphabet[i] + " | "
            for (let j = 0; j < 8; j++) {
                lineString += this.board[i][j].toString() + " | "
            }
            if (i != 7) {
                lineString += "\n  +---+---+---+---+---+---+---+---+\n"
            } else {
                lineString += "\n  +---+---+---+---+---+---+---+---+\n"
            }
        }
        lineString += "    a   b   c   d   e   f   g   h \n"
        return lineString
    }

    purePieceEvaluation() {
        let whiteScore = 0
        let blackScore = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == ColorType.WHITE) {
                    whiteScore += piece.value
                } else if (piece.color == ColorType.BLACK) {
                    blackScore += piece.value
                }
            }
        }
        return (whiteScore - blackScore) * (this.whiteToMove ? 1 : -1)
    }

    castlingEvaluation() {
        let whiteScore = 0
        if (this.castling[ColorType.WHITE][CastlingType.KINGSIDE]) {
            whiteScore += 1
        }
        if (this.castling[ColorType.WHITE][CastlingType.QUEENSIDE]) {
            whiteScore += 1
        }
        if (this.castling[ColorType.BLACK][CastlingType.KINGSIDE]) {
            whiteScore -= 1
        }
        if (this.castling[ColorType.BLACK][CastlingType.QUEENSIDE]) {
            whiteScore -= 1
        }
        return whiteScore * (this.whiteToMove ? 1 : -1)
    }

    enPassantEvaluation() {
        let whiteScore = 0
        if (this.enPassant) {
            whiteScore += 1
        }
        return whiteScore * (this.whiteToMove ? 1 : -1)
    }

    centerControlEvaluation() {
        let whiteScore = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == ColorType.WHITE) {
                    whiteScore += centerHeatmap[i][j]
                }
            }
        }
        return whiteScore * (this.whiteToMove ? 1 : -1)
    }

    getKingPosition(color) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == color && piece.type == PieceType.KING) {
                    return new Position(j, i)
                }
            }
        }
        return null
    }

    evaluate() {
        let evaluation = this.purePieceEvaluation() * 100
        evaluation += this.castlingEvaluation() * 10 // max 20
        evaluation +=  this.enPassantEvaluation() * 10 // max 10
        evaluation += this.centerControlEvaluation() * 10 // max 20
        return evaluation
    }

    get movingColor() {
        return this.whiteToMove ? ColorType.WHITE : ColorType.BLACK
    }

    calcMove(depth, alpha=-Infinity) {
        if (depth == 0) {
            return {
                score: this.evaluate(),
                move: null
            }
        }

        let moves = this.generateMoves(this.movingColor)
        let bestMove = null
        if (moves.length == 0) {
            if (this.isCheck()) {
                return {
                    score: -Infinity,
                    move: null
                }
            }
            return {
                score: 0,
                move: null
            }
        }
        for (let move of moves) {
            let moveInfo = this.makeMove(move)
            let score = -this.calcMove(depth - 1).score
            this.unmakeMove(move, moveInfo)
            if (score > alpha || (score == alpha && bestMove == null)) {
                alpha = score
                bestMove = move
            }
        }
        return {
            move: bestMove,
            score: alpha
        }
    }

    toFen() {
        let tempCount = 0
        let outStr = ""
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let currPos = new Position(j, i)
                if (this.isFree(currPos)) {
                    tempCount++
                } else {
                    if (tempCount > 0) {
                        outStr += tempCount.toString()
                        tempCount = 0
                    }
                    let piece = this.get(currPos)
                    outStr += piece.toString()
                }
            }
            if (tempCount > 0) {
                outStr += tempCount.toString()
                tempCount = 0
            }
            outStr += "/"
        }
        outStr = outStr.slice(0, -1) + " "
        outStr += this.whiteToMove ? "w " : "b "
        let castleString = ""
        if (this.castling[ColorType.WHITE][CastlingType.KINGSIDE]) {
            castleString += "K"
        }
        if (this.castling[ColorType.WHITE][CastlingType.QUEENSIDE]) {
            castleString += "Q"
        }
        if (this.castling[ColorType.BLACK][CastlingType.KINGSIDE]) {
            castleString += "k"
        }
        if (this.castling[ColorType.BLACK][CastlingType.QUEENSIDE]) {
            castleString += "q"
        }
        if (castleString == "") {
            castleString = "-"
        }
        outStr += `${castleString} `
        if (this.enPassant) {
            outStr += this.enPassant.toString()
        } else {
            outStr += "-"
        }
        outStr += ` ${this.halfMoveClock} ${this.fullMoveClock}`
        return outStr
    }

}

terminal.addCommand("chess", async function() {
    let board = new ChessBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

    function makeComputerMove() {
        let bestMove = board.calcMove(3)
        if (!bestMove.move) {
            terminal.printLine("Checkmate!")
            return
        }
        board.makeMove(bestMove.move)
    }

    async function getPlayerMove() {
        let inp = await terminal.prompt("Your Move: ")
        if (!/^[abcdefgh][1-8]\-[abcdefgh][1-8]$/.test(inp)) {
            terminal.printLine("Invalid move format!")
            return getPlayerMove()
        }
        let move = Move.fromString(inp)
        if (!board.generateMoves(board.playerColor).find(m => m.equals(move))) {
            terminal.printLine("Illegal move!")
            return getPlayerMove()
        }
        return move
    }

    terminal.printLine("example move: 'd2-d4'")

    while (board.generateMoves(board.movingColor).length != 0) {
        terminal.printLine(board.toNiceString())
        let playerMove = await getPlayerMove()
        board.makeMove(playerMove)
        makeComputerMove()
    }
    
}, {
    description: "play a game of chess against the computer",
    isGame: true
})
// ------------------- clear.js --------------------
terminal.addCommand("clear", async function() {
    terminal.clear(true)
}, {
    description: "clear the terminal"
})
// ------------------- clock.js --------------------
terminal.addCommand("clock", async function(args) {
    let displayMillis = !!args.m
    let gridSize = {
        x: 20*1.9,
        y: 20
    }
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))
    let containerDiv = null
    function printGrid() {
        const customColors = {
            "x": Color.COLOR_1,
            "#": Color.WHITE,
            "w": Color.ORANGE,
            ".": Color.rgb(50, 50, 50),
            "o": Color.LIGHT_GREEN,
            "s": Color.hex("a4a4c7")
        }
        let prevContainerDiv = containerDiv
        let tempNode = terminal.parentNode
        terminal.parentNode = document.createElement("div")
        containerDiv = terminal.parentNode
        tempNode.appendChild(containerDiv)
        terminal.printLine()
        for (let row of grid) {
            for (let item of row) {
                if (Object.keys(customColors).includes(item)) {
                    terminal.print(item, customColors[item])
                } else {
                    terminal.print(item)
                }
            }
            terminal.printLine()
        }
        if (prevContainerDiv) prevContainerDiv.remove()
        terminal.parentNode = tempNode
    }
    function drawIntoGrid(x, y, v) {
        let gridX = Math.round((x - -1) / (1 - -1) * (gridSize.x - 1))
        let gridY = Math.round((y - -1) / (1 - -1) * (gridSize.y - 1))
        if (gridX < 0 || gridX >= gridSize.x || gridY < 0 || gridY >= gridSize.y) {
            return
        }
        grid[gridSize.y - 1 - gridY][gridX] = v
    }
    function drawCircle(val, radius=1) {
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            let x = Math.sin(t) * radius
            let y = Math.cos(t) * radius
            drawIntoGrid(x, y, val)
        }
    }
    function drawLine(angle, val, maxVal=1) {
        for (let t = 0; t < maxVal; t += 0.01) {
            let x = Math.sin(angle * Math.PI * 2) * t
            let y = Math.cos(angle * Math.PI * 2) * t
            drawIntoGrid(x, y, val)
        }
    }
    function update() {
        let date = new Date()
        let mins = date.getHours() * 60 + date.getMinutes()
        for (let r = 0; r < 1; r += 0.05) {
            drawCircle(".", r)
        }
        drawCircle("#")
        if (displayMillis)
            drawLine(date.getMilliseconds() / 1000, "s", 0.9)
        drawLine((mins % 720) / 720, "w", 0.75)
        drawLine(date.getMinutes() / 60, "x", 0.9)
        drawLine(date.getSeconds() / 60, "o", 0.9)
        printGrid()
        terminal.scroll("auto")
    }
    while (true) {
        update()
        await sleep(displayMillis ? 40 : 1000)
    }
}, {
    description: "display a clock",
    args: {
        "?m=millis:b": "display milliseconds"
    }
})


// ------------------- cmatrix.js --------------------
terminal.addCommand("cmatrix", async function(args) {
    function makeCMatrix(makeWindow) {
        const terminalWindow = makeWindow({name: "CMatrix", fullscreen: !args.nf})
        const CANVAS = terminalWindow.CANVAS
        const CONTEXT = terminalWindow.CONTEXT
    
        let CHARWIDTH = CONTEXT.measureText("A").width * 1.8
    
        function drawChar(x, y, char, color="lime") {
            CONTEXT.fillStyle = "black"
            CONTEXT.clearRect(x - 1, y - 1, CHARWIDTH + 1, 22)
            CONTEXT.fillStyle = color
            CONTEXT.fillText(char, x, y)
        }
    
        function randomChar() {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\"'!@#$%^&*()_+-=[]{}|;:<>?,./\\"
            return chars.charAt(Math.floor(Math.random() * chars.length))
        }
    
        let snakePos = []
        let snakeTypes = []
    
        function updateSnakes() {
            for (let i = 0; i < snakePos.length; i++) {
                if (!snakePos[i]) continue
                let c = snakeTypes[i] ? " " : randomChar()
                if (!snakeTypes[i])
                    drawChar(snakePos[i][0], snakePos[i][1] + 25, c, "white")
                drawChar(snakePos[i][0], snakePos[i][1], c)
                snakePos[i][1] += 20
                if (snakePos[i][1] > CANVAS.height) {
                    snakePos.splice(i, 1)
                    snakeTypes.splice(i, 1)
                    i--
                }
            }
        }
    
        function addSnake() {
            let maxX = parseInt(CANVAS.width / CHARWIDTH)
            let x = Math.floor(Math.random() * maxX) * CHARWIDTH
            snakePos.push([x, 0])
            snakeTypes.push(Math.random() < 0.5)
        }
        
        let intervalFunc = setInterval(function() {
            updateSnakes()
            let rndm = Math.random() * 10
            for (let i = 0; i < rndm; i++) {
                addSnake()
            }
        }, 30)
    
        return [terminalWindow, intervalFunc]
    }

    await terminal.modules.load("window", terminal)
    let [terminalWindow, intervalFunc] = makeCMatrix(terminal.modules.window.make)
    let stopped = false
    terminal.onInterrupt(() => {
        clearInterval(intervalFunc)
        terminalWindow.close()
        stopped = true
    })
    while (!stopped)
        await sleep(100)
}, {
    description: "show the matrix",
    args: {
        "?nf=not-fullscreen:b": "make the window fullscreen"
    }
})


// ------------------- cmdnotfound.js --------------------
terminal.addCommand("cmdnotfound", async function([commandName, argText]) {
    const maxDistance = 2

    let commandNames = Object.keys(terminal.commandData)
    let distances = Object.fromEntries(commandNames.map(name => [name, levenshteinDistance(commandName, name)]))
    let bestMatch = commandNames.reduce((a, b) => distances[a] < distances[b] ? a : b)

    terminal.printLine(`command not found: ${commandName}`)

    if (distances[bestMatch] <= maxDistance) {
        terminal.print("did you mean: ")
        terminal.printCommand(bestMatch, `${bestMatch}${argText}`)
    }
}, {
    description: "display that a command was not found",
    rawArgMode: true,
    isSecret: true
})
// ------------------- code.js --------------------
const jsKeywords = [
    "abstract", "arguments", "await*", "boolean",
    "break", "byte", "case", "catch",
    "class*", "const", "continue",
    "debugger", "default", "delete", "do",
    "double", "else", "enum*", "eval",
    "export*", "extends*", "false", "final",
    "finally", "float", "for", "function",
    "goto", "if", "implements", "import*",
    "in", "instanceof", "int", "interface",
    "let*", "long", "native", "new",
    "null", "package", "private", "protected",
    "public", "return", "short", "static",
    "super*", "switch", "synchronized", "this",
    "throw", "throws", "transient", "true",
    "try", "typeof", "var", "void",
    "volatile", "while", "with", "yield",
    "abstract", "boolean", "byte",
    "double", "final", "float", "goto",
    "int", "long", "native", "short",
    "synchronized", "throws", "transient", "volatile",
    "Array", "Date", "eval", "function",
    "hasOwnProperty", "Infinity", "isFinite", "isNaN",
    "isPrototypeOf", "length", "Math", "NaN",
    "name", "Number", "Object", "prototype",
    "String", "toString", "undefined", "valueOf",
    "let", "yield", "enum", "await",
    "implements", "package", "protected", "static",
    "interface", "private", "public",
    "null", "true", "false",
    "var", "let", "const", "function",
]

const structureTokens = [
    "if", "(", ")", "{", "}",
    "[", "]", "yield", "await", "for", "while",
    "do", "switch", "case", "default", "try",
    "catch", "finally", "class", "extends",
    "implements", "interface", "package",
    "private", "protected", "public", "static",
    "import", "export", "from", "as", "return",
    "break", "continue", "debugger", "delete",
    "in", "instanceof", "new", "typeof", "void",
    "with", "super", "this", "throw", "throws",
    "else", "of"
]

const specialWords = [
    "terminal"
]

const jsSymbols = [
    "{", "}", "(", ")", "[", "]",
    ".", ";", ",", "<", ">", "=",
    "+", "-", "*", "%", "&", "|",
    "^", "!", "~", "?", ":", "/",
    "\\", "&&", "||", "++", "--", "<<",
    ">>", ">>>", "<=", ">=", "==", "!=",
    "===", "!==", "+=", "-=", "*=", "%=",
    "<<=", ">>=", ">>>=", "&=", "^=", "|=",
    "=>", "...",
]

const cat = `                        _
                       | \\
                       | |
                       | |
  |\\                   | |
 /, ~\\                / /
X     \`-.....-------./ /
 ~-.                   |
    \\                 /
    \\  /_     ~~~\\   /
     | /\\ ~~~~~   \\ |
     | | \\        || |
     | |\\ \\       || )
     (_/ (_/      ((_/`

terminal.addCommand("code", async function(args) {
    if (!terminal.commandExists(args.command))
        throw new Error(`Command "${args.command}" does not exist`)
    let command = await terminal.getCommand(args.command)
    let code = command.callback.toString()

    // https://github.com/noel-friedrich/terminal/issues/6
    if (args.command == "cat") {
        terminal.printEasterEgg("Cat-Egg")
        return terminal.printLine(cat)
    }

    function printJSCode(rawCode) {
        const isLetter = char => /[a-zA-Z]/.test(char)
        const isApostrophe = char => RegExp("['\"`]").test(char)
        const isNumber = text => !isNaN(parseInt(text))
        const isClass = text => isLetter(text[0]) && text[0] == text[0].toUpperCase()

        function tokenize(text) {
            let tokens = []
            let tempToken = ""
            for (let char of text) {
                if (isLetter(char)) {
                    tempToken += char
                } else {
                    if (tempToken != "") {
                        tokens.push(tempToken)
                        tempToken = ""
                    }
                    tokens.push(char)
                }
            }
            if (tempToken != "")
                tokens.push(tempToken)
            return tokens.map(token => [token, Color.WHITE])
        }

        let tokenColors = tokenize(rawCode)

        const commentColor = Color.hex("#F7AEF8")
        const stringColor = Color.hex("#B388EB")
        const keywordColor = Color.hex("#8093F1")
        const numberColor = Color.hex("#72DDF7")
        const symbolColor = Color.hex("#96E6B3")
        const specialColor = Color.hex("#D36060")
        const structureColor = Color.hex("#DBD3AD")
        const classColor = Color.hex("#F6C177")

        let inApostrophe = false
        let inLineComment = false
        let i = 0
        for (let [token, color] of tokenColors) {
            if (isNumber(token))
                color = numberColor
            if (jsKeywords.includes(token))
                color = keywordColor
            if (jsSymbols.includes(token))
                color = symbolColor
            if (specialWords.includes(token))
                color = specialColor
            if (structureTokens.includes(token))
                color = structureColor
            if (isClass(token))
                color = classColor

            let prevToken = (tokenColors[i - 1] ?? ["", Color.WHITE])[0]
            let prevTokenIsBlocker = prevToken == "\\"
            
            if (isApostrophe(token) && !inApostrophe && !prevTokenIsBlocker) {
                inApostrophe = token
                color = stringColor
            } else if (token === inApostrophe && !prevTokenIsBlocker) {
                inApostrophe = false
                color = stringColor
            } else if (inApostrophe) {
                color = stringColor
            }

            let nextToken = (tokenColors[i + 1] ?? ["", Color.WHITE])[0]
            if (token == "/" && nextToken == "/" && !inApostrophe) {
                inLineComment = true
                color = commentColor
            } else if (token == "\n" && inLineComment) {
                inLineComment = false
                color = commentColor
            } else if (inLineComment) {
                color = commentColor
            }

            if (token == "\n") {
                inApostrophe = false
                inLineComment = false
            }

            // consider this an easteregg
            // congrats if you found it

            terminal.print(token, color)
            i++
        }
    }

    printJSCode(code)

    printJSCode(", " + JSON.stringify(command.info, null, 4))
    terminal.addLineBreak()

    if (args.command == "code") {
        terminal.printEasterEgg("Codeception-Egg")
    }
}, {
    description: "show the source code of a command",
    args: {
        "command": "the command to show the source code of"
    }
})
// ------------------- collatz.js --------------------
terminal.addCommand("collatz", async function(args) {
	let currNum = args.n

	if (currNum < 1) {
		throw new Error("Number must not be below 1")
	}

	let output = ""
	let stepCount = 0
	
	output += currNum + "\n"
	while (currNum != 1) {
		if (stepCount >= args.m) {
			output += "Reached Limit"
			terminal.printLine(output)
			return
		}
		if (currNum % 2 === 0) {
			currNum = currNum / 2
		} else {
			currNum = currNum * 3 + 1
		}
		output += currNum + "\n"
		stepCount++
	}

	terminal.printLine(output)
	terminal.print(`(${stepCount} steps)`)
}, {
	description: "Calculate the Collatz Sequence (3x+1) for a given Number",
	args: {
		"n:i": "the starting number of the sequence",
		"?m=max:i": "max number of steps to print"
	},
	standardVals: {
		m: 999999999999
	}
})
// ------------------- color-test.js --------------------
terminal.addCommand("color-test", function(args) {
    let size = {x: args.size*2, y: args.size}
    for (let i = 0; i < size.y; i++) {
        for (let j = 0; j < size.x; j++) {
            let x = (j / size.x - 0.5) * 2
            let y = (i / size.y - 0.5) * 2
            if (x*x + y*y > 1) {
                terminal.print(" ")
            } else {
                let angle = Math.atan2(y, x) / Math.PI * 180
                let hue = Math.round(angle)
                let lightness = Math.round(90 - (x*x + y*y) * 90)
                terminal.print("#", Color.hsl(hue / 360, 1, lightness / 100))
            }
        }
        terminal.printLine()
    }
}, {
    description: "test the color capabilities of the terminal",
    args: {
        "?size:i:1~999": "the size of the test image"
    },
    defaultValues: {
        size: 60
    }
})
// ------------------- compliment.js --------------------
terminal.addCommand("compliment", function() {
    function startsWithVowel(word) {
        return (
            word.startsWith("a")
            || word.startsWith("e")
            || word.startsWith("i")
            || word.startsWith("o")
            || word.startsWith("u")
        )
    }

    const adjectives = [
        "cool", "fresh", "awesome", "beautiful",
        "fantastic", "good", "wonderful", "colorful"
    ], nouns = [
        "queen", "goddess", "person", "king",
        "god", "human", "princess", "prince"
    ], sentences = [
        "you are a<n> <adjective> <noun>. happy to have you here!",
        "a<n> <adjective> <noun>. that's what you are!",
        "you, <noun>, are <adjective>!",
        "i'm going to call you <noun>, because you are <adjective>"
    ], choice = l => l[Math.floor(Math.random() * l.length)]

    let sentence = choice(sentences)
    let lastAdjective = choice(adjectives)
    while (/.*<(?:adjective|n|noun)>.*/.test(sentence)) {
        sentence = sentence.replace(/<n>/, startsWithVowel(lastAdjective) ? "n": "")
        sentence = sentence.replace(/<adjective>/, lastAdjective)
        sentence = sentence.replace(/<noun>/, choice(nouns))
        lastAdjective = choice(adjectives)
    }
    terminal.printLine(sentence)
}, {
    description: "get info about yourself"
})


// ------------------- contact.js --------------------
const formContainer = document.createElement("div")
const formWidth = "min(25em, 50vw)"

let formInfo = {}

function addInput({
    type="text",
    name=null,
    errorFunc=null,
    placeholder=null,
}={}) {
    const input = document.createElement("input")
    input.setAttribute("type", type)
    if (placeholder) input.setAttribute("placeholder", placeholder)

    if (name) {
        input.setAttribute("name", name)
        formInfo[name] = {
            errorFunc,
            input,
        }
        input.addEventListener("input", validateForm)
    }

    formContainer.appendChild(input)
    input.style.display = "block"
    input.style.margin = "10px"
    input.style.padding = "10px"
    input.style.border = "1px solid var(--foreground)"
    input.style.borderRadius = "5px"
    input.style.width = formWidth

    return input
}

const nameInput = addInput({
    name: "name",
    placeholder: "Name *",
    errorFunc: (value) => {
        if (!value) return "Please enter a name"
        if (value.length > 100) return "Name is too long"
        return ""
    }
})

const emailInput = addInput({
    type: "email",
    name: "email",
    placeholder: "Email *",
    errorFunc: (value) => {
        if (!value) return "Please enter an email"
        if (value.length > 100) return "Email is too long"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Invalid email format"
        return ""
    }
})

const phoneInput = addInput({
    type: "tel",
    name: "phone",
    placeholder: "Phone",
    errorFunc: (value) => {
        if (!value) return ""
        if (value.length > 100) return "Phone is too long"
        const phoneRegex = /^\+?[0-9\s]+$/
        if (!phoneRegex.test(value)) return "Invalid phone format"
        return ""
    }
})

const messageTextarea = document.createElement("textarea")
messageTextarea.setAttribute("name", "message")
messageTextarea.setAttribute("placeholder", "Message *")
formContainer.appendChild(messageTextarea)

messageTextarea.style.display = "block"
messageTextarea.style.margin = "10px"
messageTextarea.style.padding = "10px"
messageTextarea.style.border = "1px solid var(--foreground)"
messageTextarea.style.borderRadius = "5px"
messageTextarea.style.width = formWidth
messageTextarea.style.height = "10em"
messageTextarea.style.resize = "vertical"
messageTextarea.style.backgroundColor = "var(--background)"
messageTextarea.style.color = "var(--foreground)"

formInfo["message"] = {
    errorFunc: (value) => {
        if (!value) return "Please enter a message"
        if (value.length > 1000) return "Message max length is 1000 characters"
        return ""
    },
    input: messageTextarea
}

messageTextarea.addEventListener("input", validateForm)

const errorOutput = document.createElement("div")
errorOutput.style.color = "#ff5555"
errorOutput.style.margin = "10px"
formContainer.appendChild(errorOutput)

const submitButton = document.createElement("div")
submitButton.textContent = "Send Message"
formContainer.appendChild(submitButton)

submitButton.style.display = "block"
submitButton.style.textAlign = "center"
submitButton.style.margin = "10px"
submitButton.style.padding = "10px"
submitButton.style.border = "1px solid var(--foreground)"
submitButton.style.borderRadius = "5px"
submitButton.style.width = formWidth
submitButton.style.backgroundColor = "var(--background)"
submitButton.style.color = "var(--foreground)"
submitButton.style.cursor = "pointer"

submitButton.addEventListener("mouseenter", () => {
    submitButton.style.backgroundColor = "var(--foreground)"
    submitButton.style.color = "var(--background)"
})

submitButton.addEventListener("mouseleave", () => {
    submitButton.style.backgroundColor = "var(--background)"
    submitButton.style.color = "var(--foreground)"
})

function validateForm() {
    for (let [name, info] of Object.entries(formInfo)) {
        const { errorFunc, input } = info
        if (errorFunc) {
            const error = errorFunc(input.value)
            errorOutput.textContent = error
            if (error) {
                return false
            }
        }
    }
    return true
}

validateForm()

submitButton.addEventListener("click", async () => {
    if (!validateForm()) {
        errorOutput.animate([
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(0px)" },
        ], {
            duration: 500,
            iterations: 1,
        })
        return
    }

    let submitUrl = terminal.baseUrl + "./api/contact.php"
    let formData = new FormData()
    for (let [name, info] of Object.entries(formInfo)) {
        formData.append(name, info.input.value)
    }
    const response = await fetch(submitUrl, {
        method: "POST",
        body: formData,
    })
    const data = await response.json()
    if (data.ok) {
        formSuccessful = true
    } else {
        errorOutput.textContent = data.error
    }
})

let formSuccessful = false

terminal.addCommand("contact", async function(args) {
    formSuccessful = false
    terminal.parentNode.appendChild(formContainer)

    terminal.scroll()

    setTimeout(() => nameInput.focus(), 300)
    
    while (!formSuccessful) await sleep(1000)

    terminal.printSuccess("Message sent!")
    terminal.printLine("I'll get back to you as soon as possible.")
    formContainer.remove()

    for (let [name, info] of Object.entries(formInfo)) {
        info.input.value = ""
    }
}, {
    description: "Open contact form",
})
// ------------------- copy.js --------------------
terminal.addCommand("copy", async function(rawArgs) {
    rawArgs = rawArgs.trim()
    if (terminal.parser.isVariable(rawArgs)) {
        let name = terminal.parser.extractVariableName(rawArgs + "=")
        let value = terminal.getVariableValue(name)
        await terminal.copy(value)
    } else if (terminal.fileExists(rawArgs)) {
        let file = terminal.getFile(rawArgs)
        if (file.isDirectory)
            throw new Error("Cannot copy a folder")
        await terminal.copy(file.content)
        terminal.printLine("Copied File to Clipboard ✓")
    } else {
        await terminal.copy(rawArgs)
        terminal.printLine("Copied to Clipboard ✓")
    }
}, {
    description: "copy the file content to the clipboard",
    rawArgMode: true
})
// ------------------- coville.js --------------------
terminal.addCommand("coville", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../coville/",
        name: "Covid in Coville",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "interactive virus simulation (in german)",
    isSecret: true,
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- cowsay.js --------------------
const COW_SAY = ` 
\\   ^__^
 \\  (oo)\\_______
    (__)\       )\\/\\
        ||----w |
        ||     ||
`

terminal.addCommand("cowsay", function(args) {
    const message = args.message
    const bubbleWidth = Math.min(40, message.length)

    function splitIntoLines(text, width=bubbleWidth) {
        let lines = []
        let line = String()
        for (let word of text.split(" ")) {
            if (line.length + word.length > width) {
                lines.push(line)
                line = String()
            }
            line += word + " "
        }
        lines.push(line)
        return lines
    }

    let lines = splitIntoLines(args.message).map(l => l.trim())

    let output = String()

    output += " " + stringMul("-", bubbleWidth + 2) + "\n"
    let i = 0
    for (let line of lines) {
        let leftChar = "|"
        let rightChar = "|"
        i++

        if (lines.length >= 3) {
            if (i == 1) {
                leftChar = "/"
                rightChar = "\\"
            } else if (i == lines.length) {
                leftChar = "\\"
                rightChar = "/"
            }
        } else if (lines.length == 1) {
            leftChar = "<"
            rightChar = ">"
        }

        output += `${leftChar} ${stringPadMiddle(line, bubbleWidth)} ${rightChar}\n`
    }
    output += " " + stringMul("-", bubbleWidth + 2) + "\n"
    output = output.slice(0, -1)
    for (let line of COW_SAY.split("\n")) {
        let amountSpaces = Math.max(4, Math.min(message.length, bubbleWidth - 20) + 4)
        output += " ".repeat(amountSpaces) + line + "\n"
    }
    terminal.printLine(output.slice(0, -3))

    if (/[mM][uU]+[hH]|[mM][oO]+/.test(args.message)) {
        terminal.printEasterEgg("Moo-Egg")
    }
}, {
    description: "let the cow say something",
    args: ["*message"]
})
// ------------------- cowthink.js --------------------
const COW_SAY = ` 
o   ^__^
 o  (oo)\\_______
    (__)\       )\\/\\
        ||----w |
        ||     ||
`

terminal.addCommand("cowthink", function(args) {
    const message = args.thought
    const bubbleWidth = Math.min(40, message.length)

    function splitIntoLines(text, width=bubbleWidth) {
        let lines = []
        let line = String()
        for (let word of text.split(" ")) {
            if (line.length + word.length > width) {
                lines.push(line)
                line = String()
            }
            line += word + " "
        }
        lines.push(line)
        return lines
    }

    let lines = splitIntoLines(message).map(l => l.trim())

    let output = String()

    output += " " + stringMul("-", bubbleWidth + 2) + "\n"
    let i = 0
    for (let line of lines) {
        let leftChar = "("
        let rightChar = ")"
        i++

        if (lines.length >= 3) {
            if (i == 1) {
                leftChar = "/"
                rightChar = "\\"
            } else if (i == lines.length) {
                leftChar = "\\"
                rightChar = "/"
            }
        } else if (lines.length == 1) {
            leftChar = "("
            rightChar = ")"
        }

        output += `${leftChar} ${stringPadMiddle(line, bubbleWidth)} ${rightChar}\n`
    }
    output += " " + stringMul("-", bubbleWidth + 2) + "\n"
    output = output.slice(0, -1)
    for (let line of COW_SAY.split("\n")) {
        let amountSpaces = Math.max(4, Math.min(message.length, bubbleWidth - 20) + 4)
        output += " ".repeat(amountSpaces) + line + "\n"
    }
    terminal.printLine(output.slice(0, -3))
}, {
    description: "let the cow say something",
    args: ["*thought"]
})
// ------------------- cp.js --------------------
terminal.addCommand("cp", async function(args) {
    let file = terminal.getFile(args.file)
    if (["..", "-"].includes(args.directory)) {
        if (terminal.currFolder == terminal.rootFolder)
            throw new Error("You are already at ground level")
        var directory = terminal.currFolder.parent
    } else if (["/", "~"].includes(args.directory)) {
        var directory = terminal.rootFolder
    } else {
        var directory = terminal.getFile(args.directory, FileType.FOLDER)
    }
    directory.content[file.name] = file.copy()
    await terminal.fileSystem.reload()
}, {
    description: "copy a file",
    args: ["file", "directory"]
})


// ------------------- crossp.js --------------------
terminal.addCommand("crossp", function(args) {
    const x = args.y1 * args.z2 - args.z1 * args.y2
    const y = args.z1 * args.x2 - args.x1 * args.z2
    const z = args.x1 * args.y2 - args.y1 * args.x2

    terminal.printLine(`< ${x}, ${y}, ${z} >`)
}, {
    description: "calculate the cross product of 2 3d vectors",
    args: {
        "x1:n": "the x component of the first vector",
        "y1:n": "the y component of the first vector",
        "z1:n": "the z component of the first vector",
        "x2:n": "the x component of the second vector",
        "y2:n": "the y component of the second vector",
        "z2:n": "the z component of the second vector"
    }
})
// ------------------- curl.js --------------------
terminal.addCommand("curl", async function(args) {
    function corsError() {
        terminal.printError("Cross-origin requests are not allowed")
        terminal.print("What is ")
        terminal.printLink("CORS (Cross-Origin Resource Sharing)", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", undefined, false)
        terminal.printLine("?")
        terminal.printLine("You may only download files from a website that allows it.")
        terminal.print("If you are trying to download a file from a website that you own, you may need to ")
        terminal.printLink("enable CORS", "https://enable-cors.org/server.html", undefined, false)
        terminal.printLine(".")
        terminal.print("An example of a website that allows CORS is ")
        terminal.printLink("wikipedia.org", "https://wikipedia.org", undefined, false)
        terminal.printLine(".\n")
        terminal.printLine("It's also possible that the resource you are requesting does not exist.")
        terminal.printLine("> It may be worth checking the URL for typos.")
        throw new IntendedError()
    }

    try {
        var result = await fetch(args.url)
    } catch (e) {
        if (e instanceof TypeError) {
            corsError()
        } else {
            throw e
        }
    }

    if (result.status !== 200) {
        terminal.printError("Error: " + result.status)
        throw new IntendedError()
    }

    let contentType = result.headers.get("content-type")
    if (!contentType) {
        terminal.printError("No content type")
        throw new IntendedError()
    }

    let dataUrl = await result.blob()
    dataUrl = URL.createObjectURL(dataUrl)
    let fileName = args.url.split("/").pop()
    let file = new DataURLFile(dataUrl)

    if (terminal.fileExists(fileName))
        throw new Error("file already exists in folder")

    terminal.currFolder.content[fileName] = file
    await terminal.fileSystem.reload()

    terminal.printSuccess("download finished.") 
}, {
    description: "download a file from the internet",
    args: {
        "url:s": "the url to download the file from"
    },
    disableEqualsArgNotation: true
})
// ------------------- cw.js --------------------
terminal.addCommand("cw", function(args) {
    if (args.date == "today" || !args.date) {
        args.date = "today"
        const today = new Date()
        var day = today.getDate()
        var month = today.getMonth() + 1
        var year = today.getFullYear()
    } else if (!/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,4}$/.test(args.date)) {
        throw new Error("Invalid date!")
    } else {
        var [day, month, year] = args.date.split(".").map(d => parseInt(d))
    }

    function getCalendarWeek(day, month, year, yearPlus=0) {
        let firstDay = new Date()
        firstDay.setFullYear(year, 0, 4)
        while (firstDay.getDay() != 1) {
            firstDay.setDate(firstDay.getDate() - 1)
        }
        let currDate = firstDay
        let count = 1
        while (currDate.getDate() != day
        || currDate.getMonth() != (month - 1)
        || currDate.getFullYear() != (year + yearPlus)
        ) {
            currDate.setDate(currDate.getDate() + 1)
            count++
            if (count > 400) {
                return 0
            }
        }
        return Math.ceil(count / 7)
    }

    let calendarWeek = getCalendarWeek(day, month, year)
    let iterationCount = 0

    while (calendarWeek == 0) {
        iterationCount += 1
        calendarWeek = getCalendarWeek(
            day, month, year - iterationCount, iterationCount
        )
        if (iterationCount > 3)
            throw new Error("Invalid day!")
    }

    terminal.printLine(`calenderweek of ${args.date}: ${calendarWeek}`)

}, {
    description: "get the calendar week of a date",
    args: {
        "?date": "the date to get the calendar week of"
    },
    standardVals: {
        date: null
    }
})


// ------------------- debug.js --------------------
terminal.addCommand("debug", function(args) {
	if (terminal.debugMode) {
		throw new Error("Debug Mode already activated")
	}

	terminal.debugMode = true
	terminal.printSuccess("Activated Debug Mode")
	terminal.log("Activated Debug Mode")
} ,{
	description: "activate the debug mode to enable untested new features",
	isSecret: true
})
// ------------------- donut.js --------------------
terminal.addCommand("donut", async function() {
    setTimeout(() => terminal.scroll(), 100)
    let commandIsActive = true
    terminal.onInterrupt(() => commandIsActive = false)
    setTimeout(() => {
        if (commandIsActive) {
            terminal.printEasterEgg("Donut-Egg")
        }
    }, 3 * 60 * 1000)

    // mostly copied from original donut.c code

               let p=terminal.
           print(),A=1,B=1,f=()=>{
         let b=[];let z=[];A+=0.07;B
       +=0.03;let s=Math.sin,c=Math.cos
     ,cA=c(A),sA=s(A),cB=c(B),sB=s(B);for(
    let k=0;k<1760;k++){b[k]=k%80==79?"\n":
    " ";z[k]=0;};for        (let j=0;j<6.28;
    j+=0.07){let ct          =c(j),st=s(j);
    for(i=0;i<6.28;          i+=0.02){let sp
    =s(i),cp=c(i),h          =ct+2,D=1/(sp*h
    *sA+st*cA+5),t=sp       *h*cA-st*sA;let
    x=0|(40+30*D*(cp*h*cB-t*sB)),y=0|(12+15
     *D*(cp*h*sB+t*cB)),o=x+80*y,N=0|(8*((st
     *sA-sp*ct*cA)*cB-sp*ct*sA-st*cA-cp*ct
     *sB));if(y<22&&y>=0&&x>=0&&x<79&&D>z
       [o]){z[o]=D;b[o]=".,-~:;=!*#$@"[
          N>0?N:0];}}}p.textContent=b
            .join("")};while(1){f();
              await sleep(30);}

}, {
    description: "display a spinning donut"
})


// ------------------- download.js --------------------
terminal.addCommand("download", function(args) {
    function downloadFile(fileName, file) {
        let element = document.createElement('a')
        if (file.type == FileType.DATA_URL)
            var dataURL = file.content
        else
            var dataURL = 'data:text/plain;charset=utf-8,' + encodeURIComponent(file.content)
        element.setAttribute('href', dataURL)
        element.setAttribute('download', fileName)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot download directory")
    downloadFile(file.name, file)
}, {
    description: "download a file",
    args: {"file": "the file to download"}
})
// ------------------- draw.js --------------------
terminal.addCommand("draw", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../draw/",
        name: "Draw"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start simple drawing app"
})
// ------------------- du.js --------------------
terminal.addCommand("du", function(args) {
    let fileNames = []
    let fileSizes = []
    let totalSize = 0
    function getSizeStr(size) {
        if (size < 10 ** 3) return `${size}B`
        if (size < 10 ** 6) return `${Math.ceil(size / 1024)}kB`
        return `${Math.ceil(size / (1024 ** 2))}mB`
    }
    let targetFolder = terminal.getFile("")
    if (args.folder) {
        targetFolder = terminal.getFile(args.folder)
    }
    for (let [fileName, file] of Object.entries(targetFolder.content)) {
        let fileContent = JSON.stringify(file.toJSON())
        totalSize += fileContent.length
        let fileSize = getSizeStr(fileContent.length)
        if (file.type == FileType.FOLDER)
            fileName += "/"
        fileNames.push(fileName)
        fileSizes.push(fileSize)
    }
    fileNames.unshift("TOTAL")
    fileSizes.unshift(getSizeStr(totalSize))
    let longestSizeLength = fileSizes.reduce((a, e) => Math.max(a, e.length), 0) + 2
    let paddedFileSizes = fileSizes.map(s => stringPadBack(s, longestSizeLength))
    for (let i = 0; i < fileNames.length; i++) {
        if (i == 0) {
            terminal.print(paddedFileSizes[i] + fileNames[i] + "\n", Color.COLOR_1)
        } else {
            terminal.printLine(paddedFileSizes[i] + fileNames[i])
        }
    }
    if (fileNames.length == 0) {
        throw new Error("target-directory is empty")
    }
}, {
    description: "display storage of current directory",
    args: {
        "?folder": "folder to display storage of"
    },
})


// ------------------- easter-eggs.js --------------------
terminal.addCommand("easter-eggs", async function(args) {
    if (args.reset) {
        await terminal.acceptPrompt("Do you really want to reset the easter egg hunt?", false)
        terminal.data.resetProperty("easterEggs")
        return
    }

    terminal.printLine("Welcome to the easter egg hunt.", Color.COLOR_1)
    terminal.printLine("You can find easter eggs all across different")
    terminal.printLine("parts (commands) of this website. An example")
    terminal.printLine("Easter Egg looks like this: (click on it!)")
    terminal.printEasterEgg("Starter-Egg")
    terminal.addLineBreak()
    terminal.printLine("RULES", Color.COLOR_2)
    terminal.printLine("1. You may not look at the source code of this website using your browser.")
    terminal.print("2. You may use the ")
    terminal.printCommand("code", "code", undefined, false)
    terminal.printLine(" command to look at the source code of commands.")
    terminal.printLine("3. You must have fun.")
    terminal.addLineBreak()
    terminal.printLine("YOUR EGGS", Color.COLOR_2)

    let listOutput = terminal.print("", undefined, {forceElement: true})

    function updateList() {
        let output = ""
        let eggs = terminal.data.easterEggs
        let count = 0
        for (let egg of eggs) {
            count++
            output += `${count}: ${egg}\n`
        }
        if (eggs.size == 0)
            output += "< no eggs found (yet) >\n"

        listOutput.textContent = output
    }

    updateList()
    terminal.window.setInterval(updateList, 500)

}, {
    description: "open easter egg hunt",
    args: {
        "?reset:b": "reset easter egg hunt"
    }
})
// ------------------- echo.js --------------------
terminal.addCommand("echo", function(rawArgs) {
    terminal.printLine(rawArgs.slice(1))
}, {
    description: "print a line of text",
    rawArgMode: true,
})
// ------------------- edit.js --------------------
const cssCode = {
    ".editor-parent": {
        "width": "100%",
        "resize": "both",
        "display": "grid",
        "grid-template-rows": "auto 1fr",
        "grid-template-columns": "1fr",
    },

    ".editor-header-title": {
        "width": "fit-content",
        "color": "var(--background)",
        "background": "var(--foreground)",
    },

    ".editor-body": {
        "display": "grid",
        "grid-template-rows": "1fr",
        "grid-template-columns": "auto 1fr",
    },

    ".editor-sidebar": {
        "color": "var(--background)",
        "background": "var(--foreground)",
        "padding-right": "0.1em",
        "padding-left": "0.1em",
    },

    ".editor-content": {
        "outline": "none",
        "padding-right": "0.5em",
        "padding-left": "0.5em",
    },

    ".editor-content > div:focus-visible": {
        "outline": "none",
        "background": "#1d1d1d",
    },
}

function createEditorHTML() {
    let parent = createElement("div", {className: "editor-parent"})
    let header = createElement("div", {className: "editor-header"}, parent)
    let headerTitle = createElement("div", {className: "editor-header-title"}, header)
    let body = createElement("div", {className: "editor-body"}, parent)
    let sidebar = createElement("div", {className: "editor-sidebar"}, body)
    let contentScroll = createElement("div", {className: "editor-content-scroll"}, body)
    let content = createElement("div", {
        className: "editor-content",
        contentEditable: true,
    }, contentScroll)

    return {
        parent, header, headerTitle, body, sidebar, content, contentScroll
    }
}

function implementCSS(code) {
    let style = document.createElement("style")
    for (const [selector, properties] of Object.entries(code)) {
        let css = selector + " {"
        for (const [property, value] of Object.entries(properties))
            css += property + ": " + value + ";"
        css += "}"
        style.innerHTML += css
    }
    terminal.document.head.appendChild(style)
}

let tempFileContent = null
let tempFileName = null
let elements = null
let lineCount = null
let prevLineCount = null
let currentlyEditing = false

function updateLineNums() {
    lineCount = elements.content.childNodes.length

    if (lineCount == 0) {
        elements.sidebar.textContent = "1"
        prevLineCount = lineCount
    } else if (prevLineCount !== lineCount) {
        elements.sidebar.textContent = ""
        for (let i = 0; i < lineCount; i++) {
            let line = createElement("div", {className: "editor-line-num"}, elements.sidebar)
            line.textContent = i + 1
        }
        prevLineCount = lineCount
    }
}

function createElement(tag, props, parent=null) {
    const element = document.createElement(tag)
    for (const [key, value] of Object.entries(props))
        element[key] = value
    if (parent)
        parent.appendChild(element)
    return element
}

function getText() {
    let text = ""
    for (let line of elements.content.querySelectorAll("div")) {
        text += line.textContent + "\n"
    }
    return text.slice(0, -1)
}

function loadContent() {
    let lastElement = null
    for (let line of tempFileContent.split("\n")) {
        let lineElement = createElement("div", {}, elements.content)
        lineElement.textContent = line
        if (lineElement.textContent.trim() == "")
            lineElement.appendChild(document.createElement("br"))
        lastElement = lineElement
    }
    if (lastElement)
        setTimeout(() => lastElement.focus(), 100)
    lineCount = tempFileContent.split("\n").length
    updateLineNums()
}

terminal.addCommand("edit", async function(args) {
    if (terminal.inTestMode) return

    tempFileContent = ""
    tempFileName = "Untitled File"
    currentlyEditing = true
    prevLineCount = null
    elements = createEditorHTML()
    
    if (args.file) {
        let file = terminal.getFile(args.file)
        if (file.type == FileType.FOLDER)
            throw new Error("cannot edit a folder")
        tempFileContent = file.content
        tempFileName = file.path
    }

    implementCSS(cssCode)
    terminal.parentNode.appendChild(elements.parent)

    elements.headerTitle.textContent = tempFileName
    elements.content.addEventListener("input", updateLineNums)
    loadContent()

    terminal.document.addEventListener("keydown", event => {
        // save
        if (event.ctrlKey && event.key == "s") {
            currentlyEditing = false
            event.preventDefault()
        }
    })

    while (currentlyEditing) {
        await sleep(100)
    }

    while (tempFileName == "" || tempFileName == "Untitled File") {
        tempFileName = await terminal.prompt("file name: ")
        while (!terminal.isValidFileName(tempFileName)) {
            terminal.printError("invalid file name")
            tempFileName = await terminal.prompt("file name: ")
        }
    }

    if (terminal.fileExists(tempFileName)) {
        let file = terminal.getFile(tempFileName)
        if (file.type == FileType.FOLDER)
            throw new Error("cannot edit a folder")
        file.content = getText()
    } else {
        terminal.createFile(tempFileName, TextFile, getText())
    }
}, {
    description: "edit a file of the current directory",
    args: {
        "?file": "the file to open",
    }
})


// ------------------- enigma.js --------------------
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
// ------------------- error404.js --------------------
const warningText = `
 _  _    ___  _  _                            _        __                      _ 
| || |  / _ \\| || |                          | |      / _|                    | |
| || |_| | | | || |_              _ __   ___ | |_    | |_  ___ _   _ _ __   __| |
|__   _| | | |__   _|    ____    | '_ \\ / _ \\| __|   |  _|/ _ \\|| | | '_ \\ / _\` |
   | | | |_| |  | |     |____|   | | | | (_) | |_    | | | (_) ||_| | | | | (_| |
   |_|  \\___/   |_|              |_| |_|\\___/ \\__|   |_|  \\___/\\__,_|_| |_|\\__,_|

You have encountered a 404 error. This means that the page you are looking for
does not exist. Maybe you mistyped the URL? Or maybe the page has been moved or
deleted? Either way, you should try to find what you are looking for elsewhere.

To continue to the terminal homepage, press any key.`

terminal.addCommand("error404", async function() {
    terminal.clear(false)
    terminal.printLine(warningText)
    terminal.print("Alternatively, you can use this link: ")
    terminal.printLink("https://noel-friedrich.de/terminal/", "https://noel-friedrich.de/terminal/")

    terminal.window.addEventListener("keydown", () => {
        terminal.href("https://noel-friedrich.de/terminal/")
    })

    return new Promise(resolve => {})
}, {
    description: "Display a 404 error",
    rawArgMode: true
})
// ------------------- eval.js --------------------
terminal.addCommand("eval", async function(argString) {
    await terminal.modules.load("mathenv", terminal)
    let [result, error] = terminal.modules.mathenv.eval(argString)
    if (error) {
        terminal.print("> ")
        terminal.printLine(error)
    } else if (result !== null) {
        terminal.print("> ")
        terminal.printLine(result)
    }
}, {
    description: "evaluate javascript code",
    rawArgMode: true
})
// ------------------- exit.js --------------------
terminal.addCommand("exit", function() {
    terminal.printLine(`please don't exit. please.`)
}, {
    description: "exit the terminal"
})


// ------------------- f.js --------------------
terminal.addCommand("f", async function(args) {
    async function randomFriendScore(friendName) {
        const round = (num, places) => Math.round(num * 10**places) / 10**places
        let msgBuffer = new TextEncoder().encode(friendName)
        let hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
        let hashArray = Array.from(new Uint8Array(hashBuffer))
        return round(hashArray[0] / 255 * 10, 2)
    }

    let lowerCaseName = args.friend.toLowerCase()

    // best salt was chosen by maximizing the average friendship score
    // of the names of my best friends
    const bestSalt = "oJOMDCVmMJ"

    let friendScore = await randomFriendScore(lowerCaseName + bestSalt)

    terminal.printLine(`Your friendship score with ${args.friend} is ${friendScore}/10.`)
}, {
    description: "calculate friendship score with a friend",
    args: ["*friend"]
})


// ------------------- factor.js --------------------
terminal.addCommand("factor", async function(args) {

    function primeFactors(n) {
        let i = 2
        let factors = []
        while (i * i <= n) {
            if (n % i) {
                i += 1
            } else {
                n = parseInt(n / i)
                factors.push(i)
            }
        }
        if (n > 1) {
            factors.push(n)
        }
        return factors
    }

    function printFactors(num) {
        let factors = primeFactors(num).join(" ")
        if (factors.length == 0 || isNaN(parseInt(num))) {
            terminal.printLine(`${num}: Invalid number!`)
        } else {
            terminal.print(num + ": ")
            terminal.printLine(factors, Color.COLOR_1)
        }
    }

    if (args.n != null) {
        printFactors(args.n)
        return
    }

    terminal.printLine("Type a number to factorize it.")

    while (true) {
        let text = await terminal.prompt()
        for (let word of text.trim().split(" ").map(w => w.trim()).filter(w => w.length > 0)) {
            if (word.length == 0 || isNaN(word)) {
                terminal.printLine(`${word}: Invalid number!`)
            } else {
                let num = parseInt(word)
                printFactors(num)
            }
        }
    }
}, {
    description: "print the prime factors of a number",
    args: {
        "?n:n": "number to factorize"
    },
    standardVals: {
        n: null
    }
})
// ------------------- fakechat.js --------------------
async function loadImage(url) {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject    
        img.src = url
    })
}

// stolen from https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

class ChatMessage {

    constructor(text, side, hasTick) {
        this.text = text
        this.side = side
        this.hasTick = hasTick
    }

}

class Chat {

    static whatsappLowerUrl = "https://noel-friedrich.de/terminal/res/img/fakechat/whatsapp-lower.png"
    static whatsappUpperUrl = "https://noel-friedrich.de/terminal/res/img/fakechat/whatsapp-upper.png"

    constructor() {
        this.messages = []
        this.chatName = "My Friend"
        this.chatImage = "https://imgur.com/D1DjO7T.png"
        this.backgroundColor = Color.hex("#000000")
        this.backgroundImage = "https://noel-friedrich.de/terminal/res/img/fakechat/default-background.png"
        this.resolution = [720, 1560]
        // set this.time to time now in 12:00 format
        this.time = new Date().toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", hour12: false})
        this.bubbleOffset = 0
        this.textSizeFactor = 1
    }

    addMessage(text, side) {
        let lastMessage = this.messages[this.messages.length - 1]
        let hasTick = lastMessage == null || lastMessage.side != side
        this.messages.push(new ChatMessage(text, side, hasTick))
    }

    get resolutionWidth() {
        return this.resolution[0]
    }

    get resolutionHeight() {
        return this.resolution[1]
    }

    async exportToCanvas() {
        let lowerImg = await loadImage(Chat.whatsappLowerUrl)
        let upperImg = await loadImage(Chat.whatsappUpperUrl)

        let canvas = document.createElement("canvas")
        canvas.width = this.resolutionWidth
        canvas.height = this.resolutionHeight
        let context = canvas.getContext("2d")
        context.fillStyle = this.backgroundColor.toString()
        context.fillRect(0, 0, canvas.width, canvas.height)

        let helvetica = new FontFace("Helvetica", "url(res/fonts/Helvetica.ttf)")
        await helvetica.load()
        document.fonts.add(helvetica)

        let helveticaBold = new FontFace("HelveticaBold", "url(res/fonts/Helvetica-Bold.ttf)", {
            weight: "bold"
        })
        await helveticaBold.load()
        document.fonts.add(helveticaBold)

        let bubbleTextSize = canvas.height * 0.022 * this.textSizeFactor
        let bubbleRadius = bubbleTextSize * 0.8
        let bubblePadding = bubbleTextSize * 0.5
        let sidePadding = canvas.width * 0.05
        
        function drawBubbleBox(x, y, width, height, withTick=false, tickLeft=true, color=Color.WHITE) {
            context.fillStyle = color.toString()
            context.beginPath()
            context.moveTo(x + bubbleRadius, y)
            context.lineTo(x + width - bubbleRadius, y)
            context.quadraticCurveTo(x + width, y, x + width, y + bubbleRadius)
            context.lineTo(x + width, y + height - bubbleRadius)
            context.quadraticCurveTo(x + width, y + height, x + width - bubbleRadius, y + height)
            context.lineTo(x + bubbleRadius, y + height)
            context.quadraticCurveTo(x, y + height, x, y + height - bubbleRadius)
            context.lineTo(x, y + bubbleRadius)
            context.quadraticCurveTo(x, y, x + bubbleRadius, y)
            context.fill()
            if (withTick && tickLeft) {
                let tickRadius = bubbleRadius * 0.5
                const SINCOS = Math.sin(Math.PI / 4)
                context.beginPath()
                context.moveTo(x - bubbleRadius + tickRadius, y)
                context.lineTo(x + bubbleRadius, y)
                context.lineTo(x + bubbleRadius, y + bubbleRadius * 2)
                context.lineTo(x - bubbleRadius + tickRadius * SINCOS, y + tickRadius * SINCOS)
                context.quadraticCurveTo(x - bubbleRadius, y, x - bubbleRadius + tickRadius, y)
                context.fill()
            } else if (withTick && !tickLeft) {
                let tickRadius = bubbleRadius * 0.5
                const SINCOS = Math.sin(Math.PI / 4)
                context.beginPath()
                context.moveTo(x + width + bubbleRadius - tickRadius, y)
                context.lineTo(x + width - bubbleRadius, y)
                context.lineTo(x + width - bubbleRadius, y + bubbleRadius * 2)
                context.lineTo(x + width + bubbleRadius - tickRadius * SINCOS, y + tickRadius * SINCOS)
                context.quadraticCurveTo(x + width + bubbleRadius, y, x + width + bubbleRadius - tickRadius, y)
                context.fill()
            }
        }

        let currBubbleY = 0

        function drawBubble(side, text, withTick=true) {
            if (withTick) currBubbleY += bubblePadding
            let isLeft = (side == "left")
            let color = isLeft ? Color.hex("#ffffff") : Color.hex("#e7ffdb")
            let x = isLeft ? sidePadding : canvas.width - sidePadding
            let textStartX = isLeft ? x + bubblePadding : x - bubblePadding
            let textStartY = currBubbleY + bubblePadding
            context.font = `${bubbleTextSize}px Helvetica`
            let lines = getLines(context, text, canvas.width * 0.7)
            let lineHeight = context.measureText("M").width * 1.2
            let textHeight = lines.length * lineHeight
            let maxTextWidth = Math.max(...lines.map(line => context.measureText(line).width))
            x -= isLeft ? 0 : maxTextWidth + 2 * bubblePadding
            drawBubbleBox(x, currBubbleY, maxTextWidth + 2 * bubblePadding, textHeight + 2 * bubblePadding, withTick, isLeft, color)
            for (let line of lines) {
                context.fillStyle = Color.hex("#131b20").toString()
                context.textAlign = (side == "left") ? "left" : "right"
                context.textBaseline = "top"
                context.fillText(line, textStartX, textStartY)
                textStartY += lineHeight
            }
            currBubbleY += textHeight + 2 * bubblePadding + 5
        }

        let upperImgHeight = (upperImg.height / upperImg.width) * this.resolutionWidth
        let lowerImgHeight = (lowerImg.height / lowerImg.width) * this.resolutionWidth

        function drawChatName(chatName) {
            context.font = `${canvas.width * 0.045}px HelveticaBold`
            context.fillStyle = "white"
            context.textAlign = "left"
            context.textBaseline = "middle"
            context.fillText(chatName, canvas.width * 0.2, upperImgHeight * 0.7)
        }

        function drawTime(timeString) {
            context.font = `${canvas.width * 0.04}px Helvetica`
            context.fillStyle = "#a5e8dd"
            context.textAlign = "left"
            context.textBaseline = "middle"
            context.fillText(timeString, canvas.width * 0.063, upperImgHeight * 0.18)
        }

        async function drawChatImage(chatImageSrc) {
            let chatImg = await loadImage(chatImageSrc)
            context.beginPath()
            context.arc(canvas.width * 0.1285, canvas.width * 0.159, canvas.width * 0.05, 0, 2 * Math.PI)
            context.clip()
            context.drawImage(chatImg, canvas.width * 0.0785, canvas.width * 0.109, canvas.width * 0.1, canvas.width * 0.1)
        }

        currBubbleY = upperImgHeight

        if (this.bubbleOffset) {
            currBubbleY += this.bubbleOffset * canvas.height
        }

        if (this.backgroundImage) {
            let backgroundImg = await loadImage(this.backgroundImage)
            let imageWidth = (backgroundImg.width / backgroundImg.height) * canvas.height
            context.drawImage(backgroundImg, 0, 0, imageWidth, canvas.height)
        }

        for (let bubble of this.messages) {
            drawBubble(bubble.side, bubble.text, bubble.withTick)
        }

        context.drawImage(upperImg, 0, 0, canvas.width, upperImgHeight)
        context.drawImage(lowerImg, 0, canvas.height - lowerImgHeight - 20, canvas.width, lowerImgHeight)

        if (this.chatName) {
            drawChatName(this.chatName)
        }

        if (this.time) {
            drawTime(this.time)
        }

        if (this.chatImage) {
            await drawChatImage(this.chatImage)
        }
        
        return canvas
    }
}

terminal.addCommand("fakechat", async function(args) {
    let animationInterval = args.f ? 0 : 15

    const printLn = async msg => await terminal.animatePrint(msg, animationInterval)
    const promptLn = async (msg, regex, defaultValue=null) => {
        if (defaultValue) {
            msg += ` (default: ${defaultValue}): `
        } else {
            msg += ": "
        }

        while (true) {
            let result = await terminal.prompt(msg)
            if (result == "" && defaultValue) {
                return defaultValue
            } else if (regex.test(result)) {
                return result
            } else {
                await printLn("Invalid input. Please try again.")
            }
        }
    }

    let chat = new Chat()

    chat.textSizeFactor = args.s
    chat.bubbleOffset = args.o
    chat.resolution[0] = args.x
    chat.resolution[1] = args.y

    await printLn("Welcome to the fake chat generator!", animationInterval)
    await printLn("Together we will create a fake chat conversation.")
    terminal.addLineBreak()
    await printLn("First, we need to know the name of the chat.")
    await printLn("This could be 'Tom' or 'Mamamia'.")
    chat.chatName = await promptLn("Chat Name", /.+/)

    terminal.addLineBreak()
    await printLn("Great! Now let's add some messages.")
    await printLn("You can add as many messages as you want.")
    await printLn("- To add a message, type the message and press enter.")
    await printLn("- To finish adding messages, type 'done' or 'd'.")
    await printLn("- To switch sides, type 'switch' or 's'.")
    await printLn("- to undo the last message, type 'undo' or 'u'.")
    terminal.addLineBreak()
    let currSide = "right"
    const getName = side => side != "left" ? "You" : chat.chatName
    const changeSide = () => currSide = currSide == "left" ? "right" : "left"
    while (true) {
        let msg = await promptLn(getName(currSide), /.+/)
        if (msg == "done" || msg == "d") break
        if (msg == "switch" || msg == "s") {
            changeSide()
            continue
        }
        if (msg == "undo" || msg == "u") {
            if (chat.messages.pop()) {
                terminal.printSuccess("Removed last message.")
            } else {
                terminal.printError("No messages to remove.")
            }
            changeSide()
            continue
        }
        chat.addMessage(msg, currSide)
        changeSide()
    }

    terminal.addLineBreak()
    await printLn("Awesome! Now let's the current time.")
    await printLn("This could be '12:00' or '3:14'.")
    chat.time = await promptLn("Time", /[0-9]{1,2}\:[0-9]{1,2}/, chat.time)

    await terminal.modules.load("upload", terminal)

    terminal.addLineBreak()
    await printLn("Now let's add a profile picture.")
    await printLn("The profile picture will be displayed in the top left corner.")
    await printLn("You can either enter a URL or upload a file.")
    await printLn("To upload a file, type 'upload' or 'u'.")
    await printLn("Type 'default' to skip this step and use the default profile picture.")

    let defaultChatImage = chat.chatImage
    chat.chatImage = null
    while (chat.chatImage == null) {
        chat.chatImage = await promptLn("Profile Picture Url", /.+/)
        if (chat.chatImage == "default") {
            chat.chatImage = defaultChatImage
        } else if (chat.chatImage == "upload" || chat.chatImage == "u") {
            try {
                chat.chatImage = (await terminal.modules.upload.image()).src
            } catch (e) {
                chat.chatImage = null
            }
        } else {
            try {
                await loadImage(chat.chatImage)
            } catch (e) {
                terminal.printError("Invalid image URL.")
                chat.chatImage = null
            }
        }
    }

    terminal.addLineBreak()
    await printLn("Now let's add a background image.")
    await printLn("The background image will be displayed behind the chat.")
    await printLn("You can either enter a URL or upload a file.")
    await printLn("Type 'default' to skip this step and use the default background.")

    let defaultBackgroundImage = chat.backgroundImage
    chat.backgroundImage = null
    while (chat.backgroundImage == null) {
        chat.backgroundImage = await promptLn("Background Image Url", /.+/)
        if (chat.backgroundImage == "default") {
            chat.backgroundImage = defaultBackgroundImage
            break
        }
        if (chat.backgroundImage == "upload" || chat.backgroundImage == "u") {
            try {
                chat.backgroundImage = (await terminal.modules.upload.image()).src
            } catch (e) {
                chat.backgroundImage = null
            }
        } else {
            try {
                await loadImage(chat.backgroundImage)
            } catch (e) {
                terminal.printError("Invalid image URL.")
                chat.backgroundImage = null
            }
        }
    }

    terminal.addLineBreak()
    let canvas = await chat.exportToCanvas()
    terminal.parentNode.appendChild(canvas)
    canvas.classList.add("terminal-img")
    terminal._styleImgElement(canvas, true)
    terminal.addLineBreak()
}, {
    description: "fake a whatsapp chat conversation",
    args: {
        "?f=fast:b": "skip typing animations [fast mode]",
        "?o=offset:n:-100~100": "offset the chat by a procentage of the screen height",
        "?s=scale:n:0.1~5": "scale the chat by a factor",
        "?x=width:n:100~10000": "set the width of the screen in pixels",
        "?y=height:n:100~10000": "set the height of the screen in pixels",
    },
    standardVals: {
        o: 0,
        s: 1,
        x: 720,
        y: 1560,
    }
})
// ------------------- fibo.js --------------------
terminal.addCommand("fibo", function(args) {
    let a = 0
    let b = 1

    if (args.phi && args.n < 3)
        throw new Error("n must be greater than 1 when using phi")

    let lastTwo = []

    for (let i = 0; i < args.n; i++) {
        terminal.printLine(a)
        lastTwo.push(a)
        if (lastTwo.length > 2)
            lastTwo.shift()

        let c = a + b
        a = b
        b = c
    }

    if (args.phi) {
        let [a, b] = lastTwo
        terminal.printLine(`phi ≈ ${b / a}`, Color.COLOR_1)
    }
}, {
    description: "Prints the Fibonacci sequence",
    args: { 
        "?n:i:1~100": "The number of elements to print",
        "?p=phi:b": "calculate the golden ratio using the last two elements"
    },
    defaultValues: {
        n: 10
    }
})
// ------------------- fizzbuzz.js --------------------
terminal.addCommand("fizzbuzz", function(args) {
    let output = ""
    for (let i = 1; i <= args.max; i++) {
        let outs = ""
        if (i % 3 == 0) outs += "fizz"
        if (i % 5 == 0) outs += "buzz"
        if (outs == "") outs += i
        output += outs + "\n"
    }
    terminal.printLine(output.slice(0, -1))
},{
    description: "print the fizzbuzz sequence",
    args: {
        "?max:n:1~100000": "the maximum number to print"
    },
    standardVals: {
        max: 15
    }
})


// ------------------- flaci-to-turing.js --------------------
terminal.addCommand("flaci-to-turing", async function(args) {
    const file = terminal.getFile(args.file)
    const code = file.content
    let outputCode = ""

    const write = (str, endline=true) => {
        outputCode += str
        if (endline)
            outputCode += "\n"
    }

    try {
        const json = JSON.parse(code)
        const name = json.name
        if (json.type != "TM")
            throw new Error("Not a Turing Machine")

        write(`// ${name} converted from flaci.com`)
        write(`// Converter by noel-friedrich.de\n`)

        const automaton = json.automaton

        const states = automaton.States

        if (automaton.simulationInput) {
            const inputs = automaton.simulationInput
            if (inputs.length > 0) {
                let input = inputs.join("")
                write(`; Start Tape Content: "${input}"`)
            }
        }

        const getState = id => {
            return states.find(state => state.ID == id)
        }

        for (let state of states) {
            let stateName = state.Name
            if (state.Start)
                write(`; Start State: "${stateName}"\n`)

            for (let transition of state.Transitions) {
                let targetState = getState(transition.Target)
                for (let label of transition.Labels) {

                    let [
                        content,
                        newContent,
                        direction
                    ] = label

                    if (direction == "R")
                        direction = "r"
                    else if (direction == "L")
                        direction = "l"
                    else if (direction == "N")
                        direction = "*"
                    else
                        throw new Error("Invalid Direction")

                    write(`${stateName} ${content} ${newContent} ${direction} ${targetState.Name}`)
                }
            }

            write("")
        }
    } catch (e) {
        terminal.printError("Invalid Flaci.com File")
        console.error(e)
        return
    }

    if (args.s) { // save
        await terminal.createFile(args.s, TextFile, outputCode)
        terminal.printLine(`Saved as ${args.s}`)
    } else {
        terminal.printLine(outputCode)
    }
}, {
    description: "Converts a flaci.com JSON File of a turing machine to a turing machine file",
    args: {
        "file": "file to convert",
        "?s=save:b": "save the converted file"
    },
    isSecret: true,
    helpFunc() {
        terminal.addLineBreak()
        terminal.printLink("flaci.com", "https://flaci.com/", undefined, false)
        terminal.printItalic(" lets you create Turing Machines")
        terminal.printItalic("graphically. This command converts the")
        terminal.printItalic("JSON file of a Turing Machine to a Turing")
        terminal.printItalic("Machine file that can be used in this")
        terminal.printItalic("terminal using the 'turing' command.")
    }
})
// ------------------- flappy.js --------------------
terminal.addCommand("flappy", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({name: "Flappy Turtlo", fullscreen: args.f})

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT
    context.imageSmoothingEnabled = false
    
    const fps = 44

    let gameRunning = true

    const gravity = canvas.height / 700
    const jump = canvas.height / -40

    function clearCanvas() {
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    class Turtlo {

        constructor() {
            this.y = 0
            this.velY = 0
            this.imageSrc = "res/img/turtlo/walking-0.png"
            this.image = null
            this.imageX = 64
            this.dead = false
        }

        get rotation() {
            if (this.dead) return Math.PI
            return Math.min(Math.max(this.velY / 10, -1), 1) + Math.PI / 2
        }

        get points() {
            return [
                new Vector2d(this.x - this.imageX / 2, this.y - this.imageY / 2),
                new Vector2d(this.x + this.imageX / 2, this.y - this.imageY / 2),
                new Vector2d(this.x + this.imageX / 2, this.y + this.imageY / 2),
                new Vector2d(this.x - this.imageX / 2, this.y + this.imageY / 2)
            ]
        }

        jump() {
            if (this.dead) return
            this.velY = jump
            if (!args.silent) {
                playFrequency(400, 100, 0.5)
                setTimeout(() => playFrequency(500, 50, 0.5), 50)
            }
        }

        get x() {
            return canvas.width * (1 / 5)
        }

        async loadImage() {
            let image = new Image()
            image.src = this.imageSrc
            await new Promise(resolve => image.onload = resolve)
            this.image = image
            this.imageY = this.imageX * (image.height / image.width)
        }

        update() {
            this.velY += gravity
            this.y += this.velY

            if (this.y > canvas.height) {
                this.y = canvas.height
                this.velY = 0
            }

            if (this.y < 0) {
                this.y = 0
                this.velY = 0
            }

            if (this.dead && this.y == canvas.height) {
                gameRunning = false
            }
        }

        draw() {
            context.save()
            context.translate(this.x, this.y)
            context.rotate(this.rotation)
            context.drawImage(this.image, -this.imageX / 2, -this.imageY / 2, this.imageX, this.imageY)
            context.restore()
        }

        die() {
            this.dead = true
            if (!args.silent)
                playFrequency(300, 1000)
        }

    }

    const turtlo = new Turtlo()
    await turtlo.loadImage()

    class Wall {

        generateHole() {
            this.holeStartRelative = Math.random()
            this.holeSizeRelative = 0.4
        }

        constructor(n) {
            this.number = n
            this.x = canvas.width
            this.generateHole()
            while (this.holeStartRelative + this.holeSizeRelative > 1) {
                this.generateHole()
            }
        }

        get velX() {
            return -4
        }

        get width() {
            return 100
        }

        get height() {
            return canvas.height
        }

        get holeStart() {
            return this.holeStartRelative * this.height
        }

        get holeSize() {
            return this.holeSizeRelative * this.height
        }

        get touching() {
            return turtlo.touching(this.x, this.y) || turtlo.touching(this.x, this.y + this.height)
        }

        update() {
            this.x += this.velX
        }

        draw() {
            context.fillStyle = "white"
            context.fillRect(this.x, 0, this.width, this.holeStart)
            context.fillRect(
                this.x,
                this.holeStart + this.holeSize,
                this.width,
                this.height
            )
        }

        drawNumber() {
            context.fillStyle = "white"
            context.font = "48px monospace"
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillText(this.number, this.x + this.width / 2, this.holeStart + this.holeSize / 2)
        }

        collision() {
            for (let point of turtlo.points) {
                if (point.x > this.x && point.x < this.x + this.width) {
                    if (point.y < this.holeStart || point.y > this.holeStart + this.holeSize) {
                        turtlo.die()
                    }
                }
            }
        }

    }

    let walls = []

    let wallSpawnCount = 0
    let wallSpawnInterval = 100
    let score = 0

    const intervalKey = setInterval(() => {
        if (!gameRunning)
            return

        clearCanvas()

        for (let wall of walls) {
            wall.update()
            wall.drawNumber()
        }

        turtlo.update()
        turtlo.draw()

        for (let wall of walls) {
            wall.draw()
            wall.collision()
        }

        wallSpawnCount++
        if (wallSpawnCount >= wallSpawnInterval) {
            walls.push(new Wall(score++))
            wallSpawnCount = 0
        }

        walls = walls.filter(wall => wall.x > -wall.width)
    }, 1000 / fps)

    addEventListener("keydown", e => {
        if (!gameRunning) return
        if (e.key == " ")
            turtlo.jump()
    })

    addEventListener("touchstart", e => {
        if (!gameRunning) return
        turtlo.jump()
    })

    terminal.onInterrupt(() => {
        terminalWindow.close()
        gameRunning = false
        clearInterval(intervalKey)
    })

    while (gameRunning) {
        await sleep(100)
    }

    terminalWindow.close()
    clearInterval(intervalKey)

    terminal.printLine(`Your score: ${score}`)
    await HighscoreApi.registerProcess("flappy")
    await HighscoreApi.uploadScore(score)

}, {
    description: "play a game of flappy turtlo",
    args: {
        "?f=fullscreen:b": "fullscreen",
        "?s=silent:b": "silent mode"
    },
    isGame: true
})
// ------------------- font.js --------------------
const OG_FONT = 

terminal.addCommand("font", function(args) {
    if (args.font.toLowerCase() == "reset") {
        terminal.data.font = terminal.data.getDefault("font")
        return
    }
    terminal.data.font = args.font
}, {
    description: "change the font of the terminal",
    args: ["*font"]
})

// ------------------- foreground.js --------------------
const OG_FOREGROUND_COLOR = Color.rgb(255, 255, 255)

terminal.addCommand("foreground", function(args) {
    if (args.color.toLowerCase() == "reset") {
        terminal.data.foreground = OG_FOREGROUND_COLOR
        return
    }
    let color = parseColor(args.color)
    let distance = terminal.data.background.distanceTo(color)
    if (distance >= 80) {
        terminal.data.foreground = color
    } else {
        throw new Error("The foreground color is too close to the background color")
    }
}, {
    description: "change the foreground color of the terminal",
    args: {
        "color": "the color to change the foreground to"
    }
})
// ------------------- fraction.js --------------------
terminal.addCommand("fraction", function(args) {
    let n = args.n

    let bestFraction = null
    let bestError = Infinity
    for (let denominator = 1; denominator < args.d; denominator++) {
        let numerator = Math.round(n * denominator)
        const newValue = numerator / denominator
        
        const error = Math.abs(n - newValue)

        if (error == 0) {
            bestFraction = [numerator, denominator]
            break
        }

        if (error < bestError) {
            bestError = error
            bestFraction = [numerator, denominator]
        }
    }

    const fractionN = bestFraction[0] / bestFraction[1]

    const error = fractionN - n
    terminal.print("Best result: ")
    terminal.printLine(`${bestFraction[0]}/${bestFraction[1]}`, Color.COLOR_1)

    // print comparison

    const strFractionN = fractionN.toString()
    const strN = n.toString()
    terminal.print("           = ")
    for (let i = 0; i < strFractionN.length; i++) {
        let isCorrect = false
        if (i < strN.length) {
            isCorrect = strFractionN[i] == strN[i]
        }

        const color = isCorrect ? Color.fromHex("#00ff00") : Color.ERROR
        terminal.print(strFractionN[i], Color.BLACK, {background: color})
    }
    terminal.addLineBreak()

    if (error != 0) {
        terminal.printLine(`approximate error: ${error}`)
    }
}, {
    description: "find a fraction from a decimal number",
    args: {
        "n=number:n": "number (decimal)",
        "?d=max-denominator:i:1~999999999": "maximum denominator",
    },
    defaultValues: {
        d: 1000
    }
})
// ------------------- games.js --------------------
terminal.addCommand("games", function() {
    let gameCommands = Object.entries(terminal.commandData)
        .filter(([_, info]) => info.isGame)
        .map(([name, _]) => name)
    let longestCommandLength = gameCommands.reduce((p, c) => Math.max(p, c.length), 0)
    for (let command of gameCommands.sort((a, b) => a.localeCompare(b))) {
        terminal.printCommand(command, command, Color.PURPLE, false)
        let spaces = strRepeat(" ", longestCommandLength - command.length + 2)
        let description = terminal.allCommands[command]
        terminal.printLine(`${spaces}${description}`)
    }
}, {
    description: "shows the game menu",
})
// ------------------- get.js --------------------
terminal.addCommand("get", async function(args) {
    await terminal.modules.load("cliapi", terminal)
    const CliApi = terminal.modules.cliapi
    if (!CliApi.KEY_REGEX.test(args.key)) {
        terminal.printError("Invalid key")
        return
    }
    let value = await CliApi.get(args.key)
    terminal.print(">>> ", Color.COLOR_2)
    terminal.printLine(value)
}, {
    description: "get a value from the server",
    args: {
        key: "the key to get the value of"
    },
    disableEqualsArgNotation: true
})


// ------------------- greed.js --------------------
terminal.addCommand("greed", async function(args) {
    await terminal.modules.import("game", window)

    args.w = 30
    args.h = 20

    if (args.b) {
        args.w *= 2
        args.h *= 2
    }

    let gameName = "greed" + (args.b ? ":big" : "")

    let numberColors = [undefined]
    let numColors = 9
    for (let i = 0; i < numColors; i++) {
        let color = `hsl(${i / numColors * 360}deg, 30%, 50%)`
        numberColors.push(color)
    }

    class Player {

        constructor(pos) {
            this.pos = pos
            this.score = 0
        }

    }

    class Game {

        initData(fillFunc) {
            this.data = []
            for (let y = 0; y < this.size.y; y++) {
                let dataRow = []
                for (let x = 0; x < this.size.x; x++) {
                    dataRow.push(fillFunc(x, y))
                }
                this.data.push(dataRow)
            }
        }

        get(x, y) {
            return this.data[y][x]
        }

        getPos(pos) {
            return this.get(pos.x, pos.y)
        }

        set(x, y, value) {
            this.data[y][x] = value
            this.elements[y][x].textContent = value
            this.elements[y][x].style.color = numberColors[value]
        }

        getElement(pos) {
            return this.elements[pos.y][pos.x]
        }

        firstDraw() {
            this.elements = []

            const drawLine = () => terminal.printLine("+" + "-".repeat(this.size.x * 2 + 1) + "+")

            terminal.addLineBreak()
            drawLine()
            for (let y = 0; y < this.size.y; y++) {
                let row = []
                terminal.print("| ")
                for (let x = 0; x < this.size.x; x++) {
                    let pos = new Vector2d(x, y)
                    let element = terminal.print(this.get(x, y), undefined, {forceElement: true})
                    terminal.print(" ")
                    element.style.color = numberColors[this.get(x, y)]
                    row.push(element)
                    element.style.cursor = "pointer"
                    element.onclick = event => {
                        if (!this.running || this.processing) return
                        let relative = this.player.pos.sub(pos).scale(-1)
                        if (relative.length == 1) {
                            this.movePlayer(relative)
                        }
                    }
                }
                terminal.print("|")
                terminal.addLineBreak()
                this.elements.push(row)
            }
            drawLine()
            terminal.print("| Score: ")
            this.scoreOutput = terminal.print("0000")
            terminal.print(" | Next Highscore: ")
            this.highscoreOutput = terminal.print()
            terminal.printLine("|")
            drawLine()
        }

        async updateScore() {
            this.scoreOutput.textContent = stringPad(this.player.score, 4, "0")
            let highscore = await this.getNextHighscore()
            if (args.b) {
                this.highscoreOutput.textContent = stringPadBack(highscore.slice(0, 89), 90)
            } else {
                this.highscoreOutput.textContent = stringPadBack(highscore.slice(0, 29), 30)
            }
        }

        inBounds(pos) {
            return pos.x >= 0 && pos.x < this.size.x && pos.y >= 0 && pos.y < this.size.y
        }

        async movePlayer(direction) {
            this.processing = true
            let newPos = this.player.pos.add(direction)
            if (!this.inBounds(newPos) || this.getPos(newPos) == " ") {
                this.running = false
                this.drawPlayer(true)
                this.processing = false
                return
            }
            let value = this.getPos(newPos)
            this.player.pos.iadd(direction)
            this.player.score++
            for (let i = 0; i < value - 1; i++) {
                await sleep(10)
                this.player.score++
                this.drawPlayer(true)
                let newPos = this.player.pos.add(direction)
                if (!this.inBounds(newPos) || this.getPos(newPos) == " ") {
                    this.running = false
                    this.drawPlayer(true)
                    this.processing = false
                    return
                }
                this.player.pos = newPos
            }
            this.drawPlayer(true)
            this.processing = false
        }

        removeHeads() {
            for (let y = 0; y < this.size.y; y++) {
                for (let x = 0; x < this.size.x; x++) {
                    let value = this.get(x, y)
                    if (value == "@") {
                        this.set(x, y, " ")
                    }
                }
            }
        }

        drawPlayer(drawHead) {
            this.set(this.player.pos.x, this.player.pos.y, " ")
            let element = this.getElement(this.player.pos)
            element.style.color = "white"
            if (drawHead) {
                this.removeHeads()
                this.set(this.player.pos.x, this.player.pos.y, "@")
            }
        }

        async getNextHighscore() {
            if (!this.highscores) return "Loading..."
            let backwards = this.highscores.slice().reverse()
            let score = backwards.find(score => score.score > this.player.score)
            let rank = await HighscoreApi.getRank(gameName, this.player.score, this.highscores)
            return score ? `${stringPad(score.score, 4, "0")} by ${score.name} (#${rank})` : "You got the highscore!"
        }

        async cacheHighscores() {
            let highscores = await HighscoreApi.getHighscores(gameName)
            this.highscores = highscores
        }

        constructor(width, height) {
            this.size = new Vector2d(width, height)
            this.initData(() => Math.floor(Math.random() * 9) + 1)
            this.firstDraw()
            this.player = new Player(this.size.scale(0.5).map(Math.floor))
            this.running = true
            this.processing = false
            this.cacheHighscores()
        }

    }

    class Solver {

        static callCount = 0

        static evalPos(data, playerX, playerY, score, currDepth=1, maxDepth=2) {
            this.callCount++

            if (currDepth >= maxDepth) {
                return [score, null]
            }

            let bestScore = 0
            let bestMove = null

            const inBounds = (x, y) => {
                return !(
                    x < 0 || y < 0 ||
                    y >= data.length ||
                    x >= data[0].length
                )
            }

            let possibleMoves = [[0, 1], [0, -1], [1, 0], [-1, 0]]

            moveLoop:
            for (let move of possibleMoves) {
                let currX = playerX + move[0]
                let currY = playerY + move[1]

                if (!inBounds(currX, currY)) {
                    continue
                }

                let value = data[currY][currX]
                if (value == -1) {
                    continue
                }

                let dataCopy = data.map(row => {
                    return row.map(cell => {
                        return (cell == "@" || cell == " ") ? -1 : cell
                    })
                })

                dataCopy[currY][currX] = -1

                for (let i = 1; i < value; i++) {
                    currX += move[0]
                    currY += move[1]
                    if (!inBounds(currX, currY)) {
                        continue moveLoop
                    }
                    if (dataCopy[currY][currX] == -1) {
                        continue moveLoop
                    }
                    dataCopy[currY][currX] = -1
                }

                let [moveScore, _] = this.evalPos(dataCopy, currX, currY, score + value, currDepth + 1, maxDepth)

                if (moveScore > bestScore) {
                    bestMove = move
                    bestScore = moveScore
                }
            }

            return [bestScore, bestMove]
        }

        static getBestMove(data, playerPos, depth) {
            this.callCount = 0

            if (this.logging) {
                console.log(`-- starting search with depth=${depth} --`)
            }

            let [score, move] = this.evalPos(
                data,
                playerPos.x,
                playerPos.y,
                0, 1, depth
            )

            if (this.logging) {
                console.log(`-- ending search, score=${score} --`)
            }

            if (move) {
                return Vector2d.fromArray(move)
            } else {
                return null
            }
        }

    }

    terminal.printLine("Use the arrow keys to move the player. You will move the")
    terminal.printLine("number of spaces equal to the number on the tile you land on")
    terminal.printLine("Don't crash into the walls or yourself!")
    let game = new Game(args.w, args.h)

    addEventListener("keydown", event => {
        if (!game.running || game.processing) return

        if (event.key == "s") {
            let bestMove = Solver.getBestMove(game.data, game.player.pos, 10)
            if (bestMove) {
                game.movePlayer(bestMove)
            }
            event.preventDefault()
        } else if (event.key == "ArrowUp") {
            game.movePlayer(new Vector2d(0, -1))
            event.preventDefault()
        } else if (event.key == "ArrowDown") {
            game.movePlayer(new Vector2d(0, 1))
            event.preventDefault()
        } else if (event.key == "ArrowLeft") {
            game.movePlayer(new Vector2d(-1, 0))
            event.preventDefault()
        } else if (event.key == "ArrowRight") {
            game.movePlayer(new Vector2d(1, 0))
            event.preventDefault()
        } else if (event.key == "c" && event.ctrlKey) {
            game.running = false
        }
    })

    game.drawPlayer(true)

    terminal.scroll()

    while (game.running) {
        await sleep(100)
        game.updateScore()
    }

    terminal.printLine(`Game over! Your score was ${game.player.score}.`)

    await HighscoreApi.registerProcess(gameName)
    await HighscoreApi.uploadScore(game.player.score)

}, {
    description: "play a game of greed",
    isGame: true,
    args: {
        "?b": "play the bigger version"
    }
})

// ------------------- grep.js --------------------
terminal.addCommand("grep", async function(args) {
    let recursive = args.r ?? false
    let ignorecase = args.i ?? false
    let invert = args.v ?? false
    let linematch = args.x ?? false

    if (ignorecase)
        args.pattern = args.pattern.toLowerCase()

    let matches = []

    function processFile(file, filename, allowRecursionOnce=false) {
        if (file.type == FileType.FOLDER) {
            if (recursive || allowRecursionOnce) {
                for (let [newName, newFile] of Object.entries(file.content)) {
                    if (!recursive && newFile.type == FileType.FOLDER) continue
                    processFile(newFile, newName)
                }
            } else {
                throw new Error(`File ${filename} is a directory!`)
            }
        } else {
            for (let line of file.content.split("\n")) {
                if (linematch) {
                    let tempLine = line
                    if (ignorecase)
                        tempLine = line.toLowerCase()
                    var matching = tempLine === args.pattern
                } else if (ignorecase) {
                    var matching = line.toLowerCase().includes(args.pattern)
                } else {
                    var matching = line.includes(args.pattern)
                }
                if (matching ^ invert) {
                    if (ignorecase) {
                        var offset = line.toLowerCase().indexOf(args.pattern)
                    } else {
                        var offset = line.indexOf(args.pattern)
                    }
                    matches.push({
                        filename: filename,
                        filepath: file.path,
                        line: line,
                        offset: offset,
                    })
                }
            }
        }
    }

    if (args.file == "*") {
        processFile(terminal.currFolder, ".", true)
    } else {
        for (let filename of args.file.split(" ")) {
            let file = terminal.getFile(filename)
            processFile(file, filename)
        }
    }

    for (let match of matches) {
        terminal.printCommand(
            match.filename,
            `cat ${match.filepath}`,
            Color.COLOR_1, false
        )
        terminal.print(": ")
        if (match.offset == -1) {
            terminal.print(match.line)
        } else {
            let slicePoint = match.offset + 100
            if (slicePoint < match.line.length)
                match.line = match.line.slice(0, slicePoint) + "..."
            let prevLine = match.line.substring(0, match.offset)
            let matchLine = match.line.substring(match.offset, match.offset + args.pattern.length)
            let nextLine = match.line.substring(match.offset + args.pattern.length)
            terminal.print(prevLine)
            terminal.print(matchLine, Color.COLOR_2)
            terminal.print(nextLine)
        }
        terminal.addLineBreak()
    }

    if (matches.length == 0) {
        terminal.printLine("no matches")
    }

}, {
    description: "search for a pattern in a file",
    args: {
        "pattern": "the pattern to search for",
        "file": "the file to search in",
        "?r:b": "search recursively",
        "?i:b": "ignore case",
        "?v:b": "invert match",
        "?x:b": "match whole lines",
    }
})


// ------------------- hangman.js --------------------
const englishWords = [
    "spokesman", "slots", "man", "targets", "sec", "reflects", "constitutional", "hereby", "progressive", 
    "authors", "secrets", "basically", "wild", "beautiful", "theatre", "cry", "vhs", "fraction", "breakfast", "meal", "far", 
    "out", "glow", "literally", "specialist", "touch", "coastal", "ala", "ingredients", "medal", "adsl", "extract", "corresponding", 
    "twelve", "wizard", "micro", "cartoon", "steering", "moved", "inspection", "jul", "jpeg", "christopher", "index", 
    "value", "initially", "motivated", "threads", "friends", "worldwide", "frontier", "intense", "proprietary", "loaded", 
    "otherwise", "spider", "civilian", "detect", "tulsa", "closely", "trick", "expenditure", "responses", "deleted", "pubmed", 
    "listening", "thrown", "rosa", "relief", "magical", "thickness", "zone", "prot", "lectures", "prove", "published", "crap", 
    "allah", "dimensions", "panties", "perl", "ricky", "front", "tradition", "favourites", "naples", "sleep", "anime", 
    "introduces", "classical", "ntsc", "breeds", "city", "casey", "printable", "radar", "spend", "signed", "claimed", 
    "anymore", "accident", "which", "crossword", "evening", "iran", "matters", "justice", "sarah", "textbook", 
    "silly", "follows", "iraqi", "butts", "discrete", "pod", "afraid", "error", "homeless", "tracker", "optimize", "infected", 
    "side", "nice", "knock", "clinic", "diana", "reputation", "representation", "lyric", "compensation", "std", 
    "uploaded", "possess", "balls", "bon", "until", "info", "legs", "section", "lodging", "gallery", "allows", "attachments", 
    "mini", "mighty", "characterized", "mit", "restore", "swiss", "profiles", "herald", "henderson", "bedford", "peru", "jerry", 
    "movements", "condos", "asn", "annotation", "expand", "electron", "photoshop", "inquire", "anybody", "clip", "formed", 
    "processes", "casa", "cassette", "part", "inch", "difference", "dump", "carter", "knows", "undertake", "twisted", "were", 
    "rover", "versions", "farmers", "cartridges", "permit", "wolf", "decimal", "millions", "republic", "promotions", "photographers", 
    "unlock", "mono", "deck", "boots", "repair", "varieties", "sophisticated", "impacts", "liberal", "investment", "training", 
    "republicans", "fifth", "actor", "skating", "acts", "operated", "clear", "swaziland", "dylan", "nation", "aud", "bizrate", 
    "harm", "approaches", "martin", "confused", "pharmaceutical", "viking", "tunisia", "howto", "viagra", "conceptual", "downtown", 
    "geek", "fell", "observations", "managed", "select", "outer", "calculator", "barriers", "attributes", "rules", "spy", 
    "close", "foul", "wheels", "warrior", "bandwidth", "compressed", "bond", "creature", "minor", "mysql", "tuition", "invitations", 
    "elsewhere", "girls", "identical", "captured", "corporation", "ellis", "fifteen", "cds", "culture", "teeth", "frozen", 
    "rugs", "explained", "pop", "deutsch", "replace", "regulation", "against", "prominent", "higher", "arena", "commonly", 
    "int", "sucks", "equations", "enjoying", "marcus", "assembled", "denmark", "edinburgh", "purchasing", "printer", "puts", 
    "delivered", "oaks", "implement", "controller", "pets", "numerous", "celebs", "actors", "lottery", "biographies", "surprising", 
    "situated", "design", "penalties", "sheer", "insert", "craps", "report", "endorsement", "manage", "award", "medicines", 
    "degree", "farm", "skin", "tongue", "flight", "upload", "portuguese", "activities", "bound", "mongolia", "internship", 
    "three", "boys", "spray", "tests", "ppc", "shades", "consequence", "institute", "wang", "poly", "pins", "notion", "ever", 
    "starting", "yea", "somehow", "visibility", "surplus", "seeing", "noble", "andrea", "applied", "mpg", "ear", "normal", 
    "victoria", "necessity", "never", "juvenile", "bhutan", "techniques", "temple", "qualification", "trial", "carolina", 
    "potential", "diagnosis", "butter", "ant", "belt", "titles", "consideration", "unexpected", "evanescence", "sunrise", 
    "gone", "opportunity", "resort", "occurrence", "dictionaries", "amp", "commissioners", "atlantic", "von", "scanner", 
    "worn", "hollywood", "corporations", "documentary", "shift", "ambien", "hobby", "organisations", "poet", "oliver", "weekly", 
    "particular", "mark", "permitted", "wallpaper", "output", "wage", "donna", "hammer", "spirit", "university", 
    "licensed", "girl", "navy", "blogger", "poem", "descending", "powder", "cad", "website", "graphical", "root", 
    "needed", "printed", "recreational", "ordered", "mounting", "arcade", "dictionary", "lately", "computer", "responded", 
    "much", "saves", "street", "modified", "pretty", "denied", "happy", "pose", "mice", "desert", "package", "rewards", "than", 
    "pickup", "instantly", "relatives", "flooring", "better", "cycle", "indie", "leg", "health", "magnificent", "hacker", 
    "databases", "classics", "translator", "ian", "shine", "assignment", "verify", "chevrolet", "vendors", "applicants", 
    "legislation", "prozac", "beta", "blend", "soup", "perfect", "midwest", "matter", "kathy", "snake", "treo", "features", 
    "howard", "discounted", "probably", "patient", "polyphonic", "shoot", "ram", "thousands", "couples", "gabriel", "dense", 
    "plugins", "alumni", "terrorism", "parental", "deer", "build", "counted", "tokyo", "promotion", "sensitive", 
    "improved", "ultimate", "alloy", "scroll", "iceland", "knife", "featuring", "nodes", "helmet", "maintained", "male", 
    "adults", "logical", "kenneth", "sticker", "band", "sciences", "mild", "holders", "stable", "singapore", "recipients", 
    "rolling", "ranked", "wheat", "main", "slovenia", "severe", "handles", "forecasts", "fabric", "presence", 
    "mediawiki", "slope", "situations", "displays", "api", "sympathy", "manga", "straight", "obtaining", "preferred", "locking", 
    "performance", "guarantees", "approval", "davis", "activation", "calcium", "coal", "raises", "characteristics", 
    "behavioral", "sri", "reached", "takes", "reflect", "linear", "poverty", "canvas", "controversial", "drink", "cashiers", 
    "meals", "enables", "shortcuts", "budgets", "articles", "altered", "valve", "sex", "accessories", "advice", "countries", 
    "indicators", "unfortunately", "budapest", "vacancies", "argue", "den", "potter", "victor", "able", "dealtime", "idle", 
    "tax", "lucky", "reservations", "along", "spouse", "funding", "pre", "wound", "job", "exploring", "threatening", "ceo", 
    "scores", "stages", "combinations", "would", "satisfied", "seemed", "gratuit", "miracle", "poor", "abortion", 
    "interaction", "developer", "original", "trail", "wait", "lawyer", "pressure", "hint", "estimates", "arranged", 
    "bye", "sim", "therapy", "commercial", "ghost", "withdrawal", "finishing", "whereas", "vocal", "began", "shape", "language", 
    "forty", "told", "thinks", "rent", "patents", "chem", "asset", "officials", "drove", "deutsche", "central", "bargain", 
    "arbitration", "pull", "females", "ball", "chi", "compact", "path", "disorder", "revolution", "marie", "cemetery", "earliest", 
    "direction", "slide", "books", "consequently", "gourmet", "sports", "bite", "material", "nickname", 
    "burning", "caroline", "titten", "addition", "juice", "oscar", "measures", "pharmacology", "assumes", "professor", "adjustments", 
    "yeast", "monte", "magazines", "blessed", "partially", "whole", "reform", "distinction", "annex", "arm", "usage", "sen", 
    "buried", "stuffed", "continues", "game", "inf", "minimum", "inquiry", "visits", "kim", "campaigns", "album", "teen", 
    "ethical", "sic", "architecture", "judge", "nursery", "half", "textile", "mambo", "politicians", "offline", "you", "consistency", 
    "refused", "crimes", "cruz", "maintains", "prepare", "beatles", "manor", "things", "standard", "adaptation", "cons", 
    "market", "crops", "chuck", "configure", "scheme", "platforms", "obvious", "atm", "wants", "guides", "statewide", "goods", 
    "supported", "tennessee", "chaos", "zum", "rights", "hamburg", "bachelor", "infant", "take", "espn", "died", "decision", 
    "importantly", "defining", "wallpapers", "prep", "sept", "sapphire", "careful", "albany", "holly", "liberty", "appropriations", 
    "depends", "heavily", "shemales", "undergraduate", "relaxation", "injury", "placement", "stress", "day", "recipient", 
    "achieving", "header", "explanation", "figures", "grove", "amd", "currently", "immigrants", 
    "strings", "protein", "lung", "spending", "donation", "inter", "belly", "product", "tent", "instead", 
    "css", "fuzzy", "observed", "leasing", "several", "moldova", "remove", "complaint", "correct", "accountability", "bolt", 
    "second", "serial", "wrapped", "screw", "sake", "tasks", "recommend", "spring", "bad", "grants", "ken", "illustration", 
    "upgrades", "chronicles", "agencies", "missile", "limits", "varying", "laundry", "emission", "bow", "honey", "expenditures", 
    "library", "xxx", "merit", "selections", "wearing", "differently", "forests", "pounds", "restrict", "containing", "apnic", 
    "florence", "other", "ddr", "interracial", "initiated", "ins", "units", "attempt", "ran", "railroad", "appearance", "over", 
    "trials", "paint", "performs", "deborah", "tears", "merely", "none", "realtors", "ryan", "gpl", "def", "queens", "jewish", 
    "receive", "cables", "tuner", "intelligent", "louis", "beds", "restricted", "gangbang", "earth", "internet", "best", 
    "master", "screensavers", "continuity", "swift", "luis", "iso", "shall", "jane", "fool", "posts", "different", "teacher", 
    "manual", "scholarships", "mad", "clearing", "improvements", "lancaster", "federation", "nut", "ceiling", "furnishings", 
    "twice", "concepts", "francis", "give", "licenses", "down", "context", "scored", "deficit", "dos", "demands", "spam", 
    "tom", "suggest", "bind", "rich", "perspective", "thanksgiving", "dave", "metallica", "greece", "translation", "adventure", 
    "rail", "plaza", "stability", "chart", "paperback", "component", "abuse", "tel", "daniel", "backing", "feelings", "rid", 
    "skills", "reed", "filled", "voyeurweb", "proceeds", "ministries", "delivering", "departments", "deployment", "framing", 
    "pan", "contacting", "shakespeare", "retained", "remedy", "answer", "denial", "events", "opens", "integral", "tried", 
    "recorded", "fallen", "accurately", "coupons", "sending", "levy", "hot", "ppm", "commands", "hosts", "wireless", "above", 
    "thriller", "off", "forecast", "fundamental", "thanks", "harbor", "dark", "manner", "usb", "instance", "imagine", "bridge", 
    "tigers", "cigarettes", "deviant", "include", "fame", "qualifying", "distant", "minds", "trainer", "wonderful", "involving", 
    "visit", "chorus", "prediction", "associate", "threats", "contributor", "restaurant", "strategies", "postage", "sounds", 
    "watching", "die", "demonstrated", "florist", "transition", "greatest", "postal", "format", "playstation", 
    "blowing", "graphs"
]

const stages = [`
    
          
Welcome to Hangman!
I'm thinking of a random (common) english word...
You may guess single letters or whole words.
Good Luck!
    
    
`,`
    
          
          
         
           
          
    
    
+===+===+`,`
    +
    |      
    |      
    |     
    |       
    |      
    |
    | 
+===+===+`,`
    +
    |      
    |      
    |     
    |       
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    |      
    |      
    |     
    |       
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     
    |/     
    |     
    |      
    |     
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |      
    |         
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |       |
    |       |  
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |      /|\\
    |       |  
    |       
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |      /|\\
    |       |  
    |      / \\
   /|\\
  / | \\
+===+===+`]

terminal.addCommand("hangman", async function(args) {
    let secretWord = englishWords[Math.floor(Math.random() * englishWords.length)]
    let guessedLetters = []
    let correctLetters = new Set()
    let coveredLetters = "_".repeat(secretWord.length).split("")
    let stageIndex = 0

    let stageOutput = terminal.print("", undefined, {forceElement: true})
    terminal.addLineBreak(2)
    let letterOutput = terminal.print("", undefined, {forceElement: true})

    while (stageIndex + 1 < stages.length) {
        stageOutput.textContent = stages[stageIndex] + "\n"
        if (guessedLetters.length)
            stageOutput.textContent += `(${guessedLetters.length}) ${guessedLetters.join(",")}`
        letterOutput.textContent = coveredLetters.join(" ") + " : "

        if (!coveredLetters.includes("_"))
            break

        let guess = await terminal.prompt("", {printInputAfter: false})

        if (correctLetters.has(guess))
            continue
        
        if (guess.length == 1) {
            let replaceCount = 0
            for (let i = 0; i < secretWord.length; i++) {
                if (coveredLetters[i] == "_" && secretWord.charAt(i) == guess) {
                    coveredLetters[i] = guess
                    replaceCount++
                    correctLetters.add(guess)
                }
            }

            if (!replaceCount && !guessedLetters.includes(guess)) {
                guessedLetters.push(guess)
                stageIndex++
            }
        } else if (guess.length == 0) {
            // do nothing
        } else {
            if (guess.trim().toLowerCase() == secretWord.toLowerCase()) {
                break
            } else if (guess.length == secretWord.length) {
                stageIndex++
            }
        }
    }

    stageOutput.textContent = stages[stageIndex]

    if (stageIndex == stages.length - 1) {
        terminal.printLine("You lost!", Color.ERROR)
        terminal.printLine(`The correct word was: ${secretWord}`)
    } else {
        letterOutput.textContent = secretWord.split("").join(" ") + " : "
        terminal.printSuccess("You won!")
    }
}, {
    description: "play a game of hangman",
    isGame: true
})
// ------------------- head.js --------------------
terminal.addCommand("head", function(args) {
    let file = terminal.getFile(args.file)
    if (file.isDirectory)
        throw new Error("Cannot display a folder")
    if (file.content.length == 0)
        throw new Error("File is empty")
    let lines = file.content.split("\n")
    let result = lines.slice(0, args.l).join("\n")
    terminal.printLine(result)
}, {
    description: "display the first lines of a file",
    args: ["file", "?l:i:1~1000"],
    standardVals: {
        l: 10
    }
})


// ------------------- helloworld.js --------------------
terminal.addCommand("helloworld", async function() {
    const welcomeLineFuncs = [
        () => terminal.print("                  _    __      _          _      _      _       "),
        () => terminal.print("                 | |  / _|    (_)        | |    (_)    | |      "),
        () => terminal.print(" _ __   ___   ___| | | |_ _ __ _  ___  __| |_ __ _  ___| |__    "),
        () => terminal.print("| '_ \\ / _ \\ / _ \\ | |  _| '__| |/ _ \\/ _\` | '__| |/ __| '_ \\   "),
        () => terminal.print("| | | | (_) |  __/ |_| | | |  | |  __/ (_| | |  | | (__| | | |  "),
        () => terminal.print("|_| |_|\\___/ \\___|_(_)_| |_|  |_|\\___|\\__,_|_|  |_|\\___|_| |_|  "),
        () => terminal.print("                                                                "),
        () => terminal.print("Welcome to my website! It's also a very interactive terminal!   "),
        () => terminal.print("You may enter commands to navigate over 200 unique features.    "),
        () => {
            terminal.print("Start your adventure using the ")
            terminal.printCommand("help", "help", undefined, false)
            terminal.print(" command. Have lots of fun!  ")
        },
        () => terminal.print("                                                                "),
        () => {
            terminal.printLink("Blog", "https://noel-friedrich.de/blobber", undefined, false)
            terminal.print(" ")
            terminal.printLink("Github", "https://github.com/noel-friedrich/terminal", undefined, false)
            terminal.print(" ")
            terminal.printLink("Perli", "https://noel-friedrich.de/perli", undefined, false)
            terminal.print(" ")
            terminal.printLink("Compli", "https://play.google.com/store/apps/details?id=de.noelfriedrich.compli", undefined, false)
            terminal.print(" ")
            terminal.printLink("AntiCookieBox", "https://noel-friedrich.de/anticookiebox", undefined, false)
            terminal.print(" ")
            terminal.printLink("Partycolo", "https://noel-friedrich.de/partycolo", undefined, false)
            terminal.print(" ")
            terminal.printLink("Spion", "https://noel-friedrich.de/spion", undefined, false)
            terminal.print(" ")
            terminal.printLink("YouTube", "https://www.youtube.com/@noel.friedrich", undefined, false)
            terminal.print("  ")
        }
    ]

    let size = {
        x: welcomeLineFuncs.length * 2,
        y: welcomeLineFuncs.length
    }

    const maxLineWidth = 64
    for (let i = 0; i < size.y; i++) {

        welcomeLineFuncs[i]()
        
        for (let j = 0; j < size.x; j++) {
            let x = (j / size.x - 0.5) * 2
            let y = (i / size.y - 0.5) * 2
            if (x*x + y*y > 1) {
                terminal.print(" ")
            } else {
                let angle = Math.atan2(y, x) / Math.PI * 180
                let hue = Math.round(angle)
                let lightness = Math.round(90 - (x*x + y*y) * 90)
                terminal.print("#", Color.hsl(hue / 360, 1, lightness / 100))
            }
        }
        terminal.addLineBreak()
    }
}, {
    description: "display the hello-world text",
    rawArgMode: true,
})
// ------------------- help.js --------------------
terminal.addCommand("help", function() {
    terminal.printLine("Welcome to the Help Menu!", Color.COLOR_1)
    terminal.printLine("Here are some commands to try out:\n")
    let helpCommands = ["cat", "cd", "games", "ls", "lscmds", "man", "turtlo", "easter-eggs", "contact"]
    let longestCommandLength = helpCommands.reduce((p, c) => Math.max(p, c.length), 0)
    for (let command of helpCommands.sort((a, b) => a.localeCompare(b))) {
        let spaces = strRepeat(" ", longestCommandLength - command.length + 2)
        let description = terminal.allCommands[command]
        terminal.printCommand(`  ${command}${spaces}`, command, Color.PURPLE, false)
        terminal.printLine(`${description}`)
    }
    terminal.printLine("\n(there are also A LOT of secret ones)")
}, {
    description: "shows this help menu",
})
// ------------------- hi.js --------------------
async function funnyPrint(msg) {
    let colors = msg.split("").map(Color.niceRandom)
    for (let i = 0; i < msg.length; i++) {
        terminal.print(msg[i], colors[i])
        await sleep(100)
    }
    terminal.addLineBreak()
}

terminal.addCommand("hi", async () => await funnyPrint("hello there!"), {
    description: "say hello to the terminal"
})
// ------------------- highscore-admin.js --------------------
terminal.addCommand("highscore-admin", async function(args) {
    await terminal.modules.import("game", window)
    
    if (args.d) {
        localStorage.removeItem("highscore_password")
        HighscoreApi.tempPassword = null
        terminal.printLine("Removed password from local storage")
        return
    }
    await HighscoreApi.loginAdmin()
}, {
    description: "Login as Admin",
    isSecret: true,
    args: {
        "?d": "Delete password from local storage"
    }
})
// ------------------- highscore-remove.js --------------------
terminal.addCommand("highscore-remove", async function(args) {
    
    await terminal.modules.import("game", window)
    await HighscoreApi.loginAdmin(true)
    if (args.uid) {
        await HighscoreApi.removeHighscore(HighscoreApi.tempPassword, args.uid)
        terminal.printSuccess("Removed highscore #" + args.uid)
        return
    }

    terminal.printLine(`Highscores for ${args.game}:`)

    let highscores = (await HighscoreApi.getHighscores(args.game))
        .slice(0, args.l).filter(h => h.name == args.n || args.n == null)

    if (highscores.length == 0)
        throw new Error("No highscores found")

    let maxNameLength = Math.max(...highscores.map(h => h.name.length))
    let maxScoreLength = Math.max(...highscores.map(h => h.score.toString().length))
    for (let highscore of highscores) {
        terminal.print(stringPadBack(highscore.name, maxNameLength + 2))
        terminal.print(stringPadBack(highscore.score, maxScoreLength + 2))
        terminal.print(highscore.time + "  ")
        terminal.printCommand("Remove", "highscore-remove x --uid " + highscore.uid)
    }
}, {
    description: "Remove a highscore",
    isSecret: true,
    args: {
        "game": "the game to remove the highscore from",
        "?n": "only show highscores with this name",
        "?l:n:1~10000": "limit the number of highscores to show",
        "?uid": "the uid of the highscore to remove",
    },
    standardVals: {
        "n": null,
        "l": Infinity
    }
})
// ------------------- highscores.js --------------------
terminal.addCommand("highscores", async function(args) {
    if (args["show-all"]) args.l = Infinity

    await terminal.modules.import("game", window)

    {
        let commandName = args.game.split(":")[0]
        if (!terminal.commandExists(args.game.split(":")[0]))
            throw new Error(`Game ${commandName} not found`)
        let terminalFunc = await terminal.loadCommand(commandName)
        if (!terminalFunc.info.isGame)
            throw new Error(`Game ${commandName} not found`)
    }

    let allHighscores = await HighscoreApi.getHighscores(args.game)
    let highscores = allHighscores
        .filter(h => h.name == args.n || args.n == null)
        .slice(0, args.l)

    if (highscores.length == 0) {
        if (args.n != null)
            throw new Error(`No highscores found for ${args.n}`)
        else
            throw new Error("No highscores found")
    }

    let tableData = []
    for (let highscore of highscores) {
        let rank = await HighscoreApi.getRank(args.game, highscore.score, allHighscores)
        tableData.push([rank, highscore.name, Math.abs(highscore.score), highscore.time])
    }
    
    terminal.printTable(tableData, ["Rank", "Name", "Score", "Time"])
    
    if (highscores.length != allHighscores.length) {
        terminal.print(`(showing ${highscores.length} of ${allHighscores.length} highscores. `)
        let cmdText = `highscores ${args.game} --show-all`
        if (args.n != null) cmdText += ` -n ${args.n}`
        terminal.printCommand("show all", cmdText, undefined, false)
        terminal.printLine(")")
    }

}, {
    description: "Show global highscores for a game",
    args: {
        "game:s": "the game to show the highscores for",
        "?n:s": "only show highscores with this name",
        "?l:i:1~10000": "limit the number of highscores to show",
        "?show-all:b": "show all highscores, not just the top ones"
    },
    standardVals: {
        "n": null,
        "l": 10
    }
})
// ------------------- history.js --------------------
terminal.addCommand("history", function(args) {
    let sliceLimit = args["show-full"] ? Infinity : 50
    let output = ""
    for (let i = Math.max(0, terminal.prevCommands.length - args.l); i < terminal.prevCommands.length; i++) {
        if (terminal.prevCommands[i].length >= sliceLimit) {
            output += `${i + 1}: ${terminal.prevCommands[i].slice(0, sliceLimit)} [...]\n`
        } else {
            output += `${i + 1}: ${terminal.prevCommands[i]}\n`
        }
    }
    terminal.printLine(output.slice(0, -1))
}, {
    description: "print the command history",
    args: {
        "?l=limit:n:1~100000": "the maximum number of commands to print",
        "?show-full:b": "show the full command instead of the shortened version"
    },
    standardVals: {
        l: 1000
    }
})
// ------------------- hr-draw.js --------------------
terminal.addCommand("hr-draw", async function(args) {
    const makeCanvas = (data, width=30) => {
        const canvas = terminal.document.createElement("canvas")

        const sizePx = width * terminal.charWidth
        canvas.width = sizePx
        canvas.height = canvas.width * (data.length / data[0].length)

        terminal.parentNode.appendChild(canvas)
        terminal.addLineBreak()

        return canvas
    }

    const drawPixelData = (context, data) => {
        const canvas = context.canvas

        const xStep = canvas.width / data[0].length
        const yStep = canvas.height / data.length

        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = "blue"
        for (let x = 0; x < data[0].length; x++) {
            for (let y = 0; y < data.length; y++) {
                if (data[y][x]) {
                    context.fillRect(
                        x * xStep, y * yStep,
                        xStep, yStep
                    )
                }
            }
        }
    }
    
    let pixelData = Array.from({length: args.height},
        () => Array.from({length: args.width}, () => false))
    
    const canvas = makeCanvas(pixelData)
    const context = canvas.getContext("2d")

    let mouseLeftDown = false
    let mouseRightDown = false

    terminal.window.addEventListener("mousedown", event => {
        if (event.button == 0) mouseLeftDown = true
        if (event.button == 2) mouseRightDown = true
        canvas.onmousemove(event)
    })
    terminal.window.addEventListener("contextmenu", event => {
        event.preventDefault()
    })
    terminal.window.addEventListener("mouseup", _ => {
        mouseLeftDown = false
        mouseRightDown = false
    })

    const eventToPos = event => {
        let rect = canvas.getBoundingClientRect()
        let xPx = event.clientX - rect.left
        let yPx = event.clientY - rect.top
        let x = Math.floor(xPx / (canvas.width / pixelData[0].length))
        let y = Math.floor(yPx / (canvas.height / pixelData.length))
        x = Math.min(Math.max(0, x), pixelData[0].length - 1)
        y = Math.min(Math.max(0, y), pixelData.length - 1)
        return {x, y}
    }

    canvas.onmousemove = event => {
        let {x, y} = eventToPos(event)
        pixelData[y][x] = mouseRightDown ? false : (mouseLeftDown ? true : pixelData[y][x])
        drawPixelData(context, pixelData)
    }

    const getBinaryData = () => {
        let output = "0b"
        for (let i = 0; i < args.width * args.height; i++) {
            let x = i % args.width
            let y = (i - x) / args.height
            if (pixelData[y][x]) {
                output += "1"
            } else {
                output += "0"
            }
        }
        return output
    }

    drawPixelData(context, pixelData)

    let running = true

    terminal.onInterrupt(() => running = false)

    terminal.window.addEventListener("keydown", event => {
        if (event.key.length != 1 || !running) return
        let output = `"${event.key}": ${getBinaryData()}`
        terminal.printLine(output)
        terminal.copy(output)
    })

    while (running) {
        await sleep(100)
    }

}, {
    description: "turn drawings into bitmaps",
    args: {
        "?x=width:i:1~100": "width (pixels)",
        "?y=height:i:1~100": "height (pixels)" 
    },
    defaultValues: {
        width: 5,
        height: 5
    },
    isSecret: true
})
// ------------------- hr.js --------------------
const letterData = {
    "4x4": {
        letters: {
            "A": 0b1111100111111001, "B": 0b1100101011011010, "C": 0b1111100010001111,
            "D": 0b1110100110011110, "E": 0b1111111010001111, "F": 0b1111100011101000,
            "G": 0b1111100010011111, "H": 0b1001100111111001, "I": 0b1111010001001111,
            "J": 0b1111000110011111, "K": 0b1011110010101001, "L": 0b1000100010001111,
            "M": 0b1111101110011001, "N": 0b1101101110011001, "O": 0b1111100110011111,
            "P": 0b1111100111111000, "Q": 0b1111100110111111, "R": 0b1111100111111010,
            "S": 0b1111100011110111, "T": 0b1111010001000100, "U": 0b1001100110011111,
            "V": 0b1001100110010110, "W": 0b1001100110111111, "X": 0b1001011001101001,
            "Y": 0b1001100111110100, "Z": 0b1111001001001111, "0": 0b1111101111011111,
            "1": 0b0010011000100111, "2": 0b1111001001001111, "3": 0b1111011100011111,
            "4": 0b1001100111110001, "5": 0b1111100011110111, "6": 0b1000111110011111,
            "7": 0b1111000100010001, "8": 0b1110101111010111, "9": 0b1111100111110001,
            " ": 0b0000000000000000
        },
        size: 4
    },
    "5x5": {
        letters: {
            "A": 0b1111110001111111000110001, "B": 0b1111010001111111000111110,
            "C": 0b1111110000100001000011111, "D": 0b1111010001100011000111110,
            "E": 0b1111110000111101000011111, "F": 0b1111110000111101000010000,
            "G": 0b1111110000101111000111111, "H": 0b1000110001111111000110001,
            "I": 0b1111100100001000010011111, "J": 0b1111000100001001010011100,
            "K": 0b1001010100110001010010010, "L": 0b1000010000100001000011111,
            "M": 0b1000111011101011000110001, "N": 0b1000111001101011001110001,
            "O": 0b1111110001100011000111111, "P": 0b1111110001111111000010000,
            "Q": 0b1111110001100011001111111, "R": 0b1111110001111111001010001,
            "S": 0b1111110000111110000111111, "T": 0b1111100100001000010000100,
            "U": 0b1000110001100011000111111, "V": 0b1000110001010100101000100,
            "W": 0b1000110001101011101110001, "X": 0b1000101010001000101010001,
            "Y": 0b1000101010001000010000100, "Z": 0b1111100010001000100011111,
            "0": 0b0111010001101011000101110, "1": 0b0110000100001000010000100,
            "2": 0b0110010010001000100011110, "3": 0b1111000010011100001011110,
            "4": 0b1000110001111110000100001, "5": 0b0111010000111100001011110,
            "6": 0b1111010000111101001011110, "7": 0b1111000010001000100010000,
            "8": 0b1111010010011001001011110, "9": 0b1111010010111100001011110,
            " ": 0b0000000000000000000000000, "/": 0b0001100110011001100010000,
            "\\": 0b1100001100001100001100001, "#": 0b0101011111010101111101010,
            "?": 0b1111100001001110000000100, ":": 0b0110001100000000110001100,
            "-": 0b0000000000011100000000000, ".": 0b0000000000000000110001100,
            ",": 0b0000000000001000110001000, 
            "a": 0b0000001110100101001001111, "b": 0b1000010000111001001011100,
            "c": 0b0000001110100001000001110, "d": 0b0001000010011101001001110,
            "e": 0b0110010010111101000001110, "f": 0b0001000100011100010000100,
            "g": 0b0110010010011100001011100, "h": 0b1000010000111001001010010,
            "i": 0b0010000000011100010001110, "j": 0b0010000000001000010011000,
            "k": 0b0100001000010100110001010, "l": 0b0100001000010000101000100,
            "m": 0b0000000000010101010110001, "n": 0b0000000000111001001010010,
            "o": 0b0000001100100101001001100, "p": 0b0000001110010100111001000,
            "q": 0b0000001110010100111000010, "r": 0b0000000000001100100001000,
            "s": 0b0000000110010000011001100, "t": 0b0010001110001000010000110,
            "u": 0b0000000000010100101000110, "v": 0b0000000000010100101000100,
            "w": 0b0000000000100011010101011, "x": 0b0000000000010100010001010,
            "y": 0b0101001010001100001000100, "z": 0b0000001110000100010001110
        },
        size: 5
    }
}

const randomCharData = size => {
    let out = ""
    for (let i = 0; i < size*size; i++) {
        out += (Math.random() < 0.5) ? "0" : "1"
    }
    return parseInt(out, 2)
}

const maxCodeSize = 100

terminal.addCommand("hr", async function(args) {
    const fontData = letterData[args.fontmode]
    if (fontData === undefined) {
        throw new Error(`Unknown fontmode "${args.fontmode}"`)
    }

    const symbols = Array.from(args.message).map(letter => fontData.letters[letter])

    if (symbols.some(s => s === undefined)) {
        throw new Error("Message contains unsupported characters!")
    }

    let codeSize = 1
    for (; (codeSize ** 2) < symbols.length; codeSize++) {
        if (codeSize >= maxCodeSize) {
            throw new Error("Maximum Code Size exeeded.")
        }
    }
    
    let sizePx = (fontData.size + 1) * codeSize - 1
    let pixelData = Array.from({length: sizePx + 2},
        () => Array.from({length: sizePx + 2}, () => false))

    while (args.fill && symbols.length < (codeSize * codeSize)) {
        // let randomIndex = Math.floor(Math.random() * pixelData.length)
        // symbols.splice(randomIndex, 0, randomCharData(fontData.size))
        symbols.push(randomCharData(fontData.size))
    }

    const drawPixelData = (data, width=30) => {
        const canvas = terminal.document.createElement("canvas")
        const context = canvas.getContext("2d")

        const sizePx = width * terminal.charWidth
        canvas.width = sizePx
        canvas.height = canvas.width * (data.length / data[0].length)

        const xStep = canvas.width / data[0].length
        const yStep = canvas.height / data.length

        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = "black"
        for (let x = 0; x < data[0].length; x++) {
            for (let y = 0; y < data.length; y++) {
                if (data[y][x]) {
                    context.fillRect(
                        x * xStep, y * yStep,
                        xStep, yStep
                    )
                }
            }
        }

        terminal.parentNode.appendChild(canvas)
        terminal.addLineBreak()
    }

    for (let i = 0; i < symbols.length; i++) {
        let px = (i % codeSize) * (fontData.size + 1) + 1
        let py = Math.floor(i / codeSize) * (fontData.size + 1) + 1

        for (let j = 0; j < fontData.size ** 2; j++) {
            let bitMask = (1 << (fontData.size ** 2 - j - 1))
            let bitActive = (symbols[i] & bitMask) != 0
            if (bitActive) {
                let x = j % fontData.size
                let y = Math.floor(j / fontData.size)
                pixelData[py + y][px + x] = true
            }
        }
    }

    drawPixelData(pixelData)
}, {
    description: "create a hr code",
    args: {
        "message:s": "the message to encode",
        "?f=fontmode:s": "the font mode to use",
        "?fill:b": "fill empty spaces with random data"
    },
    defaultValues: {
        fontmode: "5x5"
    }
})
// ------------------- href.js --------------------
terminal.addCommand("href", function(args) {
    function href(url) {
        if (!url.includes(".")) url = `noel-friedrich.de/${url}`
        if (!url.startsWith("http")) url = "https://" + url
        terminal.window.open(url, "_blank").focus()
    }

    if (args.url && args.file) {
        throw new Error("Too many arguments provided. Please provide either a url or a file.")
    }

    if (args.url) {
        href(args.url)
    } else if (args.file) {
        let file = terminal.getFile(args.file, FileType.PROGRAM)
        href(file.content)
    } else {
        throw new Error("Please provide either a url or a file.")
    }
}, {
    description: "open a link in another tab",
    args: {
        "?u=url:s": "url to open",
        "?f=file:s": "file to open"
    }
})


// ------------------- image-crop.js --------------------
terminal.addCommand("image-crop", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../image-crop/",
        name: "Image Cropper"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start image cropper program"
})
// ------------------- img2ascii.js --------------------
terminal.addCommand("img2ascii", async function(args) {
    await terminal.modules.load("upload", terminal)

    let image = await terminal.modules.upload.image()

    let outputSize = {x: args.width, y: 0}
    outputSize.y = parseInt(outputSize.x * (image.height / image.width) * 0.6)

    let asciiChars = " .:-=+*#%@"

    let tempCanvas = document.createElement("canvas")
    tempCanvas.style.display = "none"
    document.body.appendChild(tempCanvas)
    tempCanvas.width = image.width
    tempCanvas.height = image.height

    let context = tempCanvas.getContext("2d")
    context.drawImage(image, 0, 0)

    let imageData = context.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

    let xStep = parseInt(tempCanvas.width / outputSize.x)
    let yStep = parseInt(tempCanvas.height / outputSize.y)
    
    function getAverageColor(blockX, blockY) {
        let colorSum = 0
        let colorCount = 0
        let i = blockY * yStep * tempCanvas.width * 4 + blockX * 4 * xStep
        for (let y = 0; y < yStep; y++) {
            for (let x = 0; x < xStep; x++) {
                colorSum += imageData.data[i + 0]
                colorSum += imageData.data[i + 1]
                colorSum += imageData.data[i + 2]
                colorCount += 3
                i += 4
            }
            i += tempCanvas.width * 4 - xStep * 4
        }
        return colorSum / colorCount
    }

    terminal.printLine()
    for (let i = 0; i < outputSize.y; i++) {
        for (let j = 0; j < outputSize.x; j++) {
            let averageColor = getAverageColor(j, i)
            let char = asciiChars[parseInt((asciiChars.length - 1) * (averageColor / 255))]
            terminal.print(char)
        }
        terminal.printLine()
    }
}, {
    description: "Convert an image to ASCII art",
    args: {
        "?w=width:i:1~500": "the width of the output image in characters"
    },
    defaultValues: {
        width: 60
    }
})
// ------------------- isprime.js --------------------
terminal.addCommand("isprime", async function(args) {
    function isPrime(n) {
        if (n < 2)
            return false
        if (n === 2)
            return true
        if (n % 2 === 0)
            return false
        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0)
                return false
        }
        return true
    }

    let result = isPrime(args.n)
    if (result) {
        terminal.printLine(`${args.n} is prime`)
    } else {
        terminal.printLine(`${args.n} is not prime`)
    }
}, {
    description: "Check if a number is prime",
    args: {
        "n:i": "The number to check"
    }
})
// ------------------- joke.js --------------------
terminal.addCommand("joke", async function(args) {
    let response = await fetch("https://official-joke-api.appspot.com/random_joke")
    let joke = await response.json()
    terminal.printLine(joke.setup)
    await sleep(3000)
    terminal.printLine(joke.punchline)
}, {
    description: "tell a joke",
})


// ------------------- kaprekar.js --------------------
terminal.addCommand("kaprekar", async function(args) {
    let startNumber = ~~args.n
    let numDigits = startNumber.toString().length

    let history = new Set([startNumber])

    function f(n) {
        let a = Array.from(n.toString())
        let b = Array.from(n.toString())

        while (a.length < numDigits)
            a.push("0")

        while (b.length < numDigits)
            b.push("0")

        a = a.sort().join("")
        b = b.sort((a, b) => b - a).join("")

        let m = b - a

        terminal.printLine(`${b} - ${a} = ${stringPad(m, numDigits, "0")}`)

        if (n === m || m === 0)
            return n

        if (history.has(m)) {
            terminal.printLine("Cycle detected!")
            return m
        }

        history.add(m)

        return f(m)
    }

    f(startNumber)

}, {
    description: "display the kaprekar steps of a number",
    args: {
        "n:n:1~999999999": "the number to display the kaprekar steps of"
    }
})


// ------------------- keyboard.js --------------------
terminal.addCommand("keyboard", function(args) {
    let mode = args.m || "toggle"

    if (mode == "status") {
        let status = "auto"
        if (terminal.data.mobile === true) {
            status = "on"
        } else if (terminal.data.mobile === false) {
            status = "off"
        }

        terminal.printLine(`keyboard_mode=\"${status}\"`)
        terminal.addLineBreak()
        terminal.printCommand("Set to \"on\"", "keyboard on")
        terminal.printCommand("Set to \"off\"", "keyboard off")
        terminal.printCommand("Set to \"auto\"", "keyboard auto")
    }

    if (mode == "on") {
        terminal.data.mobile = true
        terminal.reload()
    }

    if (mode == "off") {
        terminal.data.mobile = false
        terminal.reload()
    }

    if (mode == "auto") {
        terminal.data.resetProperty("mobile")
        terminal.reload()
    }
}, {
    description: "Toggle mobile mode",
    args: {
        "?m=mode:s": "status | on | off | auto"
    },
    defaultValues: {
        m: "status"
    }
})
// ------------------- kill.js --------------------
terminal.addCommand("kill", async function(args) {
    if (args.process.toLowerCase() == "turtlo") {
        await terminal.modules.load("turtlo", terminal)
        if (terminal.modules.turtlo.kill()) {
            terminal.printLine("done.")
        } else {
            terminal.printLine("i see no turtlo alive here")
        }
    } else {
        terminal.printLine("sorry no killing allowed here (except turtlo)")
    }
}, {
    description: "kill a process",
    args: {
        "process": "the process to kill"
    }
})


// ------------------- labyrinth.js --------------------
terminal.addCommand("labyrinth", async function(args) {
    await terminal.modules.import("game", window)

    let laberynthSize = new Vector2d(15, 15)
    let horizontalResolution = 90
    let verticalResolution = 30
    let FOV = Math.PI / 2
    let FPS = ~~args.fps

    let playerPos = new Vector2d(1, 1)
    let playerAngle = Math.PI / 4
    let playerTurnSpeed = Math.PI / 32
    let playerMoveSpeed = 0.05

    const EMPTY = " "
    const END = "E"
    const WALL = "#"
    const PATH = EMPTY

    function generateTilemap() {
        function isWall(x, y) {
            return x % 2 == 0 || y % 2 == 0
        }

        let tiles = Array.from({length: laberynthSize.y},
            (_, y) => Array.from({length: laberynthSize.x}, (_, x) => isWall(x, y) ? WALL : null))

        // generate maze

        let visitedTiles = [new Vector2d(1, 1)]

        function randomVisitedTile() {
            return visitedTiles[Math.floor(Math.random() * visitedTiles.length)]
        }

        const neighborDirections = [
            new Vector2d(0, -2),
            new Vector2d(0, 2),
            new Vector2d(-2, 0),
            new Vector2d(2, 0)
        ]

        function randomDirection() {
            return neighborDirections[Math.floor(Math.random() * neighborDirections.length)]
        }

        let totalVisibleTiles = (laberynthSize.x - 1) * (laberynthSize.y - 1) / 4 + 1
        while (visitedTiles.length < totalVisibleTiles) {
            let tile = randomVisitedTile()
            let direction = randomDirection()
            let neighbor = tile.add(direction)
            if (tiles[neighbor.y] && tiles[neighbor.y][neighbor.x] === null) {
                tiles[tile.y + direction.y / 2][tile.x + direction.x / 2] = PATH
                tiles[neighbor.y][neighbor.x] = PATH
                visitedTiles.push(neighbor)
            }
        }
        
        return tiles
    }

    let tilemap = generateTilemap()
    let colorMap = generateColormap()

    function setGoal(x, y) {
        tilemap[y][x] = END
        colorMap[y][x] = "white"
    }

    setGoal(laberynthSize.x - 2, laberynthSize.y - 2)

    function generateColormap() {
        let colormap = []
        for (let y = 0; y < laberynthSize.y; y++) {
            let row = []
            for (let x = 0; x < laberynthSize.x; x++) {
                row.push(Math.floor(Math.random() * 360))
            }
            colormap.push(row)
        }
        return colormap
    }

    function darkenColor(hue, distance) {
        let brightness = Math.max(0, 50 - distance * 6)
        return `hsl(${hue}, 30%, ${brightness}%)`
    }

    let drawnElements = []
    let lineElements = [];

    (function firstPrint() {
        terminal.printLine("Use the arrow keys to move around. Press Ctrl+C to quit.")
        terminal.printLine("Your Goal: find the exit (a white box) and run into it as fast as possible!")
        terminal.addLineBreak()
        for (let y = 0; y < verticalResolution; y++) {
            let row = []
            for (let x = 0; x < horizontalResolution; x++) {
                let element = terminal.print(" ", undefined, {forceElement: true})
                element.style.transition = "none"
                row.push(element)
                drawnElements.push(element)
            }
            lineElements.push(row)
            let br = terminal.print("\n", undefined, {forceElement: true})
            drawnElements.push(br)
        }
    })()

    function drawLine(x, height, color="blue") {
        for (let y = 0; y < verticalResolution; y++) {
            let element = lineElements[y][x]
            if (y < verticalResolution / 2 - height / 2 || y > verticalResolution / 2 + height / 2) {
                element.textContent = " "
            } else {
                element.textContent = "#"
                element.style.color = color
            }
        }
    }

    function rayCast(angle, accuracy=0.1) {
        let ray = new Vector2d(Math.cos(angle), Math.sin(angle)).scale(accuracy)
        let rayPos = playerPos.copy()
        let distance = 0
        while (true) {
            rayPos.iadd(ray)
            distance += accuracy
            let value = tilemap[Math.floor(rayPos.y)][Math.floor(rayPos.x)]
            if (value == WALL || value == END) {
                let color = colorMap[Math.floor(rayPos.y)][Math.floor(rayPos.x)]
                return [distance, (typeof color == "string") ? color : darkenColor(color, distance)]
            }
        }
    }

    function drawPlayerview() {
        for (let x = 0; x < horizontalResolution; x++) {
            let angle = FOV / 2 - FOV * x / horizontalResolution
            let [distance, color] = rayCast(playerAngle + angle)
            let height = verticalResolution / distance
            drawLine(x, height, color)
        }
    }

    function playerDirection() {
        return Vector2d.fromAngle(playerAngle)
    }

    let gameRunning = true

    function moveForward() {
        let direction = playerDirection().scale(playerMoveSpeed)
        let newPos = playerPos.add(direction)
        let value = tilemap[Math.floor(newPos.y)][Math.floor(newPos.x)]
        if (value == END) {
            gameRunning = false
        } else if (value != WALL) {
            playerPos = newPos
        }
    }

    function moveBackward() {
        let direction = playerDirection().scale(-playerMoveSpeed)
        let newPos = playerPos.add(direction)
        if (tilemap[Math.floor(newPos.y)][Math.floor(newPos.x)] != WALL) {
            playerPos = newPos
        }
    }

    function removeScreen() {
        for (let element of drawnElements) {
            element.remove()
        }
        drawnElements = []
    }

    function turnLeft() {
        playerAngle += playerTurnSpeed
    }

    function turnRight() {
        playerAngle -= playerTurnSpeed
    }

    let keyDown = {
        "UP": false,
        "DOWN": false,
        "LEFT": false,
        "RIGHT": false
    }

    function parseKeyCode(keycode, up) {
        if (keycode == "ArrowUp" || keycode == "w") {
            keyDown.UP = !up
            return true
        } else if (keycode == "ArrowDown" || keycode == "s") {
            keyDown.DOWN = !up
            return true
        } else if (keycode == "ArrowLeft" || keycode == "a") {
            keyDown.LEFT = !up
            return true
        } else if (keycode == "ArrowRight" || keycode == "d") {
            keyDown.RIGHT = !up
            return true
        }
    }

    let upListener = addEventListener("keyup", function(event) {
        if (!gameRunning) return

        if (parseKeyCode(event.key, true)) event.preventDefault()
    })

    let downListener = addEventListener("keydown", function(event) {
        if (!gameRunning) return

        if (event.key == "c" && event.ctrlKey) {
            gameRunning = false
            removeScreen()
            removeEventListener("keydown", downListener)
            removeEventListener("keyup", upListener)
        }

        if (parseKeyCode(event.key, false)) event.preventDefault()
    })

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout(
            terminal.mobileKeyboard.Layout.ARROWS
        )

        terminal.mobileKeyboard.onkeydown = function(event, keyCode) {
            parseKeyCode(keyCode, false)
        }

        terminal.mobileKeyboard.onkeyup = function(event, keyCode) {
            parseKeyCode(keyCode, true)
        }
    }

    function processInput() {
        if (keyDown.UP) moveForward()
        if (keyDown.DOWN) moveBackward()
        if (keyDown.LEFT) turnLeft()
        if (keyDown.RIGHT) turnRight()
    }

    terminal.scroll()
    
    let score = 0

    while (gameRunning) {
        score++
        let startTime = performance.now()
        processInput()
        drawPlayerview()
        let deltaMs = performance.now() - startTime
        await sleep(1000 / FPS - deltaMs)
    }

    score *= -1

    removeScreen()
    terminal.addLineBreak()
    terminal.printLine(`You won! Your score is ${Math.abs(score)}.`)

    await HighscoreApi.registerProcess("labyrinth")
    await HighscoreApi.uploadScore(score)

}, {
    description: "play a game of labyrinth",
    isGame: true,
    args: {
        "?fps:n:1~60": "the frames per second of the game",
    },
    standardVals: {
        fps: 30
    }
})
// ------------------- letters.js --------------------
const AsciiArtLetters = {}
{
    let chars = "abcdefghijklmnopqrstuvwxyz"
    chars += "0123456789"
    chars += ".-,!? +"

    for (let char of chars) {
        AsciiArtLetters[char] = ""
    }
}

AsciiArtLetters["a"] += "       \n"
AsciiArtLetters["a"] += "       \n"
AsciiArtLetters["a"] += "  __ _ \n"
AsciiArtLetters["a"] += " / _` |\n"
AsciiArtLetters["a"] += "| (_| |\n"
AsciiArtLetters["a"] += " \\__,_|\n"
AsciiArtLetters["a"] += "       \n"
AsciiArtLetters["a"] += "       \n"

AsciiArtLetters["b"] += "  _     \n"
AsciiArtLetters["b"] += " | |    \n"
AsciiArtLetters["b"] += " | |__  \n"
AsciiArtLetters["b"] += " | '_ \\ \n"
AsciiArtLetters["b"] += " | |_) |\n"
AsciiArtLetters["b"] += " |_.__/ \n"
AsciiArtLetters["b"] += "        \n"
AsciiArtLetters["b"] += "        \n"

AsciiArtLetters["c"] += "      \n"
AsciiArtLetters["c"] += "      \n"
AsciiArtLetters["c"] += "  ___ \n"
AsciiArtLetters["c"] += " / __|\n"
AsciiArtLetters["c"] += "| (__ \n"
AsciiArtLetters["c"] += " \\___|\n"
AsciiArtLetters["c"] += "      \n"
AsciiArtLetters["c"] += "      \n"

AsciiArtLetters["d"] += "     _ \n"
AsciiArtLetters["d"] += "    | |\n"
AsciiArtLetters["d"] += "  __| |\n"
AsciiArtLetters["d"] += " / _` |\n"
AsciiArtLetters["d"] += "| (_| |\n"
AsciiArtLetters["d"] += " \\__,_|\n"
AsciiArtLetters["d"] += "       \n"
AsciiArtLetters["d"] += "       \n"

AsciiArtLetters["e"] += "      \n"
AsciiArtLetters["e"] += "      \n"
AsciiArtLetters["e"] += "  ___ \n"
AsciiArtLetters["e"] += " / _ \\\n"
AsciiArtLetters["e"] += "|  __/\n"
AsciiArtLetters["e"] += " \\___|\n"
AsciiArtLetters["e"] += "      \n"
AsciiArtLetters["e"] += "      \n"

AsciiArtLetters["f"] += "  __ \n"
AsciiArtLetters["f"] += " / _|\n"
AsciiArtLetters["f"] += "| |_ \n"
AsciiArtLetters["f"] += "|  _|\n"
AsciiArtLetters["f"] += "| |  \n"
AsciiArtLetters["f"] += "|_|  \n"
AsciiArtLetters["f"] += "     \n"
AsciiArtLetters["f"] += "     \n"

AsciiArtLetters["g"] += "       \n"
AsciiArtLetters["g"] += "       \n"
AsciiArtLetters["g"] += "  __ _ \n"
AsciiArtLetters["g"] += " / _` |\n"
AsciiArtLetters["g"] += "| (_| |\n"
AsciiArtLetters["g"] += " \\__, |\n"
AsciiArtLetters["g"] += "  __/ |\n"
AsciiArtLetters["g"] += " |___/ \n"

AsciiArtLetters["h"] += " _     \n"
AsciiArtLetters["h"] += "| |    \n"
AsciiArtLetters["h"] += "| |__  \n"
AsciiArtLetters["h"] += "| '_ \\ \n"
AsciiArtLetters["h"] += "| | | |\n"
AsciiArtLetters["h"] += "|_| |_|\n"
AsciiArtLetters["h"] += "       \n"
AsciiArtLetters["h"] += "       \n"

AsciiArtLetters["i"] += " _ \n"
AsciiArtLetters["i"] += "(_)\n"
AsciiArtLetters["i"] += " _ \n"
AsciiArtLetters["i"] += "| |\n"
AsciiArtLetters["i"] += "| |\n"
AsciiArtLetters["i"] += "|_|\n"
AsciiArtLetters["i"] += "   \n"
AsciiArtLetters["i"] += "   \n"

AsciiArtLetters["j"] += "     \n"
AsciiArtLetters["j"] += "     \n"
AsciiArtLetters["j"] += "   _ \n"
AsciiArtLetters["j"] += "  (_)\n"
AsciiArtLetters["j"] += "   _ \n"
AsciiArtLetters["j"] += "  | |\n"
AsciiArtLetters["j"] += "  | |\n"
AsciiArtLetters["j"] += "  | |\n"
AsciiArtLetters["j"] += " _/ |\n"
AsciiArtLetters["j"] += "|__/ \n"

AsciiArtLetters["k"] += " _    \n"
AsciiArtLetters["k"] += "| |   \n"
AsciiArtLetters["k"] += "| | __\n"
AsciiArtLetters["k"] += "| |/ /\n"
AsciiArtLetters["k"] += "|   < \n"
AsciiArtLetters["k"] += "|_|\\_\\\n"
AsciiArtLetters["k"] += "      \n"
AsciiArtLetters["k"] += "      \n"

AsciiArtLetters["l"] += " _ \n"
AsciiArtLetters["l"] += "| |\n"
AsciiArtLetters["l"] += "| |\n"
AsciiArtLetters["l"] += "| |\n"
AsciiArtLetters["l"] += "| |\n"
AsciiArtLetters["l"] += "|_|\n"
AsciiArtLetters["l"] += "   \n"
AsciiArtLetters["l"] += "   \n"

AsciiArtLetters["m"] += "           \n"
AsciiArtLetters["m"] += "           \n"
AsciiArtLetters["m"] += " _ __ ___  \n"
AsciiArtLetters["m"] += "| '_ ` _ \\ \n"
AsciiArtLetters["m"] += "| | | | | |\n"
AsciiArtLetters["m"] += "|_| |_| |_|\n"
AsciiArtLetters["m"] += "           \n"
AsciiArtLetters["m"] += "           \n"

AsciiArtLetters["n"] += "       \n"
AsciiArtLetters["n"] += "       \n"
AsciiArtLetters["n"] += " _ __  \n"
AsciiArtLetters["n"] += "| '_ \\ \n"
AsciiArtLetters["n"] += "| | | |\n"
AsciiArtLetters["n"] += "|_| |_|\n"
AsciiArtLetters["n"] += "       \n"
AsciiArtLetters["n"] += "       \n"

AsciiArtLetters["o"] += "       \n"
AsciiArtLetters["o"] += "       \n"
AsciiArtLetters["o"] += "  ___  \n"
AsciiArtLetters["o"] += " / _ \\ \n"
AsciiArtLetters["o"] += "| (_) |\n"
AsciiArtLetters["o"] += " \\___/ \n"
AsciiArtLetters["o"] += "       \n"
AsciiArtLetters["o"] += "       \n"

AsciiArtLetters["p"] += "       \n"
AsciiArtLetters["p"] += "       \n"
AsciiArtLetters["p"] += " _ __  \n"
AsciiArtLetters["p"] += "| '_ \\ \n"
AsciiArtLetters["p"] += "| |_) |\n"
AsciiArtLetters["p"] += "| .__/ \n"
AsciiArtLetters["p"] += "| |    \n"
AsciiArtLetters["p"] += "|_|    \n"

AsciiArtLetters["q"] += "       \n"
AsciiArtLetters["q"] += "       \n"
AsciiArtLetters["q"] += "  __ _ \n"
AsciiArtLetters["q"] += " / _` |\n"
AsciiArtLetters["q"] += "| (_| |\n"
AsciiArtLetters["q"] += " \\__, |\n"
AsciiArtLetters["q"] += "    | |\n"
AsciiArtLetters["q"] += "    |_|\n"

AsciiArtLetters["r"] += "      \n"
AsciiArtLetters["r"] += "      \n"
AsciiArtLetters["r"] += " _ __ \n"
AsciiArtLetters["r"] += "| '__|\n"
AsciiArtLetters["r"] += "| |   \n"
AsciiArtLetters["r"] += "|_|   \n"
AsciiArtLetters["r"] += "      \n"
AsciiArtLetters["r"] += "      \n"

AsciiArtLetters["s"] += "     \n"
AsciiArtLetters["s"] += "     \n"
AsciiArtLetters["s"] += " ___ \n"
AsciiArtLetters["s"] += "/ __|\n"
AsciiArtLetters["s"] += "\\__ \\\n"
AsciiArtLetters["s"] += "|___/\n"
AsciiArtLetters["s"] += "     \n"
AsciiArtLetters["s"] += "     \n"

AsciiArtLetters["t"] += " _   \n"
AsciiArtLetters["t"] += "| |  \n"
AsciiArtLetters["t"] += "| |_ \n"
AsciiArtLetters["t"] += "| __|\n"
AsciiArtLetters["t"] += "| |_ \n"
AsciiArtLetters["t"] += " \\__|\n"
AsciiArtLetters["t"] += "     \n"
AsciiArtLetters["t"] += "     \n"

AsciiArtLetters["u"] += "       \n"
AsciiArtLetters["u"] += "       \n"
AsciiArtLetters["u"] += " _   _ \n"
AsciiArtLetters["u"] += "| | | |\n"
AsciiArtLetters["u"] += "| |_| |\n"
AsciiArtLetters["u"] += " \\__,_|\n"
AsciiArtLetters["u"] += "       \n"
AsciiArtLetters["u"] += "       \n"

AsciiArtLetters["v"] += "       \n"
AsciiArtLetters["v"] += "       \n"
AsciiArtLetters["v"] += "__   __\n"
AsciiArtLetters["v"] += "\\ \\ / /\n"
AsciiArtLetters["v"] += " \\ V / \n"
AsciiArtLetters["v"] += "  \\_/  \n"
AsciiArtLetters["v"] += "       \n"
AsciiArtLetters["v"] += "       \n"

AsciiArtLetters["w"] += "          \n"
AsciiArtLetters["w"] += "          \n"
AsciiArtLetters["w"] += "__      __\n"
AsciiArtLetters["w"] += "\\ \\ /\\ / /\n"
AsciiArtLetters["w"] += " \\ V  V / \n"
AsciiArtLetters["w"] += "  \\_/\\_/  \n"
AsciiArtLetters["w"] += "          \n"
AsciiArtLetters["w"] += "          \n"

AsciiArtLetters["x"] += "      \n"
AsciiArtLetters["x"] += "      \n"
AsciiArtLetters["x"] += "__  __\n"
AsciiArtLetters["x"] += "\\ \\/ /\n"
AsciiArtLetters["x"] += " >  < \n"
AsciiArtLetters["x"] += "/_/\\_\\ \n"
AsciiArtLetters["x"] += "      \n"
AsciiArtLetters["x"] += "      \n"

AsciiArtLetters["y"] += "       \n"
AsciiArtLetters["y"] += "       \n"
AsciiArtLetters["y"] += " _   _ \n"
AsciiArtLetters["y"] += "| | | |\n"
AsciiArtLetters["y"] += "| |_| |\n"
AsciiArtLetters["y"] += " \\__, |\n"
AsciiArtLetters["y"] += "  __/ |\n"
AsciiArtLetters["y"] += " |___/ \n"

AsciiArtLetters["z"] += "     \n"
AsciiArtLetters["z"] += "     \n"
AsciiArtLetters["z"] += " ____\n"
AsciiArtLetters["z"] += "|_  /\n"
AsciiArtLetters["z"] += " / / \n"
AsciiArtLetters["z"] += "/___|\n"
AsciiArtLetters["z"] += "     \n"
AsciiArtLetters["z"] += "     \n"

AsciiArtLetters["0"] += "  ___  \n"
AsciiArtLetters["0"] += " / _ \\ \n"
AsciiArtLetters["0"] += "| | | |\n"
AsciiArtLetters["0"] += "| | | |\n"
AsciiArtLetters["0"] += "| |_| |\n"
AsciiArtLetters["0"] += " \\___/ \n"
AsciiArtLetters["0"] += "       \n"
AsciiArtLetters["0"] += "       \n"

AsciiArtLetters["1"] += " __ \n"
AsciiArtLetters["1"] += "/_ |\n"
AsciiArtLetters["1"] += " | |\n"
AsciiArtLetters["1"] += " | |\n"
AsciiArtLetters["1"] += " | |\n"
AsciiArtLetters["1"] += " |_|\n"
AsciiArtLetters["1"] += "    \n"
AsciiArtLetters["1"] += "    \n"

AsciiArtLetters["2"] += " ___  \n"
AsciiArtLetters["2"] += "|__ \\ \n"
AsciiArtLetters["2"] += "   ) |\n"
AsciiArtLetters["2"] += "  / / \n"
AsciiArtLetters["2"] += " / /_ \n"
AsciiArtLetters["2"] += "|____|\n"
AsciiArtLetters["2"] += "      \n"
AsciiArtLetters["2"] += "      \n"

AsciiArtLetters["3"] += " ____  \n"
AsciiArtLetters["3"] += "|___ \\ \n"
AsciiArtLetters["3"] += "  __) |\n"
AsciiArtLetters["3"] += " |__ < \n"
AsciiArtLetters["3"] += " ___) |\n"
AsciiArtLetters["3"] += "|____/ \n"
AsciiArtLetters["3"] += "       \n"
AsciiArtLetters["3"] += "       \n"

AsciiArtLetters["4"] += " _  _   \n"
AsciiArtLetters["4"] += "| || |  \n"
AsciiArtLetters["4"] += "| || |_ \n"
AsciiArtLetters["4"] += "|__   _|\n"
AsciiArtLetters["4"] += "   | |  \n"
AsciiArtLetters["4"] += "   |_|  \n"
AsciiArtLetters["4"] += "        \n"
AsciiArtLetters["4"] += "        \n"

AsciiArtLetters["5"] += " _____ \n"
AsciiArtLetters["5"] += "| ____|\n"
AsciiArtLetters["5"] += "| |__  \n"
AsciiArtLetters["5"] += "|___ \\ \n"
AsciiArtLetters["5"] += " ___) |\n"
AsciiArtLetters["5"] += "|____/ \n"
AsciiArtLetters["5"] += "       \n"
AsciiArtLetters["5"] += "       \n"

AsciiArtLetters["6"] += "   __  \n"
AsciiArtLetters["6"] += "  / /  \n"
AsciiArtLetters["6"] += " / /_  \n"
AsciiArtLetters["6"] += "| '_ \\ \n"
AsciiArtLetters["6"] += "| (_) |\n"
AsciiArtLetters["6"] += " \\___/ \n"
AsciiArtLetters["6"] += "       \n"
AsciiArtLetters["6"] += "       \n"

AsciiArtLetters["7"] += " ______ \n"
AsciiArtLetters["7"] += "|____  |\n"
AsciiArtLetters["7"] += "    / / \n"
AsciiArtLetters["7"] += "   / /  \n"
AsciiArtLetters["7"] += "  / /   \n"
AsciiArtLetters["7"] += " /_/    \n"
AsciiArtLetters["7"] += "        \n"
AsciiArtLetters["7"] += "        \n"

AsciiArtLetters["8"] += "  ___  \n"
AsciiArtLetters["8"] += " / _ \\ \n"
AsciiArtLetters["8"] += "| (_) |\n"
AsciiArtLetters["8"] += " > _ < \n"
AsciiArtLetters["8"] += "| (_) |\n"
AsciiArtLetters["8"] += " \\___/ \n"
AsciiArtLetters["8"] += "       \n"
AsciiArtLetters["8"] += "       \n"

AsciiArtLetters["9"] += "  ___  \n"
AsciiArtLetters["9"] += " / _ \\ \n"
AsciiArtLetters["9"] += "| (_) |\n"
AsciiArtLetters["9"] += " \\__, |\n"
AsciiArtLetters["9"] += "   / / \n"
AsciiArtLetters["9"] += "  /_/  \n"
AsciiArtLetters["9"] += "       \n"
AsciiArtLetters["9"] += "       \n"

AsciiArtLetters["."] += "   \n"
AsciiArtLetters["."] += "   \n"
AsciiArtLetters["."] += "   \n"
AsciiArtLetters["."] += "   \n"
AsciiArtLetters["."] += " _ \n"
AsciiArtLetters["."] += "(_)\n"
AsciiArtLetters["."] += "   \n"
AsciiArtLetters["."] += "   \n"

AsciiArtLetters[","] += "    \n"
AsciiArtLetters[","] += "    \n"
AsciiArtLetters[","] += "    \n"
AsciiArtLetters[","] += "    \n"
AsciiArtLetters[","] += "  _ \n"
AsciiArtLetters[","] += " ( )\n"
AsciiArtLetters[","] += " |/ \n"
AsciiArtLetters[","] += "    \n"

AsciiArtLetters["-"] += "       \n"
AsciiArtLetters["-"] += "       \n"
AsciiArtLetters["-"] += "       \n"
AsciiArtLetters["-"] += "  ____ \n"
AsciiArtLetters["-"] += " |____|\n"
AsciiArtLetters["-"] += "       \n"
AsciiArtLetters["-"] += "       \n"
AsciiArtLetters["-"] += "       \n"

AsciiArtLetters["+"] += "        \n"
AsciiArtLetters["+"] += "    _   \n"
AsciiArtLetters["+"] += "  _| |_ \n"
AsciiArtLetters["+"] += " |_   _|\n"
AsciiArtLetters["+"] += "   |_|  \n"
AsciiArtLetters["+"] += "        \n"
AsciiArtLetters["+"] += "        \n"
AsciiArtLetters["+"] += "        \n"

AsciiArtLetters["!"] += "  _ \n"
AsciiArtLetters["!"] += " | |\n"
AsciiArtLetters["!"] += " | |\n"
AsciiArtLetters["!"] += " | |\n"
AsciiArtLetters["!"] += " |_|\n"
AsciiArtLetters["!"] += " (_)\n"
AsciiArtLetters["!"] += "    \n"
AsciiArtLetters["!"] += "    \n"

AsciiArtLetters["?"] += "  ___  \n"
AsciiArtLetters["?"] += " |__ \\ \n"
AsciiArtLetters["?"] += "    ) |\n"
AsciiArtLetters["?"] += "   / / \n"
AsciiArtLetters["?"] += "  |_|  \n"
AsciiArtLetters["?"] += "  (_)  \n"
AsciiArtLetters["?"] += "       \n"
AsciiArtLetters["?"] += "       \n"

AsciiArtLetters[" "] += "   \n"

terminal.addCommand("letters", function(args) {
    let text = args.text.trim().toLowerCase()

    if (!text)
        throw new Error("No text given")

    for (let char of text) {
        if (!(char in AsciiArtLetters)) {
            throw new Error("Unsupported character used ('" + char + "')")
        }
    }

    function pasteHorizontal(a, b, l1, l2) {
        let lines = {a: a.split("\n").slice(0, -1), b: b.split("\n").slice(0, -1)}
        let width = {a: () => lines.a[0].length, b: () => lines.b[0].length}
        let height = {a: () => lines.a.length, b: () => lines.b.length}
        
        while (height.a() > height.b()) {
            lines.b.unshift(stringMul(" ", width.b()))
        }
        while (height.b() > height.a()) {
            lines.a.unshift(stringMul(" ", width.a()))
        }

        function eq(a, b) {
            if (a == b) return true
            if (a == " " || b == " ") return true
            if (a == "(" && b == "|") return true
            if (a == ")" && b == "|") return true
            if (b == "(" && a == "|") return true
            if (b == ")" && a == "|") return true
            return false
        }

        if (l1 != " " && l2 != " ")
        for (let i = 0; i < 2; i++) {
            let compressBoth = true
            for (let i = 0; i < height.a(); i++) {
                let [x, y] = [lines.a[i].slice(-1), lines.b[i][0]]
                if (!(eq(x, y))) {
                    compressBoth = false
                    break
                }
            }

            if (!compressBoth)
                break

            for (let i = 0; i < height.a(); i++) {
                let [x, y] = [lines.a[i].slice(-1), lines.b[i][0]]
                if (x == " ")
                    lines.a[i] = lines.a[i].slice(0, -1) + y
                lines.b[i] = lines.b[i].slice(1)
            }
        }

        let combined = ""
        for (let i = 0; i < height.a(); i++)
            combined += lines.a[i] + lines.b[i] + "\n"
        return combined
    }

    let output = AsciiArtLetters[text[0]]
    for (let i = 1; i < text.length; i++) {
        output = pasteHorizontal(output, AsciiArtLetters[text[i]], text[i - 1], text[i])
    }
    terminal.printLine(output)
}, {
    description: "prints the given text in ascii art",
    args: {
        "*text": "the text to print"
    },
    example: "letters hello world"
})


// ------------------- live-quiz.js --------------------
terminal.addCommand("live-quiz", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../quiz/",
        name: "Live Quiz Game",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "a simple quiz game that uses your camera as input for your answer",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- live-rocket.js --------------------
terminal.addCommand("live-rocket", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../sport/",
        name: "Live Rocket Avoid Game",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "a simple avoid game that you steer using camera input",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- logistic-map.js --------------------
terminal.addCommand("logistic-map", async function(args) {
    const maxIterations = 100
    const startValue = 0.5
    const minR = args.min
    const maxR = args.max

    const Vector2d = (await terminal.modules.load("game", terminal)).Vector2d

    if (minR >= maxR) {
        throw new Error("max value must be greater than min value")
    }

    if (maxR - minR < 0.5) {
        throw new Error("span of values too small to plot")
    }
    
    const fieldSize = new Vector2d(args.w, args.h)

    let field = Array.from(Array(fieldSize.y), () => Array.from(Array(fieldSize.x), () => " "))

    function drawNumberLines() {
        for (let x = 0; x < 5; x++) {
            let xPos = Math.floor((x - minR) / (maxR - minR) * fieldSize.x)
            for (let y = 0; y < fieldSize.y; y++) {
                if (xPos < 0 || xPos >= fieldSize.x) continue
                field[y][xPos] = String(x)
            }
        }
    }

    function test(r) {
        let currVal = startValue
        for (let i = 0; i < maxIterations; i++) {
            currVal = r * currVal * (1 - currVal)
        }
        let findings = new Set()
        for (let i = 0; i < maxIterations; i++) {
            currVal = r * currVal * (1 - currVal)
            let rounded = Math.round(currVal * 10000) / 10000
            findings.add(rounded)
        }
        return Array.from(findings)
    }

    let ys = []
    for (let x = 0; x < fieldSize.x; x++) {
        let xVal = (x / fieldSize.x) * (maxR - minR) + minR
        ys.push(test(xVal))
    }

    let maxY = Math.max(...ys.flat()) + 0.1
    for (let x = 0; x < fieldSize.x; x++) {
        for (let yVal of ys[x]) {
            let y = Math.floor(yVal / maxY * fieldSize.y)
            let mirroredY = fieldSize.y - y - 1
            if (mirroredY < 0 || mirroredY >= fieldSize.y) continue
            field[mirroredY][x] = "#"
        }
    }

    for (let y = 0; y < field.length; y++) {
        let rowString = ""
        for (let x = 0; x < field[y].length; x++) {
            rowString += field[y][x]
        }
        terminal.printLine(rowString)
    }

}, {
    description: "draw the logistic map",
    args: {
        "?min:n:-2~4": "minimum R value",
        "?max:n:-2~4": "maximum R value",
        "?w:n:10~200": "width of display",
        "?h:n:5~100": "height of display"
    },
    standardVals: {
        min: 0,
        max: 4,
        w: 80,
        h: 20
    },
})


// ------------------- longjump.js --------------------
terminal.addCommand("longjump", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    terminal.printLine("Loading Highscores...")

    let allHighscores = []
    try {
        allHighscores = await HighscoreApi.getHighscores("longjump")
    } catch (e) {
        terminal.log("Failed to load highscores.")
    }

    let turtloImage = new Image()
    turtloImage.src = terminal.baseUrl + "res/img/turtlo/walking-0.png"
    await new Promise((resolve) => {
        turtloImage.onload = resolve
    })

    let turtloImageLanded = new Image()
    turtloImageLanded.src = terminal.baseUrl + "res/img/turtlo/hidden.png"
    await new Promise((resolve) => {
        turtloImageLanded.onload = resolve
    })

    let terminalWindow = terminal.modules.window.make({
        name: "LongJump", fullscreen: args.fullscreen
    })

    let canvas = terminalWindow.CANVAS
    let context = terminalWindow.CONTEXT

    let viewOffset = new Vector2d(0, 0)
    let desiredOffset = new Vector2d(0, 0)
    let groundHeight = 0.8

    let touchModeActive = false

    function posToScreenPos(pos) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2

        return pos
            .add(viewOffset)
            .scale(meterScaleFactor)
            .add(new Vector2d(canvas.width / 2, canvas.height / 2))
    }

    function drawRect(position, size, color="white") {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2

        let drawPosition = posToScreenPos(position)
        context.fillStyle = color
        size = size.scale(meterScaleFactor)
        context.fillRect(drawPosition.x, drawPosition.y, size.x, size.y)
    }

    function drawLine(position1, position2, {
        color="white", width=0.01
    }={}) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition1 = posToScreenPos(position1)
        let drawPosition2 = posToScreenPos(position2)
        context.strokeStyle = color
        context.lineWidth = width * meterScaleFactor
        context.beginPath()
        context.moveTo(drawPosition1.x, drawPosition1.y)
        context.lineTo(drawPosition2.x, drawPosition2.y)
        context.stroke()
    }

    function drawText(position, text, {
        color="white", size=0.1, align="center", baseline="middle", bold=false, rotation=0
    }={}) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.save()
        context.translate(drawPosition.x, drawPosition.y)
        context.rotate(rotation)
        context.fillStyle = color
        context.font = `${bold ? "bold " : ""}${size * meterScaleFactor}px sans-serif`
        context.textAlign = align
        context.textBaseline = baseline
        context.fillText(text, 0, 0)
        context.restore()
    }

    function drawCircle(position, radius, color="white") {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.fillStyle = color
        context.beginPath()
        context.arc(drawPosition.x, drawPosition.y, radius * meterScaleFactor, 0, Math.PI * 2)
        context.fill()
    }

    function drawCloud(position, color) {
        let random = mulberry32(Math.floor(position.x * 1000 + position.y * 1000))

        drawCircle(position, 0.1, color)
        for (let i = 0; i < 10; i++) {
            let angle = random() * Math.PI * 2
            let offset = new Vector2d(
                Math.sin(angle) * 0.15,
                Math.cos(angle) * 0.05
            )
            drawCircle(position.add(offset), 0.1, color)
        }
    }

    function drawImage(position, size, image, rotation=0) {
        let meterScaleFactor = Math.min(canvas.width, canvas.height) / 2
        let drawPosition = posToScreenPos(position)
        context.save()
        context.translate(drawPosition.x, drawPosition.y)
        context.rotate(rotation)
        let sizeX = size * meterScaleFactor
        let sizeY = (size * image.height / image.width) * meterScaleFactor
        context.imageSmoothingEnabled = false
        context.drawImage(
            image,
            -sizeX / 2,
            -sizeY / 2,
            sizeX,
            sizeY
        )
        context.restore()
    }

    function updateViewOffset() {
        let diff = desiredOffset.sub(viewOffset)
        viewOffset = viewOffset.add(diff.scale(zoomSpeed))
    }

    let zoomSpeed = 0.1
    const gravityConstant = 0.0003
    const jumpEfficiency = 0.4

    class Player {

        constructor() {
            this.size = 0.2
            this.position = new Vector2d(0, 0)
            this.velocity = new Vector2d(0, 0)

            this.isSwinging = true
            this.swingAmplitude = 0.5
            this.swingLengthMs = 2000
            this.landed = false
            this._lastPosition = null

            this.spawnTime = Date.now()
        }

        get canJump() {
            if (this.isSwinging) {
                let msSinceSpawn = Date.now() - this.spawnTime
                if (msSinceSpawn > 1000) {
                    return true
                }
            }
            return false
        }

        get lastPosition() {
            if (!this._lastPosition) return this.position
            return this._lastPosition
        }

        jump() {
            this.isSwinging = false

            let swingPosX = Date.now() / this.swingLengthMs % 1
            swingPosX = Math.cos(swingPosX * Math.PI * 2) * 0.7
            let speed = Math.abs(swingPosX)

            function gaussianRandom(mean=0, stdev=1) {
                const u = 1 - Math.random()
                const v = Math.random()
                const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
                return z * stdev + mean
            }

            let randomFactor = gaussianRandom(1, 0.05)

            this.velocity = this.position.sub(this.lastPosition).normalized.scale(0.1 * speed * randomFactor)
            zoomSpeed = 0.1
        }

        _drawBody() {
            drawImage(
                this.position,
                this.size,
                this.landed ? turtloImageLanded : turtloImage,
                this.angle + Math.PI / 2 * 3
            )
        }

        get angle() {
            if (!this.lastPosition) return 0
            if (this.landed) return Math.PI / 2 * 3
            return this.position.angleTo(this.lastPosition)
        }

        _drawScore() {
            drawText(
                new Vector2d(this.position.x, -0.1),
                `Your Score: ${this.score}`,
                {bold: true, color: "yellow"}
            )
            drawText(
                new Vector2d(this.position.x, 0.03),
                touchModeActive ? `Tap to restart` : `Press Space to play again`,
                {color: "yellow"}
            )
            drawText(
                new Vector2d(this.position.x, 0.14),
                touchModeActive ? `Swipe to upload score` : `Press Enter to upload your score`,
                {color: "yellow"}
            )
        }

        update() {
            this._lastPosition = this.position

            if (this.isSwinging) {
                let swingPosX = Date.now() / this.swingLengthMs % 1
                swingPosX = Math.sin(swingPosX * Math.PI * 2) * 0.7

                const posFromX = (x) => {
                    return new Vector2d(
                        Math.sin(x * Math.PI) * this.swingAmplitude,
                        Math.cos(x * Math.PI) * this.swingAmplitude
                    )
                }

                this.position = posFromX(swingPosX)
                particles.push(new FlyParticle(this.position))
            } else if (!this.landed) {
                this.velocity.iadd(new Vector2d(0, gravityConstant))
                this.position = this.position.add(this.velocity)

                if (this.position.y > groundHeight) {
                    this.velocity = new Vector2d(this.velocity.x, -this.velocity.y).scale(jumpEfficiency)
                    this.position = new Vector2d(this.position.x, groundHeight)
                    spawnExplosion(this.position.add(new Vector2d(0, -0.01)), this.velocity.length * 20)
                }

                if (this.velocity.length < 0.001 && Math.abs(this.position.y - groundHeight) < 0.01) {
                    this.landed = true
                    zoomSpeed = 0.03
                }

                particles.push(new FlyParticle(this.position))
            }
        }

        draw() {
            if (this.isSwinging) {
                drawLine(this.position, new Vector2d(0, 0))
                this._drawBody()
            } else if (!this.landed) {
                desiredOffset = this.position.scale(-1)
                this._drawBody()
            } else {
                desiredOffset = this.position.scale(-1).add(new Vector2d(0, 0.6))
                this._drawBody()
                this._drawScore()
            }
        }

        get score() {
            return Math.ceil(this.position.x * 10)
        }

    }

    class Particle {

        constructor(position) {
            this.color = [
                "#90ed68",
                "#7ae34d",
                "#4e9131"
            ][Math.floor(Math.random() * 3)]
            this.position = position
            let sizeFactor = Math.random() * 0.02 + 0.01
            this.size = new Vector2d(sizeFactor, sizeFactor)
            this.velocity = new Vector2d(Math.random() - 0.5, Math.random() - 0.5).scale(0.005)
            this.readyToDie = false
        }

        get volume() {
            return this.size.x * this.size.y
        }

        update() {
            this.velocity.iadd(new Vector2d(0, gravityConstant * this.volume * 1000).scale(3))
            this.position.iadd(this.velocity)
            if (this.position.y > groundHeight) {
                this.readyToDie = true
            }
        }

        draw() {
            if (this.readyToDie) return
            drawRect(this.position.add(this.size.scale(-0.5)), this.size, this.color)
        }

    }

    class FlyParticle extends Particle {

        constructor(position) {
            super(position)
            this.velocity = new Vector2d(0, 0)
            this.color = "#90ed68"
            this.originalSize = 0.03
            this.originalDieCounter = 25
            this.size = new Vector2d(this.originalSize, this.originalSize)
            this.dieCounter = this.originalDieCounter
        }

        update() {
            this.dieCounter--
            if (this.dieCounter < 0) {
                this.readyToDie = true
            }

            let sizeDecrease = -1 / this.originalDieCounter * this.originalSize
            this.size.iadd(new Vector2d(sizeDecrease, sizeDecrease))
        }

    }

    function spawnExplosion(position, strength=1) {
        for (let i = 0; i < strength * 100; i++) {
            let particle = new Particle(position.copy())
            particle.velocity = Vector2d.fromAngle(Math.PI / -2 - 0.5 + Math.random()).scale(0.007)
            particles.push(particle)
        }
    }

    let running = true
    let player = new Player()
    let particles = []
    let randomSeed = Math.floor(Math.random() * 1000000)
    let selectedUpload = false

    const groundStartX = -20
    const groundWidth = 60

    function drawParticles() {
        for (let particle of particles) {
            particle.draw()
        }
        particles = particles.filter(p => !p.readyToDie)
    }

    function updateParticles() {
        for (let particle of particles) {
            particle.update()
        }
    }

    function drawGround() {
        drawRect(
            new Vector2d(groundStartX, groundHeight),
            new Vector2d(groundWidth, 10),
        )

        let randomGrassHeight = mulberry32(randomSeed + 100)
        for (let x = groundStartX; x < groundStartX + groundWidth;) {
            let grassHeight = randomGrassHeight() * 0.07 + 0.03
            drawLine(
                new Vector2d(x, groundHeight - grassHeight),
                new Vector2d(x, groundHeight),
                {color: "#7ae34d"}
            )

            if (randomGrassHeight() < 0.05) {
                // draw flower
                drawRect(
                    new Vector2d(x - 0.015, groundHeight - grassHeight - 0.015),
                    new Vector2d(0.03, 0.03),
                    [
                        "#ff0000",
                        "#ff00ff",
                        "#ffff00",
                        "#00ffff",
                        "#0000ff",
                        "#ff7f00"
                    ][Math.floor(randomGrassHeight() * 6)]
                )
            }

            x += randomGrassHeight() * 0.03 + 0.01
        }

        for (let x = groundStartX; x < groundStartX + groundWidth; x += 1) {
            drawText(
                new Vector2d(x, groundHeight + 0.1),
                `${x * 10}m`,
                {
                    color: "black"
                }
            )
        }

        let prevScore = -1
        for (let highscore of allHighscores) {
            if (highscore.score === prevScore) continue

            let x = highscore.score / 10
            drawText(
                new Vector2d(x, groundHeight + 0.15),
                `- ${highscore.name} (${highscore.score}m)`,
                {
                    color: "black",
                    rotation: Math.PI / 2,
                    size: 0.05,
                    align: "left"
                }
            )
            prevScore = highscore.score
        }
    }

    function drawSky() {
        let random = mulberry32(randomSeed)
        for (let x = groundStartX; x < groundStartX + groundWidth;) {
            x += random() * 2 + 1
            let cloudPosY = random() * -3
            drawCloud(new Vector2d(x, cloudPosY), "rgba(255, 255, 255, 0.5)")
        }
    }

    function drawSwing() {
        drawLine(new Vector2d(0, 0), new Vector2d(0.4, groundHeight + 0.1), {
            width: 0.02
        })

        drawLine(new Vector2d(0, 0), new Vector2d(-0.4, groundHeight + 0.1), {
            width: 0.02
        })

        drawCircle(new Vector2d(0, 0), 0.03)

        drawText(new Vector2d(0, -0.7), "Press Space to jump", { color: "yellow", bold: true })
    }

    addEventListener("keydown", function(event) {
        if (!running) return

        if (event.key == " " && player.canJump) {
            player.isSwinging = false
            player.jump()
        }

        if (event.key == " " && player.landed) {
            player = new Player()
            zoomSpeed = 0.05
            desiredOffset = new Vector2d(0, 0)
        }

        if (event.key == "Enter" && player.landed) {
            selectedUpload = true
            running = false
        }
    })

    let touchStartPos = null

    addEventListener("touchstart", function(event) {
        if (!running) return

        let touch = event.touches[0] || event.changedTouches[0]
        touchStartPos = new Vector2d(
            touch.pageX,
            touch.pageY
        )

        touchModeActive = true

        if (player.canJump) {
            player.isSwinging = false
            player.jump()
        }
    })

    addEventListener("touchend", function(event) {
        if (touchStartPos == null || !player.landed) return

        let touch = event.touches[0] || event.changedTouches[0]
        let touchEndPos = new Vector2d(
            touch.pageX,
            touch.pageY
        )

        let delta = touchStartPos.sub(touchEndPos).length
        if (delta < 50) {
            if (player.landed) {
                player = new Player()
                zoomSpeed = 0.05
                desiredOffset = new Vector2d(0, 0)
            }
        } else {
            selectedUpload = true
            running = false
        }
    })

    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height)

        drawSky()
        updateParticles()
        drawParticles()
        drawGround()
        drawSwing()
        player.update()
        player.draw()

        updateViewOffset()

        if (running) {
            requestAnimationFrame(gameLoop)
        }
    }

    gameLoop()

    terminal.onInterrupt(() => {
        running = false
        terminalWindow.close()
    })

    while (running) {
        await sleep(100)
    }

    terminalWindow.close()

    if (selectedUpload) {
        await HighscoreApi.registerProcess("longjump", {ask: false})
        await HighscoreApi.uploadScore(player.score)
    }
}, {
    description: "Play a game of longjump",
    isGame: true,
    args: {
        "?f=fullscreen:b": "Play in fullscreen"
    }
})
// ------------------- lorem.js --------------------
const loremText = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius.Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in"
const loremWords = loremText.split(" ")

terminal.addCommand("lorem", async function(args) {
    let wordCount = args.l
    if (wordCount < 1) {
        throw new Error("word count must be greater than 0")
    }

    let output = ""
    let copyOutput = ""
    let line = ""
    for (let i = 0; i < wordCount; i++) {
        line += loremWords[i % loremWords.length]
        if (i < wordCount - 1) {
            line += " "
        }

        if (line.length > 80) {
            output += line + "\n"
            copyOutput += line
            line = ""
        }
    }

    if (line.length > 0) {
        output += line
        copyOutput += line
    }

    terminal.printLine(output)

    if (args.c) {
        terminal.addLineBreak()
        await terminal.copy(output, {printMessage: true})
    }
}, {
    description: "generate lorem ipsum text",
    args: {
        "?l=length:i": "number of words to generate",
        "?c=copy:b": "copy to clipboard"
    },
    defaultValues: {
        l: 100
    }
})
// ------------------- ls.js --------------------
terminal.addCommand("ls", function(args) {
    let targetFolder = terminal.getFile(!!args.folder ? args.folder : "", FileType.FOLDER)

    let recursive = args.r

    const CHARS = {
        LINE: "│",
        T: "├",
        L: "└",
        DASH: "─",
    }

    function listFolder(folder, indentation="") {
        let i = 0
        let printedL = false
        for (let [fileName, file] of Object.entries(folder.content)) {
            i++
            if (indentation.length > 0) {
                terminal.print(indentation)
            }
            if (i == Object.keys(folder.content).length) {
                terminal.print(CHARS.L)
                printedL = true
            } else {
                terminal.print(CHARS.T)
            }
            terminal.print(CHARS.DASH.repeat(2) + " ")
            if (file.type == FileType.FOLDER) {
                terminal.printCommand(`${fileName}/`, `cd ${file.path}/`)
                if (recursive) {
                    let indentAddition = `${CHARS.LINE}   `
                    if (printedL) {
                        indentAddition = "    "
                    }
                    listFolder(file, indentation + indentAddition)
                }
            } else {
                terminal.printLine(fileName)
            }
        }
    }

    listFolder(targetFolder)

    if (Object.entries(targetFolder.content).length == 0)
        terminal.printLine(`this directory is empty`)

}, {
    helpVisible: true,
    description: "list all files of current directory",
    args: {
        "?folder:f": "folder to list",
        "?r:b": "list recursively",
    },
    standardVals: {
        folder: ""
    }
})


// ------------------- lscmds.js --------------------
terminal.addCommand("lscmds", async function(args) {
    let functions = [...terminal.visibleFunctions]
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.name.length - b.name.length)
    if (args.m) {
        functions.sort((a, b) => a.name.localeCompare(b.name))
        let maxFuncLength = terminal.visibleFunctions.reduce((p, c) => Math.max(p, c.name.length), 0)
        const allDescriptions = functions.map(f => f.description ? f.description : "undefined")
        let maxDescLength = allDescriptions.reduce((p, c) => Math.max(p, c.length), 0)
        let text = ""
        for (let i = 0; i < functions.length; i++) {
            let func = functions[i]
            let description = allDescriptions[i]
            let funcPart = stringPadBack("\`" + func.name + "\`", maxFuncLength + 2)
            let descpart = stringPadBack(description, maxDescLength)
            text += `| ${funcPart} | ${descpart} |\n` 
        }
        terminal.printLine(text)
        await terminal.copy(text)
        terminal.printLine("Copied to Clipboard ✓")
        return
    }

    function createTableData(columns) {
        let columnHeight = Math.ceil(functions.length / columns)
        let tableData = Array.from({length: columnHeight}, () => Array.from({length: columns}, () => ""))
        let columnIndex = 0
        let functionIndex = 0
        while (true) {
            let func = functions[functionIndex]
            if (!func) break
            tableData[functionIndex % columnHeight][columnIndex] = func.name
            if (functionIndex % columnHeight == columnHeight - 1) columnIndex++
            functionIndex++
        }
        return tableData
    }

    function printTable(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => c === undefined ? 0 : c.length)))
        }

        for (let row of tableData) {
            for (let i = 0; i < row.length; i++) {
                let cell = row[i]
                let width = columnWidths[i]
                terminal.printCommand(stringPadBack(cell, width + 2), cell, undefined, false)
            }
            terminal.addLineBreak()
        }
    }

    function calculateTableWidth(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => c === undefined ? 0 : c.length)))
        }

        return columnWidths.reduce((p, c) => p + c + 2, 0)
    }

    for (let tableWidth = 20; tableWidth >= 1; tableWidth--) {
        let tableData = createTableData(tableWidth)

        let width = calculateTableWidth(tableData)

        if (width <= 90 || tableWidth == 1) {
            printTable(tableData)
            break
        }
    }

    terminal.addLineBreak()
    terminal.printLine(`- in total, ${terminal.functions.length} commands have been implemented`)
    terminal.print("- use ")
    terminal.printCommand("man", "man", undefined, false)
    terminal.printLine(" <cmd> to get more information about a command")
    terminal.print("- use ")
    terminal.printCommand("whatis *", "whatis *", undefined, false)
    terminal.printLine(" to see all commands including their description")

}, {
    description: "list all available commands",
    helpVisible: true,
    args: {
        "?m:b": "format output as markdown table"
    }
})


// ------------------- lscpu.js --------------------
terminal.addCommand("lscpu", function() {
    const runs = 150000000
    const start = performance.now()
    for (let i = runs; i > 0; i--) {}
    const end = performance.now()
    const ms = end - start
    const cyclesPerRun = 2
    const speed = (runs / ms / 1000000) * cyclesPerRun
    const ghz = Math.round(speed * 10) / 10

    let vendor = "unknown"
    let renderer = "unknown"

    try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (gl) {
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
            vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
            renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        } else {
            throw new Error()
        }
    } catch {
        terminal.printError("Couldn't access gpu info")
    }

    terminal.printTable([
        ["logical cpu cores", navigator.hardwareConcurrency],
        ["platform (guess)", navigator.platform],
        ["cpu clockspeed (guess)", `${ghz} ghz`],
        ["gpu vendor", vendor],
        ["gpu renderer", renderer]
    ])
}, {
    description: "get some helpful info about your cpu"         
})


// ------------------- lunar-lander.js --------------------
terminal.window.secretShip = null
terminal.addCommand("lunar-lander", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({name: "Lunar Lander", fullscreen: args.f})
    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT
    const clearWindow = () => context.clearRect(0, 0, canvas.width, canvas.height)

    const KEY = {
        UP_ARROW: "ArrowUp",
        LEFT_ARROW: "ArrowLeft",
        RIGHT_ARROW: "ArrowRight",
        UP: "up",
        DOWN: "down",
    }

    let levelFuels = [1000, 800, 600, 400, 200, 100]

    function getLevelFuel(level) {
        return levelFuels[Math.min(level, levelFuels.length - 1)]
    }

    const startTime = Date.now()

    const gravityConstant = 0.00001
    const gravity = new Vector2d(0, gravityConstant)

    class KeyListener {

        constructor() {
            this.keys = {}
            this.onCtrlCCallback = null
            this.onTouchStartCallback = null
            this.onTouchMoveCallback = null
            this.onTouchEndCallback = null

            function pos(event) {
                let rect = canvas.getBoundingClientRect()
                return new Vector2d(event.clientX - rect.left, event.clientY - rect.top)
            }

            function addListener(evt, callback) {
                addEventListener(evt, event => {
                    if (!game.running) return
                    return callback(event)
                })
            }

            this.keyup = addListener("keyup", event => {
                this.keys[event.key] = false
            })

            this.keydown = addListener("keydown", event => {
                if (Object.values(KEY).includes(event.key))
                    event.preventDefault()

                this.keys[event.key] = true

                if (event.key == "c" && event.ctrlKey) {
                    if (this.onCtrlCCallback != null)
                        this.onCtrlCCallback(event)
                }
            })

            this.touchDown = addListener("touchstart", event => {
                if (this.onTouchStartCallback != null) {
                    this.onTouchStartCallback(event, pos(event.touches[0]))
                }
            })

            this.touchMove = addListener("touchmove", event => {
                if (this.onTouchMoveCallback != null) {
                    this.onTouchMoveCallback(event, pos(event.touches[0]))
                }
            })

            this.touchUp = addListener("touchend", event => {
                if (this.onTouchEndCallback != null) {
                    this.onTouchEndCallback(event)
                    event.preventDefault()
                }
            })

            this.onContextMenu = addListener("contextmenu", event => {
                event.preventDefault()
            })

            this.upRules = {}
            this.downRules = {}
        }

        onCtrlC(callback) {
            this.onCtrlCCallback = callback
        }

        onTouchStart(callback) {
            this.onTouchStartCallback = callback
        }

        onTouchMove(callback) {
            this.onTouchMoveCallback = callback
        }

        onTouchEnd(callback) {
            this.onTouchEndCallback = callback
        }

        remove() {
            removeEventListener("keyup", this.keyup)
            removeEventListener("keydown", this.keydown)
            removeEventListener("touchstart", this.touchDown)
            removeEventListener("touchmove", this.touchMove)
            removeEventListener("touchend", this.touchUp)
            removeEventListener("contextmenu", this.onContextMenu)
        }

        isDown(key) {
            return this.keys[key] === true
        }

        isUp(key) {
            return !this.keys[key]
        }

        addRule(key, callback, type=undefined) {
            type ??= KEY.DOWN
            if (type == KEY.DOWN) {
                this.downRules[key] = callback
            } else if (type == KEY.UP) {
                this.upRules[key] = callback
            }
        }

        runRules() {
            for (let key in this.downRules) {
                if (this.isDown(key)) {
                    this.downRules[key]()
                }
            }
            for (let key in this.upRules) {
                if (this.isUp(key)) {
                    this.upRules[key]()
                }
            }
        }

        clearRules() {
            this.downRules = {}
            this.upRules = {}
        }

    }

    class Particle {

        constructor(x, y, ms=1000, color=null, vel) {
            this.pos = new Vector2d(x, y)
            this.velocity = vel ?? new Vector2d(0, 0)
            this.size = 2
            this.prevPos = this.pos.copy()

            this.ms = ms
            this.startTime = Date.now()
            this.c = color ?? {r: 255, g: 255, b: 255}
        }

        get alive() {
            return Date.now() - this.startTime < this.ms
        }

        get color() {
            let alpha = 1 - (Date.now() - this.startTime) / this.ms
            return `rgba(${this.c.r}, ${this.c.g}, ${this.c.b}, ${alpha})`
        }

        get realPos() {
            return this.pos.mul(new Vector2d(canvas.width, canvas.height))
        }

        update(deltaTime, landscape) {
            this.velocity.iadd(gravity.scale(deltaTime))
            this.pos.iadd(this.velocity.scale(deltaTime)
                .div(new Vector2d(canvas.width / canvas.height, 1)))

            if (landscape.checkCollision(this.realPos)) {
                let newAngle = this.velocity.angle + Math.PI
                let surfaceNormal = landscape.getSurfaceNormal(this.pos)
                let angleDiff = surfaceNormal.angle - newAngle
                this.velocity = Vector2d.fromAngle(newAngle)
                    .scale(this.velocity.length)
                    .rotate(-angleDiff * 2)
            } else {
                this.prevPos = this.pos.copy()
            }

        }

        draw(zoomPos) {
            context.fillStyle = this.color
            let pos = zoomPos(this.pos)
            let zoom = 1 / zoomPos("getZoomFactor")
            let size = this.size * zoom
            context.fillRect(pos.x - size / 2, pos.y - size / 2, size, size)
        }

    }

    class Player {

        constructor() {
            this.pos = new Vector2d(0.5, 0.1)
            let startXVelocity = Math.random() * 0.003 - 0.0015
            this.velocity = new Vector2d(startXVelocity, 0)
            this.startSize = 15
            this.size = this.startSize
            this.fuel = getLevelFuel(0)
            
            this.rotationSpeed = 0.1
            this.rotation = 0

            this.score = 0
            this.currLevel = 0
            this.crashed = false
            this.particles = []

            this.thrustIncrease = 0.03
            this.thrust = 0
            this.thrustAcceleration = gravityConstant * 2

            this.hasLanded = false
        }

        reset() {
            this.hasLanded = false
            this.crashed = false
            this.pos = new Vector2d(0.5, 0.1)
            this.velocity = new Vector2d(0, 0)
            this.rotation = 0
        }

        get canLand() {
            let landingMaxSpeed = 4
            let landingMaxAngle = Math.PI / 8

            while (this.rotation < 0) this.rotation += Math.PI * 2
            while (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2
            let angle = (this.rotation > Math.PI) ? (this.rotation - Math.PI * 2) : (this.rotation)
            return this.speedY <= landingMaxSpeed && Math.abs(angle) < landingMaxAngle
        }

        get midPoint() {
            return this.pos.mul(new Vector2d(canvas.width, canvas.height))
        }

        calcScreenPos(zoomPos) {
            return zoomPos(this.pos)
        }

        get speedX() {
            return Math.round(Math.abs(this.velocity.x) * 10000)
        }

        get speedY() {
            return Math.round(Math.abs(this.velocity.y) * 10000)
        }

        get speed() {
            return Math.sqrt(this.speedX ** 2 + this.speedY ** 2)
        }

        get points() {
            let points = [
                new Vector2d(0, -this.size),
                new Vector2d(this.size, this.size),
                new Vector2d(0, this.size / 2),
                new Vector2d(-this.size, this.size)
            ]
            for (let point of points) {
                point.irotate(this.rotation)
                point.iadd(this.midPoint)
            }
            return points
        }

        crash() {
            if (this.crashed)
                return
            this.crashed = true
            this.crashTime = Date.now()
            for (let i = 0; i < args.particles * 100; i++) {
                let particle = new Particle(this.pos.x, this.pos.y, 3000)
                particle.velocity = Vector2d.random().scale((this.speed + 0.1) * 0.0005 * Math.random())
                this.particles.push(particle)
            }
        }

        spawnThrustParticles() {
            const spawnParticle = () => {
                let angleDiff = (Math.random() - 0.5) * 2 * (Math.PI / 20)
                let particleDirection = Vector2d.fromAngle(
                    this.rotation + Math.PI / 2 + angleDiff)
                const normalSpeed = 0.003
                let particleSpeed = (1 + Math.random()) * normalSpeed + this.velocity.length
                let particle = new Particle(
                    this.pos.x,
                    this.pos.y,
                    Math.random() * 4000, {r: 192, g: 105, b: 64},
                    particleDirection.scale(particleSpeed)
                )
                particle.size = 5
                this.particles.push(particle)
            }

            for (let i = 0; i < args.particles; i++)
                if (Math.random() < this.thrust)
                    spawnParticle()
        }

        update(deltaTime, landscape) {
            if (!this.crashed) {
                if (this.thrust > 0) {
                    let direction = Vector2d.fromAngle(this.rotation - Math.PI / 2)
                    if (this.fuel > 0)
                        this.velocity.iadd(direction
                            .scale(this.thrustAcceleration)
                            .scale(this.thrust))
                    else
                        this.thrust = 0
                    this.fuel = Math.max(this.fuel - this.thrust * deltaTime, 0)

                    this.spawnThrustParticles()
                }
    
                this.velocity.iadd(gravity.scale(deltaTime))
                this.pos.iadd(this.velocity.scale(deltaTime)
                    .div(new Vector2d(canvas.width / canvas.height, 1)))
            }

            for (let point of this.points) {
                if (landscape.checkPlatform(point) && this.canLand) {
                    this.velocity.x = 0
                    this.velocity.y = -0.003
                    this.hasLanded = true
                    this.score += 10
                    this.currLevel++
                    this.fuel += getLevelFuel(this.currLevel)
                    break
                }
                if (landscape.checkCollision(point)) {
                    this.crash()
                    break
                }
            }

            if (this.pos.x < 0) {
                this.pos.x = 0
                this.velocity.x *= -1
            } else if (this.pos.x > 1) {
                this.pos.x = 1
                this.velocity.x *= -1
            } else if (this.pos.y < 0) {
                this.pos.y = 0
                this.velocity.y *= -1
            }

            for (let particle of this.particles) {
                particle.update(deltaTime, landscape)
            }
            this.particles = this.particles.filter(particle => particle.alive)
        }

        draw(zoomPos) {
            function drawPoints(points, color, method) {
                context.fillStyle = color
                context.strokeStyle = color
                context.beginPath()
                context.moveTo(points[0].x, points[0].y)
                for (let i = 0; i < points.length; i++) {
                    let pos = zoomPos(new Vector2d(
                        points[i].x,
                        points[i].y
                    ), true)
                    if (i == 0) context.moveTo(pos.x, pos.y)
                    else context.lineTo(pos.x, pos.y)
                }
                context.closePath()
                context[method]()
            }

            for (let particle of this.particles) {
                particle.draw(zoomPos)
            }

            if (this.crashed)
                return
            drawPoints(this.points, "white", "fill")
        }

        get screenPos() {
            return this.pos.mul(new Vector2d(canvas.width, canvas.height))
        }

    }

    class Platform {

        constructor(xStart, width) {
            this.xStart = xStart
            this.width = width
            this.height = 50
        }

        get xEnd() {
            return this.xStart + this.width
        }

        get pos() {
            return game.landscape.platformPos
        }

        draw(zoomPos) {
            let xStart = zoomPos(new Vector2d(this.xStart, 0)).x
            let xEnd = zoomPos(new Vector2d(this.xEnd, 0)).x
            let y = zoomPos(this.pos.sub({x: 0, y: this.height}), true).y
            context.fillStyle = "white"

            let barWidth = (xEnd - xStart) * 0.1

            context.fillRect(xStart, y, xEnd - xStart, barWidth)

            // supports
            context.fillRect(xStart + 10, y+2, barWidth/2, 10000)
            context.fillRect(xEnd - 10 - barWidth/2, y+2, barWidth/2, 10000)
        }

    }

    class Landscape {

        generateData() {
            let funcs = []
            const random = () => Math.random()
            for (let i = 0; i < 50; i++) {
                let a = random() * 0.04
                let b = random() * 2
                let c = random() * 2 * Math.PI
                funcs.push((x) => a * Math.sin(b * x + c))
            }

            let data = []
            for (let x = 0; x < canvas.width; x++) {
                let y = 0
                let adjustedX = x / canvas.width * Math.PI * 4
                for (let func of funcs) {
                    let tempY = func(adjustedX)
                    y += tempY
                }
                data.push(y + 0.25)
            }
            return data
        }

        async generatePlatform() {
            let blendData = (xStart, xEnd, height, direction) => {
                for (let x = xStart; x < xEnd; x++) {
                    let xBlend = (x - xStart) / (xEnd - xStart)
                    let yBlend = (Math.sin(xBlend * Math.PI + Math.PI / 2) + 1) / 2
                    let heightDiff = height - this.data[x]
                    this.data[x] += heightDiff * (direction == -1 ? yBlend : 1 - yBlend)
                }
            }

            let xStart = Math.random() * 0.7 + 0.15
            let width = 100 / canvas.width
            let platform = new Platform(xStart, width)
            let platformHeight = Math.max(...this.data.slice(
                Math.floor(platform.xStart * this.data.length),
                Math.floor(platform.xEnd * this.data.length))) + 0.03
            let coordStart = Math.round(xStart * this.data.length)
            let coordEnd = Math.round(platform.xEnd * this.data.length)
            for (let x = coordStart; x < coordEnd; x++) {
                this.data[x] = platformHeight
            }

            let blendDistance = 100
            blendData(coordStart - blendDistance, coordStart, platformHeight, 1)
            blendData(coordEnd, coordEnd + blendDistance, platformHeight, -1)

            this.platform = platform
        }

        async generateValidData() {
            return new Promise(async resolve => {
                let data = this.generateData()
                let generationTries = 0
                while (this.maxAltitude(data) > 0.5 || this.minAltitude(data) < 0) {
                    generationTries++
                    data = this.generateData()
                    if (generationTries % 1 == 0)
                        await sleep(0)
                }
                resolve(data)
            })
        }

        generateSurfaceNormals() {
            let normals = []
            for (let i = 1; i < this.data.length; i++) {
                let diff = this.data[i] - this.data[i - 1]
                let angle = Math.atan(diff * canvas.height)
                normals.push(angle - Math.PI / 2)
            }
            return normals
        }

        async generate() {
            this.data = await this.generateValidData()
            await this.generatePlatform()
            this.surfaceNormals = this.generateSurfaceNormals()
            this.generating = false
        }

        get platformPos() {
            let x = this.platform.xStart * canvas.width + this.platform.width * canvas.width / 2
            let y = (1 - this.data[Math.floor(this.platform.xStart * this.data.length)]) * canvas.height
            return new Vector2d(x, y)
        }

        maxAltitude(data) {
            return Math.max(...(data ?? this.data))
        }

        minAltitude(data) {
            return Math.min(...(data ?? this.data))
        }

        constructor() {
            this.generating = true
            this.platform = null
            this.generate()
        }

        checkCollision(point) {
            let x = point.x / canvas.width * this.data.length
            let y = point.y / canvas.height
            let terrainHeight = 1 - this.data[Math.floor(x)]

            let relevantHeight = terrainHeight

            x /= this.data.length

            if (x > this.platform.xStart && x < this.platform.xEnd) {
                relevantHeight = (this.platform.pos.y - this.platform.height) / canvas.height
            }

            return y > relevantHeight
        }

        getSurfaceNormal(point) {
            let x = point.x * this.data.length
            let angle = this.surfaceNormals[Math.floor(x)]
            return Vector2d.fromAngle(angle)
        }

        checkPlatform(point) {
            let x = point.x / canvas.width
            let y = point.y / canvas.height
            let platform = this.platform
            return (
                x > platform.xStart &&
                x < platform.xEnd &&
                y > (platform.pos.y - platform.height) / canvas.height
            )
        }

        get platformHeight() {
            return this.data[Math.floor(this.platform.xStart * this.data.length)]
        }

        draw(zoomPos) {
            context.fillStyle = "white"
            context.beginPath()
            context.moveTo(0, canvas.height)
            for (let i = 0; i < this.data.length; i++) {
                let pos = zoomPos(new Vector2d(
                    i / this.data.length,
                    1 - this.data[i]
                ))
                context.lineTo(pos.x, pos.y)
            }
            context.lineTo(canvas.width, canvas.height)
            context.closePath()
            context.fill()
            if (this.platform)
                this.platform.draw(zoomPos)
        }

    }

    class Game {

        FPS = 30
        running = true

        get deltaMs() {
            return 1000 / this.FPS
        }

        registerKeyEvents() {
            this.keyListener.addRule(KEY.UP_ARROW, () => {
                this.player.thrust = Math.min(this.player.thrust + this.player.thrustIncrease, 1)
            }, KEY.DOWN)

            this.keyListener.addRule(KEY.LEFT_ARROW, () => {
                this.player.rotation -= this.player.rotationSpeed
            }, KEY.DOWN)

            this.keyListener.addRule(KEY.RIGHT_ARROW, () => {
                this.player.rotation += this.player.rotationSpeed
            }, KEY.DOWN)

            this.keyListener.addRule(KEY.UP_ARROW, () => {
                this.player.thrust = 0
            }, KEY.UP)

            this.keyListener.onTouchStart((event, pos) => {
                this.currTouchPos = pos
                this.touchEnabled = true
            })

            this.keyListener.onTouchMove((event, pos) => {
                this.currTouchPos = pos
                this.touchEnabled = true
            })

            this.keyListener.onTouchEnd(() => {
                this.currTouchPos = null
                this.touchEnabled = true
            })
        }

        runTouchHandling() {
            if (this.player.crashed) return

            if (this.currTouchPos == null) {
                this.player.thrust = 0
                return
            }

            this.player.thrust = Math.min(this.player.thrust + this.player.thrustIncrease, 1)

            let playerPos = this.player.calcScreenPos(this.makeZoomPos())
            let angle = playerPos.angleTo(this.currTouchPos)
            this.player.rotation = angle - Math.PI / 2
        }

        drawStats() {
            context.fillStyle = "white"
            context.font = "20px Arial bold"
            context.textAlign = "left"
            let heightPointer = 30
            function drawText(msg) {
                context.fillText(msg, 10, heightPointer)
                heightPointer += 20
            }
            drawText(`use arrow keys or touch`)
            drawText(`score: ${this.player.score}`)
            drawText(`speed: ${Math.round(this.player.speed * 10) / 10}`)
            drawText(`fuel: ${Math.round(this.player.fuel)}`)
        }
        
        constructor() {
            this.currTouchPos = null
            this.touchEnabled = false
            this.keyListener = new KeyListener()

            this.keyListener.onCtrlC(() => {
                this.running = false
                this.keyListener.remove()
                terminalWindow.close()
            })

            this.player = new Player()
            terminal.window.secretShip = this.player
            this.landscape = new Landscape()
            this.registerKeyEvents()

            this.zoom = 1

            this.endAnimationLength = 3000
            this.newLandscape = null
        }
        
        makeZoomPos() {
            let zoomFactor = 1 / this.zoom
            let xWidth = zoomFactor
            let yWidth = zoomFactor

            let platformXPos = this.landscape.platform.xStart + this.landscape.platform.width / 2
            let xStart = Math.min(Math.max(0, platformXPos - xWidth / 2), 1 - xWidth)
            let yStart = Math.min(Math.max(0,  this.landscape.platformHeight - yWidth / 2 + 0.1), 1 - yWidth)

            yStart = 1 - yWidth - yStart

            function zoomPos(pos, canvasPos=false) {
                if (pos == "getZoomFactor")
                    return zoomFactor
                if (canvasPos) {
                    pos = new Vector2d(
                        pos.x / canvas.width,
                        pos.y / canvas.height
                    )
                }
                return new Vector2d(
                    (pos.x - xStart) / xWidth * canvas.width,
                    (pos.y - yStart) / yWidth * canvas.height
                )
            }

            return zoomPos
        }

        async update(timeDelta) {
            this.player.update(timeDelta / this.deltaMs, this.landscape)

            let playerPlatformDistance = this.player.screenPos.distance(this.landscape.platformPos)
            let tempZoom = 1 / (playerPlatformDistance / canvas.width * 4)
            let targetZoom = Math.min(Math.max(tempZoom, 1), 2)
            let zoomDiff = targetZoom - this.zoom
            this.zoom += zoomDiff * 0.02

            if (this.player.hasLanded) {
                if (this.newLandscape == null) {
                    this.newLandscape = new Landscape()
                } else if (this.newLandscape.generating == false) {
                    this.player.reset()
                    for (let i = 0; i < this.landscape.data.length; i++) {
                        this.landscape.data[i] = this.newLandscape.data[i]
                        this.zoom += (1 - this.zoom) * 0.01
                        if (i % 5 == 0)
                            await sleep(0)
                    }
                    this.landscape = this.newLandscape
                    this.newLandscape = null
                }
            }
        }

        redraw() {
            clearWindow()

            let zoomPos = this.makeZoomPos()

            this.drawStats()
            this.player.draw(zoomPos)
            this.landscape.draw(zoomPos)
        }

        drawMessage(msg) {
            context.fillStyle = "white"
            context.font = "50px Arial bold"
            context.textAlign = "center"
            context.fillText(msg, canvas.width / 2, canvas.height / 2)
        }

        async run() {
            let prevTime = Date.now()

            while (this.landscape.generating) {
                this.drawMessage("Generating landscape...")
                await sleep(100)
            }

            while (this.running) {
                if (this.touchEnabled) {
                    this.runTouchHandling()
                } else {
                    this.keyListener.runRules()
                }

                let timeDelta = Date.now() - prevTime
                prevTime = Date.now()
                this.update(timeDelta)
                this.redraw()

                if (this.player.crashed) {
                    this.drawMessage("Game Over")

                    if (Date.now() - this.player.crashTime > this.endAnimationLength) {
                        this.running = false
                    }
                }

                await sleep(this.deltaMs)
            }

            this.keyListener.remove()
        }

    }
    let game = new Game()
    await game.run()
    
    while (args.f) { // fullscreen mode
		game = new Game()
		await game.run()
	}

    terminalWindow.close()

    terminal.printLine(`Your score: ${game.player.score}`)
    
    await HighscoreApi.registerProcess("lunar-lander")
    await HighscoreApi.uploadScore(game.player.score)
    
}, {
    description: "play a classic game of moon-lander",
    args: {
        "?particles:n:1~1000": "number of particles to generate",
        "?f=fullscreen:b": "enable fullscreen application"
    },
    standardVals: {
        particles: 10,
    },
    isGame: true,
})

// ------------------- man.js --------------------
terminal.addCommand("man", async function(args) {
    if (!terminal.commandExists(args.command))
        throw new Error(`No manual entry for ${args.command}`)
    let command = await terminal.loadCommand(args.command)
    if (args.command == "man") {
        terminal.printEasterEgg("manmanEgg")
        terminal.addLineBreak()
    }

    let infoTableData = [
        ["name", command.name],
        ["author", command.author],
        ["description", command.description],
        ["is a game", command.info.isGame ? "yes" : "no"],
        ["is secret", command.info.isSecret ? "yes" : "no"]
    ]

    const hasArgs = (command.args.length === undefined)
        ? !!Object.keys(command.args).length
        : !!command.args.length

    if (!hasArgs) {
        infoTableData.push(["arguments", "doesn't accept any arguments"])
    }

    terminal.printTable(infoTableData)

    if (hasArgs) {
        let argTableData = []
        const {argOptions} = TerminalParser.parseArguments([], command)
        for (let arg of argOptions) {
            argTableData.push([
                arg.forms.join(", "), arg.optional ? "yes" : "no",
                arg.description, arg.type,
                arg.default || "/"
            ])
        }

        terminal.addLineBreak()
        terminal.printTable(argTableData, ["Argument", "Optional", "Description", "Type", "Default"])
    }
}, {
    description: "show the manual page for a command",
    args: {"command:c": "the command to show the manual page for"},
    helpVisible: true
})


// ------------------- mandelbrot.js --------------------
terminal.addCommand("mandelbrot", async function(args) {
    let gridSize = {x: 0, y: 0}
    gridSize.x = ~~(terminal.approxWidthInChars)
    gridSize.y = ~~(gridSize.x * 1 / 3)
    if (args.x) gridSize.x = ~~args.x
    if (args.y) gridSize.y = ~~args.y
    if (gridSize.y % 2 == 1) gridSize.y++

    let plotSize = {xmin: -1.85, xmax: 0.47, ymin: -0.95, ymax: 0.95}
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))

    let maxIteration = 1000

    function getPixelCoords(px, py) {
        let xDiff = plotSize.xmax - plotSize.xmin
        let x = plotSize.xmin + (px / gridSize.x) * xDiff
        let yDiff = plotSize.ymax - plotSize.ymin
        let y = plotSize.ymin + (py / gridSize.y) * yDiff
        return [x, y]
    }

    function calcPixel(px, py) {
        let [x0, y0] = getPixelCoords(px, py)
        let [x, y] = [0.0, 0.0]
        let i = 0
        for (; i < maxIteration; i++) {
            let temp = x**2 - y**2 + x0
            y = 2*x*y + y0
            x = temp
            if ((x**2 + y**2) >= 4)
                break
        }
        if (i == maxIteration)
            return "#"
        return "."
    }

    async function drawGrid() {
        let output = ""
        for (let y = 0; y < gridSize.y; y++) {
            for (let x = 0; x < gridSize.x; x++) {
                output += grid[y][x]
            }
            output += "\n"
        }
        terminal.printLine(output)
    }

    for (let y = 0; y < gridSize.y; y++) {
        for (let x = 0; x < gridSize.x; x++) {
            grid[y][x] = calcPixel(x, y)
        }
    }
    drawGrid()
}, {
    description: "draws the mandelbrot set",
    args: {
        "?x:i:10~1000": "width of the plot",
        "?y:i:10~1000": "height of the plot"
    }
})


// ------------------- matdet.js --------------------
terminal.addCommand("matdet", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
        terminal.addLineBreak()
    }

    terminal.printLine(matrix.determinant().simplify().toSimplifiedString())

}, {
    description: "find the determinant of a matrix",
    args: {
        "?A:sm": "matrix to invert",
    }
})
// ------------------- matinv.js --------------------
terminal.addCommand("matinv", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
        terminal.addLineBreak()
    }

    terminal.printLine(matrix.inverse().simplify())
}, {
    description: "find the inverse of a matrix",
    args: {
        "?A:sm": "matrix to invert",
    }
})
// ------------------- matmin.js --------------------
terminal.addCommand("matmin", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
        terminal.addLineBreak()
    }

    terminal.printLine(matrix.minors().simplify())
}, {
    description: "find the matrix of minors of a given matrix",
    args: {
        "?A:sm": "matrix to invert",
    }
})
// ------------------- matmul.js --------------------
terminal.addCommand("matmul", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrixA = null
    let matrixB = null

    if (args.A) {
        matrixA = Matrix.fromArray(args.A)
    } else {
        matrixA = await inputMatrix(await inputMatrixDimensions({matrixName: "A"}))
        terminal.addLineBreak()
    }

    if (args.B) {
        matrixB = Matrix.fromArray(args.B)
    } else {
        matrixB = await inputMatrix(await inputMatrixDimensions({
            matrixName: "B", forcedRows: matrixA.dimensions.columns
        }))
        terminal.addLineBreak()
    }

    if (matrixA.nCols != matrixB.nRows) {
        throw new Error("Matrix dimensions are not compatible.")
    }

    const matrixC = matrixA.multiply(matrixB)

    terminal.printLine(`Resulting Matrix [${matrixC.dimensions}]:`)
    terminal.printLine(matrixC.toString())

}, {
    description: "multiply two matrices with each other",
    args: {
        "?A:m": "matrix A",
        "?B:m": "matrix B",
    }
})
// ------------------- matred.js --------------------
terminal.addCommand("matred", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
        terminal.printLine(matrix)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
        terminal.addLineBreak()
    }

    if (!matrix.containsOnlyNumbers()) {
        throw new Error("Matrix to reduce may not include variables")
    }

    let stepNum = 1

    const swapRows = (r1, r2) => {
        terminal.addLineBreak()
        matrix.swapRows(r1, r2)
        terminal.print(`#${stepNum}: `)
        terminal.printLine(`r${r1 + 1} <-> r${r2 + 1}`, Color.COLOR_1)
        terminal.printLine(matrix)
        stepNum++
    }

    const scaleRow = (row, scalar) => {
        terminal.addLineBreak()
        matrix.scaleRow(row, scalar)
        terminal.print(`#${stepNum}: `)
        terminal.printLine(`r${row + 1} * ${scalar.toSimplifiedString()}`, Color.COLOR_1)
        terminal.printLine(matrix)
        stepNum++
    }

    const addScalarRow = (r1, r2, scalar) => {
        terminal.addLineBreak()
        matrix.addScalarRow(r1, r2, scalar)

        let operation = "+"
        if (scalar.value < 0) {
            scalar = scalar.mul(-1)
            operation = "-"    
        }

        let scalarText = scalar.toSimplifiedString()
        if (scalarText == "1") {
            scalarText = ""
        } else {
            scalarText += "("
        }

        terminal.print(`#${stepNum}: `)
        terminal.printLine(`r${r2 + 1} ${operation} ${scalarText}r${r1 + 1}${scalarText.endsWith("(") ? ")" : ""}`, Color.COLOR_1)
        terminal.printLine(matrix)

        stepNum++
    }

    if (matrix.isZeroMatrix()) {
        throw new Error("Cannot row reduce matrix with no nonzero entry.")
    }

    function isReducedColumn(columnIndex, pivotRow) {
        const values = matrix.getColumn(columnIndex).map(c => c.value)

        let zeroEntries = 0
        let foundOne = false
        for (let i = 0; i < values.length; i++) {
            const value = values[i]
            if (value == 1) {
                if (i > pivotRow) {
                    return false
                }

                if (foundOne) {
                    return false
                } else {
                    foundOne = true
                }
            } else if (value == 0) {
                zeroEntries++
            } else {
                return false
            }
        }

        return zeroEntries == values.length - 1
    }

    function isZeroColumnFromRow(columnIndex, rowIndex) {
        for (let i = rowIndex; i < matrix.nRows; i++) {
            if (matrix.get(i, columnIndex) != 0) {
                return false
            }
        }
        return true
    }

    reduction_loop:
    for (let it = 0; it < 1000; it++) {
        let currColumn = 0
        let pivotRow = 0

        while (matrix.isZeroColumn(currColumn) || isReducedColumn(currColumn, pivotRow) || isZeroColumnFromRow(currColumn, pivotRow)) {
            if (isReducedColumn(currColumn, pivotRow)) {
                pivotRow++
            }

            currColumn++

            if (pivotRow >= matrix.nRows || currColumn >= matrix.nCols) {
                break reduction_loop
            }
        }

        // get first non-zero-row
        let beforePivot = pivotRow
        while (matrix.get(pivotRow, currColumn) == 0) {
            pivotRow++

            if (pivotRow >= matrix.nRows) {
                break reduction_loop
            }
        }

        if (pivotRow != beforePivot) {
            swapRows(beforePivot, pivotRow)
            continue
        }

        if (matrix.get(pivotRow, currColumn) != 1) {
            scaleRow(pivotRow, new MatrixCell(1).div(matrix.getCell(pivotRow, currColumn)))
            continue
        }

        for (let otherRow = 0; otherRow < matrix.nRows; otherRow++) {
            if (otherRow == pivotRow) continue

            if (matrix.get(otherRow, currColumn) != 0) {
                addScalarRow(pivotRow, otherRow, matrix.getCell(otherRow, currColumn).mul(-1))
                continue reduction_loop
            }
        }

        break
    }

    if (stepNum == 1) {
        terminal.printError("Matrix is already in reduced row echelon form.")
    }
}, {
    description: "reduce a given matrix to reduced row echelon form",
    args: {
        "?A:sm": "matrix to invert",
    }
})
// ------------------- mill2player.js --------------------
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
// ------------------- minesweeper.js --------------------
const defaultSettings = {
    width: 10,
    height: 10,
    bombs: 20
}

terminal.addCommand("minesweeper", async function(args) {
    await terminal.modules.import("game", window)

    let highscoreMode = true
    for (let settingKey of Object.keys(defaultSettings)) {
        if (args[settingKey] != defaultSettings[settingKey]) {
            highscoreMode = false
        }
    }

    if (!highscoreMode) {
        terminal.print("Info:", Color.COLOR_1)
        terminal.printLine(" You changed the default board. So you cannot")
        terminal.printLine("      upload your score. To upload a score, please")
        terminal.printLine("      use the default board (no arguments provided)")
        terminal.addLineBreak()
    }

    const neighborDirections = [
        [-1, -1], [0, -1], [1, -1], [-1, 0],
        [1, 0], [-1, 1], [0, 1], [1, 1]
    ].map(([x, y]) => new Vector2d(x, y))

    const CellState = {
        EMPTY: 0,
        BOMB: 9
    }

    class Board {

        constructor(width, height, bombPercentage) {
            this.selectionPos = new Vector2d(0, 0)
            this.width = width
            this.height = height
            this.bombs = Math.ceil(bombPercentage / 100 * this.area)
            
            this.uncoveredMap = Array.from({length: this.height}, () => {
                return Array.from({length: this.width}, () => false)
            })

            this.flagPositions = []

            this.generateBoard()

            this.uncoveredCount = 0
            this.lost = false
            this.won = false
        }

        _getValue(pos) {
            return this.data[pos.y][pos.x]
        }

        _setValue(pos, value) {
            this.data[pos.y][pos.x] = value
        }

        _isUncovered(pos) {
            return this.uncoveredMap[pos.y][pos.x]
        }

        prepareFirstUncover(pos) {
            let maxTries = 100

            for (let i = 0; i < maxTries; i++) {
                if (this._getValue(pos) == CellState.EMPTY) {
                    return
                }
                this.generateBoard()
            }

            for (let i = 0; i < maxTries; i++) {
                if (this._getValue(pos) != CellState.BOMB) {
                    return
                }
                this.generateBoard()
            }
        }

        lose() {
            this.lost = true

            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    const pos = new Vector2d(x, y)
                    if (this._getValue(pos) == CellState.BOMB) {
                        this.uncoveredMap[y][x] = true
                    }
                }
            }            
        }

        win() {
            this.won = true
        }

        checkWin() {
            let bombsFlagged = 0
            for (let position of this.flagPositions) {
                if (this._getValue(position) == CellState.BOMB) {
                    bombsFlagged++
                }
            }
            return bombsFlagged == this.bombs
        }

        placeFlag(pos) {
            if (this._isUncovered(pos)) {
                return
            }

            if (this._isFlagged(pos)) {
                this.flagPositions = this.flagPositions.filter(p => !p.equals(pos))
                return
            }

            if (this.flagPositions.length >= this.bombs) {
                return
            }

            this.flagPositions.push(pos)

            if (this.checkWin()) {
                this.win()
            }
        }

        uncoverRecursive(pos) {
            if (!this.isInBounds(pos) || this._isUncovered(pos)) {
                return
            }
            
            if (this.uncoveredCount == 0) {
                this.prepareFirstUncover(pos)
            }

            if (this._getValue(pos) == CellState.BOMB) {
                this.lose()
            }

            this.uncoveredMap[pos.y][pos.x] = true
            this.uncoveredCount++

            if (this._getValue(pos) == CellState.EMPTY) {
                for (let direction of neighborDirections) {
                    let newPos = pos.add(direction)
                    this.uncoverRecursive(newPos)
                }
            }

            if (this.uncoveredCount == this.area) {
                this.win()
            }
        }

        resetBoard() {
            this.data = Array.from({length: this.height}, () => {
                return Array.from({length: this.width}, () => CellState.EMPTY)
            })
        }

        isInBounds(pos) {
            if (pos.x < 0 || pos.y < 0) return false
            if (pos.x >= this.width) return false
            if (pos.y >= this.height) return false
            return true
        }

        generateBoard() {
            this.resetBoard()

            const generateBomb = () => {
                let randomPos = new Vector2d(
                    Math.floor(Math.random() * this.width),
                    Math.floor(Math.random() * this.height)
                )

                let value = this._getValue(randomPos)
                if (value == CellState.EMPTY) {
                    this._setValue(randomPos, CellState.BOMB)
                } else {
                    generateBomb()
                }
            }

            for (let i = 0; i < this.bombs; i++) {
                generateBomb()
            }

            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let pos = new Vector2d(x, y)
                    if (this._getValue(pos) == CellState.BOMB)
                        continue

                    let bombsFound = 0
                    for (let direction of neighborDirections) {
                        let addedPos = pos.add(direction)
                        if (!this.isInBounds(addedPos)) {
                            continue
                        } else if (this._getValue(addedPos) == CellState.BOMB) {
                            bombsFound++
                        }
                    }

                    this._setValue(pos, bombsFound)
                }
            }
        }

        _getStateString(pos) {
            if (this._isFlagged(pos)) {
                return "F"
            } else if (this._isUncovered(pos)) {
                let value = this._getValue(pos)
                if (value == CellState.EMPTY) {
                    return " "
                } else if (value == CellState.BOMB) {
                    return "X"
                } else {
                    return value.toString()
                }
            } else {
                return "_"
            }
        }

        get area() {
            return this.width * this.height
        }

        _isFlagged(pos) {
            return this.flagPositions.some(p => p.equals(pos))
        }

        toString() {
            let output = ""

            let lineBetweenString = "|---" + "+---".repeat(this.width - 1) + "|\n"

            output += ".---" + "v---".repeat(this.width - 1) + ".\n"
            for (let y = 0; y < this.height; y++) {
                output += "|"
                for (let x = 0; x < this.width; x++) {
                    let stateString = this._getStateString(new Vector2d(x, y))

                    if (x == this.selectionPos.x && y == this.selectionPos.y) {
                        output += `>${stateString}<:`
                    } else {
                        output += ` ${stateString} :`
                    }
                }
                output = output.slice(0, -1) + "|\n"

                if (y != this.height - 1) {
                    output += lineBetweenString
                }
            }
            output += "`---" + "^---".repeat(this.width - 1) + "`\n"

            return output
        }

    }

    let startTime = Date.now()

    const board = new Board(args.width, args.height, args.bombs)

    let outputElement = terminal.print("", undefined, {forceElement: true})

    terminal.printLine("\nMove the cursor using the Arrow Keys, press Enter to")
    terminal.printLine(`Uncover, press F to place a flag. There are ${board.bombs} bombs.`)
    terminal.print("You have placed ")
    let flagOutput = terminal.print(0, undefined, {forceElement: true})
    terminal.printLine(`/${board.bombs} flags.`)
    
    const updateOutput = () => {
        outputElement.textContent = board.toString()
        flagOutput.textContent = board.flagPositions.length
    }

    updateOutput()
    terminal.scroll()

    let playing = true

    terminal.onInterrupt(() => {
        playing = false
    })

    const onkeydown = (eventkey, event) => {
        let timeElapsed = Date.now() - startTime
        if (!playing || timeElapsed < 100) return

        if (eventkey == "ArrowUp") {
            board.selectionPos.y = Math.max(board.selectionPos.y - 1, 0)
            event.preventDefault()
        } else if (eventkey == "ArrowDown") {
            board.selectionPos.y = Math.min(board.selectionPos.y + 1, board.height - 1)
            event.preventDefault()
        } else if (eventkey == "ArrowLeft") {
            board.selectionPos.x = Math.max(board.selectionPos.x - 1, 0)
            event.preventDefault()
        } else if (eventkey == "ArrowRight") {
            board.selectionPos.x = Math.min(board.selectionPos.x + 1, board.width - 1)
            event.preventDefault()
        }

        if (eventkey == "Enter") {
            board.uncoverRecursive(board.selectionPos)
            event.preventDefault()
        }

        if (eventkey.toUpperCase() == "F") {
            board.placeFlag(board.selectionPos.copy())
            event.preventDefault()
        }

        updateOutput()
    }

    addEventListener("keydown", event => onkeydown(event.key, event))

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout([
            [null, "↑", null],
            ["←", "↓", "→"],
            ["F", "Enter"],
            ["STRG+C"]
        ])

        terminal.mobileKeyboard.onkeydown = function(e, keycode) {
            onkeydown(keycode, e)
        }
    }

    while (playing) {
        await sleep(100)
        if (board.lost || board.won) {
            break
        }
    }

    playing = false
    let timeElapsed = Date.now() - startTime

    terminal.addLineBreak()

    if (board.won) {
        let seconds = Math.ceil(timeElapsed / 1000)
        terminal.print("You won!", undefined, {background: Color.LIGHT_GREEN})
        terminal.printLine(` It took you ${seconds} seconds.`)

        if (highscoreMode) {
            await HighscoreApi.registerProcess("minesweeper")
            await HighscoreApi.uploadScore(-seconds)
        }
    }

    if (board.lost) {
        let uncoveredPercent = Math.round(board.uncoveredCount / board.area * 100)
        terminal.print("You lost!", undefined, {background: Color.ERROR})
        terminal.printLine(` You uncovered ${uncoveredPercent}% of the board.`)
    }

}, {
    description: "play a game of minesweeper",
    args: {
        "?x=width:i:5~100": "width of the board",
        "?y=height:i:5~100": "height of the board",
        "?b=bombs:i:10~90": "percentage of bombs",
    },
    defaultValues: {
        width: 10,
        height: 10,
        bombs: 20
    },
    isGame: true
})
// ------------------- minigolf.js --------------------
const courseData = [
    {
        name: "#1: The Basic",
        shapePoints: [
            { x: 20, y: 0 },
            { x: 80, y: 0 },
            { x: 80, y: 100 },
            { x: 20, y: 100 },
        ],
        ballStartPos: { x: 50, y: 90 },
        holePos: { x: 50, y: 20 },
    },

    {
        name: "#2: Arrow",
        shapePoints: [
            { x: 50, y: 0 },
            { x: 100, y: 0 },
            { x: 50, y: 50 },
            { x: 100, y: 100 },
            { x: 50, y: 100 },
            { x: 0, y: 50 },
        ],
        ballStartPos: { x: 75, y: 90 },
        holePos: { x: 75, y: 10 },
    },
    
    {
        name: "#3: Corner",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 100 },
            { x: 0, y: 100 },
        ],
        ballStartPos: { x: 25, y: 85 },
        holePos: { x: 85, y: 25 },
    },

    {
        name: "#4: Hourglass",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 20 },
            { x: 54, y: 50 },
            { x: 100, y: 80 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
            { x: 0, y: 80 },
            { x: 46, y: 50 },
            { x: 0, y: 20 },
        ],
        ballStartPos: { x: 50, y: 85 },
        holePos: { x: 50, y: 15 },
    },

    {
        name: "#5: Spiral",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 88, y: 0 },
            { x: 100, y: 10 },
            { x: 100, y: 90 },
            { x: 90, y: 100 },
            { x: 10, y: 100 },
            { x: 0, y: 90 },
            { x: 0, y: 35 },
            { x: 15, y: 25 },
            { x: 65, y: 25 },
            { x: 75, y: 35 },
            { x: 75, y: 75 },
            { x: 25, y: 75 },
            { x: 25, y: 55 },
            { x: 60, y: 55 },
            { x: 60, y: 50 },
            { x: 20, y: 50 },
            { x: 20, y: 80 },
            { x: 80, y: 80 },
            { x: 80, y: 20 },
            { x: 0, y: 20 },
        ],
        ballStartPos: { x: 10, y: 10 },
        holePos: { x: 35, y: 65 },
    },

    {
        name: "#6: Gravity",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ],
        ballStartPos: { x: 50, y: 90 },
        holePos: { x: 90, y: 10 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 20, y: 20 },
                size: { x: 80, y: 50 },
                angle: Math.PI
            },

            {
                type: "gravity",
                pos: { x: 0, y: 20 },
                size: { x: 18, y: 50 },
                angle: Math.PI / 2
            }
        ]
    },

    {
        name: "#7",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 15, y: 0 },
            { x: 15, y: 85 },
            { x: 25, y: 85 },
            { x: 25, y: 15 },
            { x: 40, y: 0 },
            { x: 45, y: 0 },
            { x: 60, y: 15 },
            { x: 60, y: 85 },
            { x: 65, y: 85 },
            { x: 65, y: 15 },
            { x: 80, y: 0 },
            { x: 85, y: 0 },
            { x: 100, y: 15 },
            { x: 100, y: 100 },
            { x: 85, y: 100 },
            { x: 85, y: 15 },
            { x: 80, y: 15 },
            { x: 80, y: 85 },
            { x: 65, y: 100 },
            { x: 60, y: 100 },
            { x: 45, y: 85 },
            { x: 45, y: 15 },
            { x: 40, y: 15 },
            { x: 40, y: 85 },
            { x: 25, y: 100 },
            { x: 15, y: 100 },
            { x: 0, y: 85 },
        ],
        ballStartPos: { x: 7.5, y: 7.5 },
        holePos: { x: 92.5, y: 92.5 }
    },

    {
        name: "#8",
        shapePoints: [
            { x: 0, y: 0 },
            { x: 25, y: 0 },
            { x: 25, y: 75 },
            { x: 35, y: 75 },
            { x: 35, y: 25 },
            { x: 75, y: 25 },
            { x: 75, y: 0 },
            { x: 85, y: 0 },
            { x: 85, y: 25 },
            { x: 100, y: 25 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ],
        ballStartPos: { x: 12.5, y: 12.5 },
        holePos: { x: 80, y: 5 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 0, y: 23 },
                size: { x: 25, y: 50 },
                angle: -Math.PI / 2,
                force: 0.7
            },
            {
                type: "gravity",
                pos: { x: 35, y: 25 },
                size: { x: 65, y: 15 },
                angle: Math.PI / 2
            },
            {
                type: "gravity",
                pos: { x: 0, y: 75 },
                size: { x: 73, y: 25 },
                angle: 0
            },
            {
                type: "gravity",
                pos: { x: 75, y: 75 },
                size: { x: 25, y: 25 },
                angle: -Math.PI / 2
            }
        ]
    },

    {
        name: "#9: S",
        shapePoints: [
            { x: 30, y: 0 },
            { x: 90, y: 0 },
            { x: 90, y: 20 },
            { x: 55, y: 20 },
            { x: 60, y: 25 },
            { x: 90, y: 25 },
            { x: 90, y: 95 },
            { x: 30, y: 95 },
            { x: 10, y: 80 },
            { x: 10, y: 0 },
            { x: 25, y: 0 },
            { x: 25, y: 65 },
            { x: 65, y: 65 },
            { x: 60, y: 60 },
            { x: 30, y: 60 },
        ],
        ballStartPos: { x: 17.5, y: 7.5 },
        holePos: { x: 80, y: 10 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 30, y: 0 },
                size: { x: 25, y: 60 },
                force: 0.1,
                angle: 0,
            },
            {
                type: "gravity",
                pos: { x: 65, y: 25 },
                size: { x: 25, y: 70 },
                force: 0.1,
                angle: 3.141592653589793,
            },
        ],
    },

    {
        name: "#10",
        shapePoints: [
            { x: 15, y: 0 },
            { x: 65, y: 0 },
            { x: 65, y: 20 },
            { x: 85, y: 20 },
            { x: 85, y: 30 },
            { x: 65, y: 30 },
            { x: 65, y: 100 },
            { x: 15, y: 100 },
        ],
        ballStartPos: { x: 50, y: 85 },
        holePos: { x: 80, y: 25 },
        boxes: [
            {
                type: "gravity",
                pos: { x: 15, y: 0 },
                size: { x: 50, y: 20 },
                force: 0.8,
                angle: 1.5707963267948966,
            },
            {
                type: "gravity",
                pos: { x: 15, y: 72 },
                size: { x: 20, y: 28 },
                force: 0.1,
                angle: 0,
            },
            {
                type: "gravity",
                pos: { x: 15, y: 30 },
                size: { x: 50, y: 40 },
                force: 0.3,
                angle: 1.5707963267948966,
            },
        ],
    },
]

terminal.addCommand("minigolf", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Minigolf Game", fullscreen: args.fullscreen
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const worldSize = new Vector2d(100, 100)
    let viewCentre = new Vector2d(canvas.width, canvas.height).scale(0.5)
    let zoomFactor = 1
    const DAMPENING_FACTOR = 0.98

    const pointToCanvas = p => p.sub(worldSize.scale(0.5)).scale(zoomFactor).add(viewCentre)
    const canvasToPoint = p => p.sub(viewCentre).scale(1 / zoomFactor).add(worldSize.scale(0.5))

    const GRAPHICS = {
        zoomSpeed: 0.1,
        backgroundColor: "#eee",
        trackColor: "lightgreen",
        wallColor: "black",
        wallWidth: 0.5,
        ballColor: "white",
        ballBorderWidth: 0.5,
        cursorLength: 3,
        cursorColor: "rgba(0, 0, 0, 0.5)",
        cursorLineWidth: 2,
        ballBorderColor: "black",
        holeColor: "#000",
        uiColor: "black",
        uiFont: "Arial",
        gridLineColor: "rgba(0, 0, 0, 0.5)",
        outerPadding: () => Math.max(Math.min(canvas.width, canvas.height) * 0.05, 20)
    }

    const cursorTurnSpeed = 0.025
    const touchMinDistance = 10
    const minShootStrength = 0.5
    const maxShootStrength = 10
    let totalShots = 0
    const editGridSizeStep = 5

    const drawBackground = () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = GRAPHICS.backgroundColor
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    class Wall {

        constructor(p1, p2) {
            this.p1 = p1
            this.p2 = p2
        }

        reflect(direction) {
            let angleDifference = direction.angle - this.normalDirection.angle
            return direction.rotate(-angleDifference * 2).scale(-1)
        }


        get points() {
            return [this.p1, this.p2]
        }

        get direction() {
            return this.p2.sub(this.p1)
        }

        get normalDirection() {
            let d = this.direction
            return new Vector2d(-d.y, d.x)
        }

        distanceToPoint(point) {
            let p2toP1 = this.p2.sub(this.p1)
            let p2toPoint = point.sub(this.p1)
            let d = p2toP1.dot(p2toPoint) / (p2toP1.length ** 2)

            if (d < 0) {
                return this.p1.distance(point)
            } else if (d > 1) {
                return this.p2.distance(point)
            } else {
                let closestPoint = this.p1.add(p2toP1.scale(d))
                return closestPoint.distance(point)
            }
        }

        touchesBall(ball) {
            return this.distanceToPoint(ball.pos) < ball.radius
        }

    }

    class MinigolfHole {

        constructor(course) {
            this.course = course
            this.pos = new Vector2d(0, 0)
            this.radius = 3
        }

        touchesBall(ball) {
            return this.pos.distance(ball.pos) < this.radius
        }

        draw() {
            context.fillStyle = GRAPHICS.holeColor
            context.beginPath()
            context.arc(...pointToCanvas(this.pos).array, this.radius * zoomFactor, 0, 2 * Math.PI)
            context.fill()
        }

    }

    class MinigolfBall {

        constructor(course) {
            this.pos = new Vector2d(0, 0)
            this.vel = new Vector2d(0, 0)
            this.radius = 2.5
            this.course = course
            
            this.canShoot = true
            this.cursorAngle = 0
            this.shootStrength = 3
            this.inHole = false
            this.holeZoomFactor = 1
        }

        get fullyInHole() {
            return this.inHole && this.holeZoomFactor == 0
        }

        drawCursor() {
            let cursorDirection = Vector2d.fromAngle(this.cursorAngle)
                .scale(zoomFactor * GRAPHICS.cursorLength)
                .scale(1 + this.shootStrength * 0.5)
                .scale(1 + Math.sin(performance.now() / 100) * 0.05)
            let cursorStart = pointToCanvas(this.pos)
            let cursorEnd = cursorStart.add(cursorDirection)
            
            context.strokeStyle = GRAPHICS.cursorColor
            context.lineWidth = GRAPHICS.cursorLineWidth * zoomFactor
            context.lineCap = "round"

            context.beginPath()
            context.moveTo(...cursorStart.array)
            context.lineTo(...cursorEnd.array)
            context.stroke()

            context.lineCap = "butt"
        }

        shoot() {
            if (!this.canShoot) return

            this.vel = Vector2d.fromAngle(this.cursorAngle).scale(this.shootStrength)
            this.canShoot = false
            totalShots++
        }

        draw() {
            if (this.canShoot) {
                this.drawCursor()
            }

            let ballZoomFactor = this.holeZoomFactor * zoomFactor

            context.fillStyle = GRAPHICS.ballColor
            context.strokeStyle = GRAPHICS.ballBorderColor
            context.lineWidth = GRAPHICS.ballBorderWidth * ballZoomFactor
            context.beginPath()
            context.arc(...pointToCanvas(this.pos).array, this.radius * ballZoomFactor, 0, 2 * Math.PI)
            context.fill()
            context.stroke()
        }

        update() {
            let gravityBox = this.inGravityBox()

            if (this.inHole) {
                let delta = this.course.hole.pos.sub(this.pos)
                this.pos.iadd(delta.scale(0.1))

                this.holeZoomFactor -= 0.01
                if (this.holeZoomFactor < 0.01) {
                    this.holeZoomFactor = 0
                }
                return
            } else if (this.vel.length < 0.1 && !gravityBox) {
                if (!this.canShoot) {
                    this.canShoot = true
                    this.cursorAngle = this.vel.angle
                }
                return
            }

            if (gravityBox) {
                this.vel.iadd(gravityBox.gravityForce)
            }

            let subSteps = Math.ceil(this.vel.length * 2)
            this.vel.iscale(1 / subSteps)
            for (let i = 0; i < subSteps; i++) {
                this.subupdate()
            }
            this.vel.iscale(subSteps)

            this.vel.iscale(DAMPENING_FACTOR)
        }

        inGravityBox() {
            for (let box of this.course.boxes) {
                if (box.ballInside(this)) {
                    if (box.type == "gravity") {
                        return box
                    }
                }
            }   
        }

        subupdate() {
            this.pos.iadd(this.vel)

            for (let wall of this.course.walls) {
                if (wall.touchesBall(this)) {
                    this.pos.isub(this.vel)
                    this.vel = wall.reflect(this.vel)
                    this.pos.iadd(this.vel)
                }
            }

            if (this.course.hole && this.course.hole.touchesBall(this)) {
                this.inHole = true
                this.canShoot = false
            }
        }

    }

    class MinigolfBox {

        constructor(course, type="normal") {
            this.course = course
            this.type = type
            this.pos = new Vector2d(0, 0)
            this.size = new Vector2d(0, 0)
        }

        static fromData(course, data) {
            if (data.type == "gravity")
                return MinigolfGravityBox.fromData(course, data)
            let box = new MinigolfBox(course)
            box.pos = new Vector2d(data.pos.x, data.pos.y)
            box.size = new Vector2d(data.size.x, data.size.y)
            return box
        }

        ballInside(ball) {
            let topLeft = this.pos
            let bottomRight = this.pos.add(this.size)
            let ballPos = ball.pos
            return (
                ballPos.x > topLeft.x - ball.radius &&
                ballPos.x < bottomRight.x + ball.radius &&
                ballPos.y > topLeft.y - ball.radius &&
                ballPos.y < bottomRight.y + ball.radius
            )
        }

        draw() {
            context.fillStyle = GRAPHICS.backgroundColor
            context.strokeStyle = GRAPHICS.wallColor
            context.lineWidth = GRAPHICS.wallWidth * zoomFactor

            let topLeft = pointToCanvas(this.pos)
            let bottomRight = pointToCanvas(this.pos.add(this.size))

            context.beginPath()
            context.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
            context.fill()
            context.stroke()
        }

    }

    class MinigolfGravityBox extends MinigolfBox {

        constructor(course) {
            super(course, "gravity")
            this.forceStrength = 0.1
            this.angle = 0
        }

        get gravityForce() {
            return Vector2d.fromAngle(this.angle).scale(this.forceStrength)
        }

        static fromData(course, data) {
            let box = new MinigolfGravityBox(course)
            box.pos = new Vector2d(data.pos.x, data.pos.y)
            box.size = new Vector2d(data.size.x, data.size.y)
            box.gravity = data.gravity
            if (data.angle) box.angle = data.angle
            if (data.force) box.forceStrength = data.force
            return box
        }

        draw() {
            const drawArrow = (pos, angle, length) => {
                angle += Math.PI
                context.save()
                context.translate(...pointToCanvas(pos).array)
                context.rotate(angle)
                context.beginPath()
                context.moveTo(length * zoomFactor, -length * zoomFactor)
                context.lineTo(-length * zoomFactor, 0)
                context.lineTo(length * zoomFactor, length * zoomFactor)
                context.fill()
                context.restore()
            }

            context.fillStyle = "rgba(0, 0, 0, 0.3)"
            context.lineWidth = GRAPHICS.wallWidth * zoomFactor

            let topLeft = pointToCanvas(this.pos)
            let bottomRight = pointToCanvas(this.pos.add(this.size))

            context.beginPath()
            context.rect(
                topLeft.x,
                topLeft.y,
                bottomRight.x - topLeft.x,
                bottomRight.y - topLeft.y
            )
            context.fill()

            let center = this.pos.add(this.size.scale(0.5))
            let arrowLength = 0.3 * Math.min(this.size.x, this.size.y)
            let arrowAngle = this.gravityForce.angle
            context.fillStyle = GRAPHICS.trackColor
            drawArrow(center, arrowAngle, arrowLength)
        }

    }

    class MinigolfCourse {

        getBoundingBox() {
            const bounding = {
                y: {
                    min: Infinity,
                    max: -Infinity
                },
                x: {
                    min: Infinity,
                    max: -Infinity
                }
            }

            for (let point of this.shapePoints) {
                if (point.x < bounding.x.min) bounding.x.min = point.x
                if (point.y < bounding.y.min) bounding.y.min = point.y
                if (point.x > bounding.x.max) bounding.x.max = point.x
                if (point.y > bounding.y.max) bounding.y.max = point.y
            }

            return {
                min: pointToCanvas(new Vector2d(bounding.x.min, bounding.y.min)),
                max: pointToCanvas(new Vector2d(bounding.x.max, bounding.y.max)),
            }
        }

        constructor() {
            this.name = "Unnamed Course"
            this.walls = []
            this.shapePoints = []
            this.ballStartPos = new Vector2d(0, 0)
            this.holePos = new Vector2d(0, 0)
            this.ball = undefined
            this.hole = undefined
            this.boxes = []
        }

        get completed() {
            return this.ball && this.ball.fullyInHole
        }

        setShape(points) {
            this.shapePoints = points
            this.walls = []

            for (let i = 0; i < points.length; i++) {
                this.walls.push(new Wall(points[i], points[(i + 1) % points.length]))
            }
        }

        addBall() {
            this.ball = new MinigolfBall(this)
            this.ball.pos = this.ballStartPos
        }

        addHole() {
            this.hole = new MinigolfHole(this)
            this.hole.pos = this.holePos
        }

        drawShape(editMode) {
            context.beginPath()
            let lastShapePoint = this.shapePoints[this.shapePoints.length - 1]
            context.moveTo(...pointToCanvas(lastShapePoint).array)
            for (let i = 0; i < this.shapePoints.length; i++) {
                context.lineTo(...pointToCanvas(this.shapePoints[i]).array)
            }
            context.closePath()

            context.fillStyle = GRAPHICS.trackColor
            context.fill()

            context.strokeStyle = GRAPHICS.wallColor
            context.lineWidth = GRAPHICS.wallWidth * zoomFactor
            context.stroke()
        }

        drawEditOverlay() {
            this.drawGrid()
            let squareSize = 20
            for (let i = 0; i < this.shapePoints.length; i++) {
                context.fillStyle = "rgba(0, 0, 0, 0.5)"
                if (i == this.selectedShapePointIndex) {
                    context.fillStyle = "rgba(255, 0, 0, 0.5)"
                }
                context.fillRect(
                    ...pointToCanvas(this.shapePoints[i]).sub(new Vector2d(squareSize / 2, squareSize / 2)).array,
                    squareSize, squareSize
                )
            }
        }

        drawUI() {
            context.fillStyle = GRAPHICS.uiColor
            context.font = GRAPHICS.uiFont
            context.textAlign = "left"
            context.textBaseline = "top"
            let textSize = 5 * zoomFactor
            context.font = textSize + "px " + GRAPHICS.uiFont
            let pos = pointToCanvas(this.shapePoints[0].add(new Vector2d(3, 3)))
            context.fillText(this.name, pos.x, pos.y)
        }

        addBox(box) {
            this.boxes.push(box)
        }

        drawGrid() {
            const drawGridLine = (p1, p2) => {
                context.strokeStyle = GRAPHICS.gridLineColor
                context.lineWidth = 1
                context.beginPath()
                context.moveTo(...pointToCanvas(p1).array)
                context.lineTo(...pointToCanvas(p2).array)
                context.stroke()
                context.closePath()
            }

            for (let x = 0; x <= worldSize.x; x += editGridSizeStep) {
                drawGridLine(
                    new Vector2d(x, 0),
                    new Vector2d(x, worldSize.y)
                )
            }

            for (let y = 0; y <= worldSize.y; y += editGridSizeStep) {
                drawGridLine(
                    new Vector2d(0, y),
                    new Vector2d(worldSize.x, y)
                )
            }
        }

        draw(editMode=false, drawBackgroundPlease=true) {
            if (drawBackgroundPlease) drawBackground()
            this.drawShape(editMode)

            for (let box of this.boxes) {
                box.draw()
            }

            if (editMode) {
                this.drawEditOverlay()
            }

            this.drawUI()

            if (this.hole !== undefined) {
                this.hole.draw()
            }

            if (this.ball !== undefined) {
                this.ball.draw()
            }
        }

        static fromData(data) {
            let course = new MinigolfCourse()
            course.name = data.name
            course.setShape(data.shapePoints.map(p => new Vector2d(p.x, p.y)))
            course.ballStartPos = new Vector2d(data.ballStartPos.x, data.ballStartPos.y)
            course.holePos = new Vector2d(data.holePos.x, data.holePos.y)
            course.addBall()
            course.addHole()

            let boxData = data.boxes || []
            for (let box of boxData) {
                course.addBox(MinigolfBox.fromData(course, box))
            }

            return course
        }

        toJSONString() {
            let data = {}
            data.name = this.name
            data.shapePoints = this.shapePoints.map(p => ({ x: p.x, y: p.y }))
            data.ballStartPos = { x: this.ballStartPos.x, y: this.ballStartPos.y }
            data.holePos = { x: this.holePos.x, y: this.holePos.y }
            data.boxes = this.boxes.map(b => {
                let boxData = {}
                boxData.type = b.type
                boxData.pos = { x: b.pos.x, y: b.pos.y }
                boxData.size = { x: b.size.x, y: b.size.y }
                boxData.angle = b.angle
                boxData.force = b.forceStrength
                return boxData
            })
            return JSON.stringify(data)
        }

    }

    const courses = courseData.map(MinigolfCourse.fromData)

    if (!courses[args.level - 1]) {
        terminalWindow.close()
        throw new Error(`Level ${args.level} doesn't exist (yet)`)
    }

    terminal.onInterrupt(() => {
        gameRunning = false
        terminalWindow.close()
    })

    function drawLines(lines, sizeFactor=1) {
        context.fillStyle = GRAPHICS.uiColor
        context.textAlign = "left"
        context.textBaseline = "top"
        let textSize = 5 * zoomFactor * sizeFactor
        context.font = textSize + "px " + "monospace"
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], 10, 10 + i * textSize)
        }
    }

    let gameRunning = true

    let course = courses[args.level - 1]

    if (args.file) {

        terminal.printLine(`Loading course from file ${args.file}...`)

        try {

            let file = await terminal.getFile(args.file)
            if (file.type != FileType.READABLE) {
                throw new Error(`File ${args.file} is not readable`)
            }

            let fileData = JSON.parse(file.content)
            course = MinigolfCourse.fromData(fileData)

        } catch (e) {
            terminalWindow.close()
            throw e
        }

    }

    if (args.edit) {

        course.name = "New Course"

        const moveAllInDirection = (direction) => {
            for (let i = 0; i < course.shapePoints.length; i++) {
                course.shapePoints[i] = course.shapePoints[i].add(direction)
            }
            course.ballStartPos = course.ballStartPos.add(direction)
            course.holePos = course.holePos.add(direction)
            for (let box of course.boxes) {
                box.pos = box.pos.add(direction)
            }
            course.addBall()
            course.addHole()
        }

        course.selectedShapePointIndex = 0

        let fileData = ""
        zoomFactor = 4
        addEventListener("keydown", e => {
            if (!gameRunning) return

            let selectedPoint = course.shapePoints[course.selectedShapePointIndex]
        
            if (e.shiftKey || e.key == "Tab") {
                if (e.key == "ArrowRight" || (e.key == "Tab" && !e.shiftKey)) {
                    course.selectedShapePointIndex++
                    e.preventDefault()
                } else if (e.key == "ArrowLeft" || (e.key == "Tab" && e.shiftKey)) {
                    course.selectedShapePointIndex--
                    e.preventDefault()
                }
            } else {
                if (e.key == "ArrowUp") {
                    selectedPoint.y -= editGridSizeStep
                } else if (e.key == "ArrowDown") {
                    selectedPoint.y += editGridSizeStep
                } else if (e.key == "ArrowLeft") {
                    selectedPoint.x -= editGridSizeStep
                } else if (e.key == "ArrowRight") {
                    selectedPoint.x += editGridSizeStep
                }
            }

            if (e.key == "+") {
                zoomFactor += 0.2
            }
            
            else if (e.key == "-") {
                zoomFactor -= 0.2
            }

            else if (e.code == "Numpad8") {
                moveAllInDirection(new Vector2d(0, -editGridSizeStep))
            }

            else if (e.code == "Numpad2") {
                moveAllInDirection(new Vector2d(0, editGridSizeStep))
            }

            else if (e.code == "Numpad4") {
                moveAllInDirection(new Vector2d(-editGridSizeStep, 0))
            }

            else if (e.code == "Numpad6") {
                moveAllInDirection(new Vector2d(editGridSizeStep, 0))
            }

            else if (e.key == "Backspace") {
                if (course.shapePoints.length == 1) return
                course.shapePoints.splice(course.selectedShapePointIndex, 1)
                course.selectedShapePointIndex--
            }

            else if (e.key == " ") {
                course.shapePoints.splice(course.selectedShapePointIndex, 0,
                    selectedPoint.copy())
            }

            else if (e.key == "s") {
                gameRunning = false
            }

            else if (e.key == "h") {
                course.holePos = selectedPoint.copy()
                course.addHole()
            }

            else if (e.key == "b") {
                course.ballStartPos = selectedPoint.copy()
                course.addBall()
            }

            if (course.selectedShapePointIndex < 0)
                course.selectedShapePointIndex = course.shapePoints.length - 1
            if (course.selectedShapePointIndex >= course.shapePoints.length)
                course.selectedShapePointIndex = 0
        })

        function loop() {
            viewCentre = new Vector2d(canvas.width, canvas.height).scale(0.5)
            course.draw(true)
            drawLines([ 
                "+       Zoom in",
                "-       Zoom out",
                "↑       Move up",
                "↓       Move down",
                "←       Move left",
                "→       Move right",
                "TAB     Move selection",
                "SPACE   Add point",
                "BACKSP  Delete point",
                "S       Save",
                "H       Set hole pos",
                "B       Set ball pos",
                "CTRL+C  Stop Editor",
                "Numpad  Move in grid"
            ]) 

            if (gameRunning)
                terminal.window.requestAnimationFrame(loop)
        }

        loop()

        while (gameRunning) await sleep(100)

        terminalWindow.close()

        while (true) {
            try {
                let name = await terminal.prompt("How should the course be called? ")
                course.name = name
                fileData = course.toJSONString()
                let fileName = name.toLowerCase().replace(/ /g, "_") + ".mniglf"
                await terminal.createFile(fileName, TextFile, fileData)
                terminal.printSuccess("Course saved as " + fileName)
                await terminal.fileSystem.reload()
                let path = terminal.currFolder.path + "/" + fileName
                terminal.printCommand("Play the course", `minigolf -f ${path}`)
                break
            } catch (e) {
                terminal.printError(e.message)
            }
        }

    } else {

        let coursesFinished = 0
        let currCourseIndex = args.level - 1
        let currCourse = course

        let keysDown = new Set()
        let touchPos = null
        let touchDownPos = null
        let validKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "])

        addEventListener("keydown", e => {
            if (!gameRunning) return
            keysDown.add(e.key)
            if (validKeys.has(e.key)) e.preventDefault()
        })
        addEventListener("keyup", e => keysDown.delete(e.key))
        addEventListener("touchstart", e => {
            let rect = canvas.getBoundingClientRect()
            touchPos = new Vector2d(
                e.touches[0].clientX - rect.left,
                e.touches[0].clientY - rect.top
            )
            touchDownPos = touchPos.copy()
        })
        addEventListener("touchmove", e => {
            let rect = canvas.getBoundingClientRect()
            touchPos = new Vector2d(
                e.touches[0].clientX - rect.left,
                e.touches[0].clientY - rect.top
            )
        })
        addEventListener("touchend", e => {
            if (touchDownPos !== null && touchPos !== null) {
                let distance = touchPos.distance(touchDownPos)
                if (distance > touchMinDistance) {
                    currCourse.ball.shoot()
                }
            }

            touchDownPos = null
            touchPos = null
        })

        function handleInputs() {
            if (!currCourse.ball.canShoot)
                return

            if (keysDown.has("ArrowLeft"))
                currCourse.ball.cursorAngle -= cursorTurnSpeed
            if (keysDown.has("ArrowRight"))
                currCourse.ball.cursorAngle += cursorTurnSpeed
            if (keysDown.has("ArrowUp"))
                currCourse.ball.shootStrength += 0.25
            if (keysDown.has("ArrowDown"))
                currCourse.ball.shootStrength -= 0.25
            if (keysDown.has(" "))
                currCourse.ball.shoot()

            if (touchPos !== null) {
                let cursorPos = pointToCanvas(currCourse.ball.pos)
                currCourse.ball.cursorAngle = cursorPos.angleTo(touchPos) + Math.PI
                let maxDistance = Math.min(
                    Math.abs(cursorPos.x - canvas.width),
                    Math.abs(cursorPos.y - canvas.height),
                    Math.abs(cursorPos.x),
                    Math.abs(cursorPos.y)
                )
                currCourse.ball.shootStrength = cursorPos.distance(touchPos) / maxDistance * maxShootStrength
            }
            

            currCourse.ball.shootStrength = Math.max(minShootStrength, Math.min(maxShootStrength, currCourse.ball.shootStrength))
        }

        function adjustZoom() {
            let padding = GRAPHICS.outerPadding()
            let courseBounding = currCourse.getBoundingBox()

            if (courseBounding.min.x > padding && courseBounding.min.y > padding)
                zoomFactor += GRAPHICS.zoomSpeed

            padding -= 10
            if (courseBounding.min.x < padding || courseBounding.min.y < padding)
                zoomFactor -= GRAPHICS.zoomSpeed
            
            viewCentre = new Vector2d(canvas.width, canvas.height).scale(0.5)
        }

        function loop() {
            handleInputs()
            currCourse.ball.update(1)
            drawBackground()
            drawLines([
                "Arrow keys to move cursor",
                "Space to shoot",
                "Or use touch controls"
            ], 0.7)
            currCourse.draw(false, false)
            adjustZoom()

            if (currCourse.completed) {
                currCourseIndex = (currCourseIndex + 1)
                currCourse = courses[currCourseIndex]
                if (currCourse === undefined) {
                    gameRunning = false
                }
                coursesFinished++
                if (args.file) {
                    gameRunning = false
                }
            }

            if (gameRunning)
                terminal.window.requestAnimationFrame(loop)
        }

        loop()

        while (gameRunning) await sleep(100)

        terminalWindow.close()

        if (args.file) {
            terminal.printSuccess(`You completed the ${course.name} course!`)
            terminal.printLine(`Your score is ${Math.floor(100 / totalShots)}`)
        } else {
            terminal.printSuccess(`You completed ${coursesFinished} courses!`)
            terminal.printLine("I'm currently working on adding more, so stay tuned!")
    
            if (coursesFinished == courses.length) {
                let score = Math.floor(coursesFinished / totalShots * 100)
                terminal.printLine(`Your score is ${score}`)
                await HighscoreApi.registerProcess("minigolf")
                await HighscoreApi.uploadScore(score)
            } else {
                terminal.printLine("You didn't complete all courses, so no score was registered.")
            }
        }

    }

}, {
    description: "play a game of minigolf",
    args: {
        "?l=level:i": "open a specific level",
        "?e=edit:b": "open map editor",
        "?f=file:s": "open a specific file",
        "?fullscreen:b": "activate fullscreen mode"
    },
    defaultValues: {
        level: 1
    },
    isGame: true
})
// ------------------- mkdir.js --------------------
terminal.addCommand("mkdir", async function(args) {
    if (args.directory_name.match(/[\\\/\.\s]/))
        throw new Error("File may not contain '/' or '\\'")
    if (terminal.fileExists(args.directory_name))
        throw new Error("File/Directory already exists")
    let newFolder = new Directory({})
    terminal.currFolder.content[args.directory_name] = newFolder
    await terminal.fileSystem.reload()
    terminal.printLine(`Created ${terminal.fileSystem.pathStr}/${args.directory_name}/`)
}, {
    description: "create a new directory",
    args: ["directory_name"]
})


// ------------------- morse.js --------------------
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


// ------------------- mv.js --------------------
terminal.addCommand("mv", async function(args) {
    let file = terminal.getFile(args.file)
    if (["..", "-"].includes(args.directory)) {
        if (terminal.currFolder == terminal.rootFolder)
            throw new Error("You are already at ground level")
        var directory = terminal.currFolder.parent
    } else if (["/", "~"].includes(args.directory)) {
        var directory = terminal.rootFolder
    } else if ("." == args.directory) {
        var directory = terminal.currFolder
    } else {
        var directory = terminal.getFile(args.directory, FileType.FOLDER)
    }
    let fileCopy = file.copy()
    directory.content[file.name] = fileCopy
    fileCopy.parent = directory
    delete file.parent.content[file.name]
    await terminal.fileSystem.reload()
}, {
    description: "move a file",
    args: ["file", "directory"]
})


// ------------------- name-gen.js --------------------
terminal.addCommand("name-gen", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../names/",
        name: "AI Name Finder. Rate some and click 'done'",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a name generator",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- name.js --------------------
terminal.addCommand("name", async function(args) {
    await terminal.modules.import("game", window)

	const methods = {
		set: async () => {
			let newName = args.newname || ""
			while (!/^[a-zA-Z0-9_\-]{1,20}$/.test(newName)) {
				if (newName) {
            		terminal.printError("Name must be 1-20 characters long and only contain letters, numbers, dashes and underscores")
				}
				newName = await terminal.prompt("[highscores] username: ")
			}
			
			HighscoreApi.setUsername(newName)
			terminal.printSuccess("Set new username")
            terminal.print("Reset the username using ")
            terminal.printCommand("name reset", "name reset", Color.COLOR_1)
		},
		reset: async () => {
			if (HighscoreApi.username) {
				HighscoreApi.resetUsername()
				terminal.printSuccess("Reset username")
			} else {
				terminal.printError("No custom username found")
			}
		},
		get: async () => {
			let name = localStorage.getItem("highscore_username")
            if (name == null) {
                name = undefined
            }
			terminal.printLine(`Current username: "${name}"`)
		}
	}
	
	if (!Object.keys(methods).includes(args.method))
		throw new Error(`Unknown method "${args.method}"`)
		
	await methods[args.method]()
}, {
	description: "set a default name for the highscore system to use",
	args: {
		"method": "set | get | reset",
		"?newname": "the new name"
	},
})
// ------------------- ncr.js --------------------
terminal.addCommand("ncr", async function(args) {
    const binom = (await terminal.modules.load("binom", terminal)).binom
    let n = ~~args.n
    let k = ~~args.k
    if (k > n) {
        throw new Error("k must be smaller than n")
    }
    terminal.printLine(binom(n, k))
}, {
    description: "calculate binomial distribution value",
    args: {
        "n:n:0~100": "the number of trials",
        "k:n:0~100": "the number of successes"
    }
})


// ------------------- neural-car.js --------------------
const myNewGrid = {
    width: 256,
    height: 128,
    data: `                                                                                                                                
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXX                                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX     XXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXX                                        XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXX                                           XXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                             XXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                              XXXXXXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                              XXXXXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                               XXXXXXXXXXXXXXXXXXXXX                         XXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                                XXXXXXXXXXXXXXXXXXX                           XXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                                XXXXXXXXXXXXXXXXXX                             XXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                                 XXXXXXXXXXXXXXXX                              XXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                                  XXXXXXXXXXXXXX                                XXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                                   XXXXXXXXXXXX                                  XXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                                                                                                  XXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXX                                                                                                 XXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXX                                                                                                  XXXXXX 
XXXXXXXXXXXXXXXXXXXXXXX                                                                                                  XXXXXX 
XXXXXXXXXXXXXXXXXXXXXXX                                                                                                  XXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXX                                                                                                  XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXX                                                                                                XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                                               XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXX               XXXXXX                                                                         XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX     XXXXXXXXXXXXXXX                                                                       XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                                      XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                            XXXXXXX                 XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                         XXXXXXXXXX                XXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                       XXXXXXXXXXXX                XXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                    XXXXXXXXXXXXX                XXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                XXXXXXXXXXXXXX                XXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXXXXXXX                XXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                           XXXXXXXXXXXXXXX                XXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXXXXXXXX                 XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXXXXX                 XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        XXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXXX                                         XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXXX                                              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXXX                                                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXX 
XXXXXXXXXXXXX                                                         XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXX 
XXXXXXXXXXXXX                                                                           XXXXXXXXXXXXXXXXXXX                 XXX 
XXXXXXXXXXXX                                                                             XXXXXXXXXXXXXXXXXX                 XXX 
XXXXXXXXXXXX                                                                             XXXXXXXXXXXXXXXXXX                 XXX 
XXXXXXXXXXX                                                                               XXXXXXXXXXXXXXXXX                XXXX 
XXXXXXXXXXX                                                                               XXXXXXXXXXXXXXXX                 XXXX 
XXXXXXXXXXX                                                                              XXXXXXXXXXXXXXXXX                 XXXX 
XXXXXXXXXX                 XXXXXXXXXXXXX                                                XXXXXXXXXXXXXXXXX                  XXXX 
XXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXX 
XXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXX 
XXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXX 
XXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXX 
XXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXX 
XXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXXX 
XXXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXXX 
XXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXX 
XXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXXXX 
XXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXX 
XXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXX 
XXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXX 
XXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXX 
XXXXXXXXX        XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXX 
XXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXX 
XXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXX 
XXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXXXXXXX                    XXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                         XXXXXXXXXXXXXX                    XXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                            XXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                            XXXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                              XXXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                                                             XXXXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX             XXXXXXXX                                        XXXXXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           XXXXXXXXXXX                                       XXXXXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXX                                     XXXXXXXXXXXXXXXXX 
XXXXXXXXXXX         XXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXX                                   XXXXXXXXXXXXXXXXXX 
XXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXX                                 XXXXXXXXXXXXXXXXXXX 
XXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXX                             XXXXXXXXXXXXXXXXXXXXX 
XXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXX         XXXXXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXX         XXXXXXXXXXXXXXXXXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXX         XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXX         XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXX              X   XXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXX                 XX     XXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXX           XXXXXXXXXXXXXXXXXXXXX                   X       XXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXX                    XX        XXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXX                      XX          XXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXX             XXXXXXXXXXX                       XX            XXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXX                   XXXX                     XXXX              XXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXX                                             XX                XXXXXXXXXXXXXXX 
XXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXX                                              X                 XXXXXXXXXXXXXX 
XXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXX                                                                XXXXXXXXXXXXXX 
XXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXX                                                                 XXXXXXXXXXXXX 
XXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXX                                                                XXXXXXXXXXXXX 
XXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXX                              XXXXX                              XXXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXX                              XXXXX                              XXXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXX                                X X                  X           XXXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXX                               XX                    XX           XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXX                              X                    XXX           XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXX                              X                   XXXXX          XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXX                             X                 XXXX             XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXX                            X                XX                XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXX                           X              XXX                 XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXX                          X  XXXXXXX   XXX                   XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXXXXXX                     XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXX                      XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXX 
XXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        XXXXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXX 
XXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXX 
XXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXX 
XXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXX 
XXXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXX 
XXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        X            XXXXXXXXXXX 
XXXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        XXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        X            XXXXXXXXXXX 
XXXXXXXXX                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXX 
XXXXXXXX                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXX 
XXXXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                       XXXXXXXXXXX 
XXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXX 
XXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                         XXXXXXXXXXX 
XXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                         XXXXXXXXXXX 
XXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                          XXXXXXXXXXX 
XXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                         XXXXXXXXXXX 
XXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX XXX                       XXXXXXXXXXX 
XXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   XXX                    XXXXXXXXXXXX 
XXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX      XX                   XXXXXXXXXXXX 
XXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        XX                 XXXXXXXXXXXXX 
XXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXX            XXXXXXXXXXXXX 
XXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX              XXX           XXXXXXXXXXXXXX 
XXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               XX            XXXXXXXXXXXXXX 
XXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                X            XXXXXXXXXXXXXXX 
XXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXXXXXXXXX 
XXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                               XXXXXXXXXXXXXXXXX 
XXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                               XXXXXXXXXXXXXXXXXX 
XXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                               XXXXXXXXXXXXXXXXXXX 
XXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXXXXXXXXXXXXX 
XXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXXXXXXXXXXXXXX 
XXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                             XXXXXXXXXXXXXXXXXXXXXX 
XXXX           XXXXXXXXXXXXXXXXXXXXXXXXX   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                            XXXXXXXXXXXXXXXXXXXXXXXX 
XXXX           XXXXXXXXXXXXXXXXXXXXX         XXXXXXXXXXXXXXXXXXXXXXXXXXXXX                            XXXXXXXXXXXXXXXXXXXXXXXXX 
XXXX            XXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXXXXXXXXXX                          XXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXX            XXXXXXXXX                       XXXXXXXXXXXXXXXXXXXXXXXX                          XXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXX                                              XXXXXXXXXXXXXXXXXXXXXX              XX         XXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXX                                              XXXXXXXXXXXXXXXXXXXXXX               XX      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX                                              XXXXXXXXXXXXXXXXXXXXX                X  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXX                                              XXXXXXXXXXXXXXXXXXXX                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXX                                             XXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXX                                            XXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXX                                            XXXXXXXXXXXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                                           XXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXX                   XXX                    XXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXX             XXXXXXXX                   XXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX XXXX         XX XXXXXXXXXXXXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX    XXXX   XXX   XXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   XXX      XXX  XXXXXXXXXXXXXXXXXXXX                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               XXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                 XXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXXXXXXXXXXXXXX                  XX     XXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXXXXXXXXXXXXXXX                          XXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                            XXXXXXXXXXXXXXXXXXXXXXXX                           XXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXX                             XXXXXXXXXXXXXXXXXXXXXXXXXX                           XXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXX                               XXXXXXXXXXXXXXXXXXXXXXXXXX                            XXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXX                                XXXXXXXXXXXXXXXXXXXXXXXXXXX                             XXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXX                                 XXXXXXXXXXXXXXXXXXXXXXXXXXX                              XXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXX                                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXX                XXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXX                                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXX                XXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXX                                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXX               XXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXX                               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        XX XX                XXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXX                               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX     XXX                    XXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXX                              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX    XX                       XXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  XX                        XXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                         XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                         XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                        XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX                XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX        XX     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX         XXX   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX         XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                    XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX          XX  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX           XX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX XXXX             XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   XXXX          XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX      XXX        XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX     XXX         XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  XXX           XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX               XXXXXXXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               XXXXXXXXXXXXXXXXXXX 
XXXXXXXXX               XXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXX 
XXXXXXXXX               XXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX               XXXXXXXXXXXXXXXX                        XXXXXXXXXXXXXXXXXXXXXXXXXXXXX             XXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                XXXXXXXXXXXX                            XXXXXXXXXXXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXX                 XXXXXXXXXX                              XXXXXXXXXXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXX                 XXXXXXX                                 XXXXXXXXXXXXXXXXXXXXXXXXX            XXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXX                  XXXXX                     X             XXXXXXXXXXXXXXXXXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXX                                           XX                 XX    XX     XXXX            XXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXX                                         XXX                  X   XX                     XXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXX                                       XX X                  X   X                     XXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXX                                     XX  X                   X  X                    XXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXX                                    X   X                   XX X                   XXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXX                                  XX   X                    XXX                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXX                               XXXXX   X                   XX                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXX                            XXXXXXXXXXXX                                      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXX                          XXXXXXXXXXXXX                                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXX                      XXXXXXXXXXXXXXXXX                                   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXXX                                 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXX              XXXXXXXXXXXXXXXXXXXXXXX                     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 
                                                                                                                                
`,
    checkpoints: [
        [30, 24],[29, 27],[29, 28],[28, 30],[28, 30],
        [27, 33],[26, 35],[26, 36],[26, 38],[26, 40],
        [26, 41],[26, 44],[26, 44],[26, 46],[26, 49],
        [27, 51],[28, 53],[29, 54],[30, 56],[31, 58],
        [32, 59],[32, 60],[32, 61],[33, 63],[34, 65],
        [34, 66],[35, 68],[36, 69],[37, 71],[38, 73],
        [38, 74],[38, 76],[38, 78],[38, 81],[39, 83],
        [38, 84],[37, 87],[36, 90],[35, 91],[34, 93],
        [33, 95],[33, 96],[32, 98],[32, 102],[31, 103],
        [31, 105],[33, 108],[34, 110],[36, 110],[39, 112],
        [38, 112],[40, 113],[42, 114],[44, 115],[45, 115],
        [46, 115],[49, 115],[50, 115],[51, 115],[54, 115],
        [56, 115],[59, 115],[62, 115],[63, 115],[65, 115],
        [67, 115],[69, 114],[70, 114],[72, 113],[74, 112],
        [75, 111],[76, 111],[78, 110],[81, 109],[82, 108],
        [84, 108],[85, 107],[87, 106],[88, 105],[89, 103],
        [90, 101],[91, 100],[92, 99],[93, 97],[94, 95],
        [94, 93],[94, 91],[95, 89],[95, 87],[95, 86],
        [95, 85],[95, 83],[93, 79],[93, 79],[91, 77],
        [90, 75],[89, 73],[88, 72],[87, 70],[87, 68],
        [87, 67],[88, 65],[88, 63],[89, 62],[91, 60],
        [92, 58],[93, 57],[95, 56],[96, 55],[97, 54],
        [99, 52],[100, 52],[103, 52],[104, 52],[106, 52],
        [110, 52],[111, 52],[112, 52],[115, 54],[116, 55],
        [117, 57],[120, 59],[121, 60],[122, 62],[123, 62],
        [123, 64],[124, 65],[124, 67],[124, 68],[124, 69],
        [123, 71],[122, 73],[122, 74],[121, 76],[120, 77],
        [120, 78],[119, 79],[119, 80],[118, 82],[118, 83],
        [118, 84],[118, 85],[118, 86],[119, 88],[120, 89],
        [120, 90],[120, 91],[120, 93],[121, 94],[121, 95],
        [121, 97],[120, 99],[120, 100],[120, 101],[120, 102],
        [121, 104],[122, 106],[124, 106],[125, 107],[126, 107],
        [128, 107],[129, 107],[131, 107],[131, 107],[133, 106],
        [134, 105],[135, 104],[136, 104],[137, 103],[137, 102],
        [139, 102],[140, 101],[142, 101],[144, 102],[146, 103],
        [147, 104],[148, 104],[150, 104],[152, 104],[153, 104],
        [155, 103],[156, 103],[158, 102],[159, 101],[160, 100],
        [161, 98],[162, 97],[163, 95],[164, 93],[164, 91],
        [165, 90],[166, 88],[167, 86],[168, 84],[170, 83],
        [171, 81],[172, 80],[174, 79],[176, 78],[177, 78],
        [180, 77],[180, 77],[182, 77],[183, 78],[185, 79],
        [186, 79],[188, 80],[188, 81],[190, 83],[192, 84],
        [193, 86],[194, 87],[195, 89],[197, 91],[198, 92],
        [199, 93],[201, 94],[202, 95],[204, 96],[206, 97],
        [208, 97],[209, 98],[211, 98],[213, 98],[215, 98],
        [217, 98],[219, 98],[221, 98],[223, 97],[225, 96],
        [226, 96],[228, 94],[230, 93],[231, 92],[233, 89],
        [234, 88],[234, 86],[235, 84],[235, 83],[235, 80],
        [235, 78],[235, 76],[234, 73],[234, 71],[233, 69],
        [233, 67],[232, 64],[231, 60],[231, 59],[230, 56],
        [229, 52],[229, 50],[230, 48],[231, 46],[232, 45],
        [233, 44],[234, 42],[235, 41],[235, 39],[235, 37],
        [235, 35],[235, 34],[235, 33],[235, 30],[235, 28],
        [234, 27],[234, 25],[233, 24],[231, 23],[230, 22],
        [228, 21],[225, 19],[224, 18],[222, 17],[220, 16],
        [217, 16],[215, 16],[214, 17],[211, 17],[209, 18],
        [208, 18],[207, 19],[205, 20],[204, 21],[203, 23],
        [203, 25],[202, 27],[201, 30],[201, 30],[201, 30],
        [200, 32],[199, 33],[199, 34],[197, 36],[197, 37],
        [196, 38],[195, 40],[195, 41],[194, 42],[192, 44],
        [192, 45],[191, 45],[189, 46],[188, 46],[187, 46],
        [183, 46],[182, 46],[181, 46],[180, 46],[178, 46],
        [177, 46],[176, 45],[176, 44],[175, 42],[175, 42],
        [174, 40],[174, 39],[174, 37],[174, 36],[173, 34],
        [173, 32],[173, 30],[174, 29],[175, 27],[175, 25],
        [175, 24],[175, 22],[175, 21],[175, 19],[174, 18],
        [174, 17],[172, 15],[172, 13],[170, 12],[169, 11],
        [168, 10],[167, 9],[165, 9],[164, 9],[163, 9],
        [161, 9],[160, 10],[158, 10],[156, 10],[155, 10],
        [153, 11],[151, 11],[149, 12],[148, 12],[146, 13],
        [146, 14],[144, 15],[144, 16],[143, 17],[141, 19],
        [140, 19],[139, 20],[137, 21],[135, 21],[133, 21],
        [131, 22],[129, 22],[128, 21],[125, 20],[122, 20],
        [120, 20],[118, 19],[116, 19],[115, 19],[113, 18],
        [111, 17],[110, 17],[107, 17],[105, 16],[104, 15],
        [102, 15],[99, 15],[96, 16],[94, 16],[93, 15],
        [91, 14],[90, 14],[87, 13],[82, 13],[81, 13],
        [78, 13],[76, 14],[74, 14],[72, 16],[70, 16],
        [68, 17],[67, 18],[66, 21],[66, 23],[65, 25],
        [64, 26],[64, 28],[64, 31],[65, 33],[65, 34],
        [65, 36],[64, 38],[64, 39],[64, 41],[65, 43],
        [65, 45],[65, 46],[65, 48],[66, 50],[66, 51],
        [66, 53],[66, 55],[66, 56],[67, 59],[67, 61],
        [67, 63],[67, 65],[67, 68],[67, 70],[67, 72],
        [67, 74],[67, 77],[67, 79],[67, 82],[67, 84],
        [68, 87],    ]
}

terminal.addCommand("neural-car", async function(args) {
    await terminal.modules.load("window", terminal)
    await terminal.modules.load("neural", terminal)
    await terminal.modules.import("game", window)

    let terminalWindow = terminal.modules.window.make({
        name: "Neural Car Simulation (Genetic Algorithm)"
    })

    terminal.onInterrupt(() => {
        terminalWindow.close()
        gameRunning = false
    })

    let gridSize = new Vector2d(256, 128)
    const raycastLines = 10
    const carFOV = Math.PI / 2
    const carTurnSpeed = Math.PI / 90
    const mutationRate = 0.05
    const maxTicks = 10000
    let totalBestScore = 0

    let activeZooming = false

    let currViewPos = new Vector2d(0, 0)
    let currViewGoal = currViewPos.copy()
    let currZoom = 1
    let currZoomGoal = currZoom

    function canvasPosToZoomPos(pos) {
        return pos.scale(currZoom).add(currViewPos)
    }

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    canvas.style.cursor = "none"

    let gameRunning = true

    let wallData = []
    let checkpoints = []

    function initWallData() {
        for (let x = 0; x < gridSize.x; x++) {
            wallData[x] = []
            for (let y = 0; y < gridSize.y; y++) {
                wallData[x][y] = false
            }
        }
    }

    function drawBestScore() {
        context.strokeStyle = "#fff"
        context.font = "20px monospace"
        context.lineWidth = 1
        context.strokeText("Best Score: " + totalBestScore, 10, 30)
    }

    function loadWallData(wallString) {
        const lines = wallString.split("\n")
        for (let x = 0; x < gridSize.x; x++) {
            for (let y = 0; y < gridSize.y; y++) {
                wallData[x][y] = lines[x][y] == "X"
            }
        }
    }

    function loadCompressedWallData(wallData) {
        // wallData is Uint8Array, each byte is 8 consecutive cells
        for (let x = 0; x < gridSize.x; x++) {
            for (let y = 0; y < gridSize.y; y++) {
                let byte = wallData[Math.floor(y / 8) * gridSize.x + x]
                let bit = y % 8
                wallData[x][y] = (byte & (1 << bit)) != 0
            }
        }
    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    function drawWalls() {
        const blockSize = new Vector2d(canvas.width / gridSize.x, canvas.height / gridSize.y)
        for (let x = 0; x < gridSize.x; x++) {
            let wallCount = 0
            let wallStartY = 0
            for (let y = 0; y < gridSize.y; y++) {
                if (!wallData[x][y] && wallCount == 0) {
                    wallCount++
                    wallStartY = y
                } else if (!wallData[x][y]) {
                    wallCount++
                } else {
                    if (wallCount > 0) {
                        context.fillStyle = "white"
                        let rectPos = new Vector2d(x * blockSize.x, wallStartY * blockSize.y)
                        let rectSize = new Vector2d(blockSize.x + 1, blockSize.y * wallCount)
                        rectPos = canvasPosToZoomPos(rectPos)
                        rectSize = rectSize.scale(currZoom)
                        if (rectPos.x + rectSize.x < 0 || rectPos.x > canvas.width || rectPos.y + rectSize.y < 0 || rectPos.y > canvas.height) {
                            wallCount = 0
                            continue
                        }
                        context.fillRect(rectPos.x, rectPos.y, rectSize.x, rectSize.y)
                    }
                    wallCount = 0
                }
            }
        }
    }

    function drawCheckpoints() {
        const blockSize = new Vector2d(canvas.width / gridSize.x, canvas.height / gridSize.y)
        for (let i = 0; i < checkpoints.length; i++) {
            context.fillStyle = "red"
            context.fillRect(checkpoints[i].x * blockSize.x, checkpoints[i].y * blockSize.y, blockSize.x, blockSize.y)
        }
    }

    function loadCheckpoints(checkpointData) {
        checkpoints = checkpointData.map((checkpoint) => new Vector2d(checkpoint[0], checkpoint[1]))
    }

    function loadGrid(grid) {
        gridSize.x = grid.width
        gridSize.y = grid.height
        initWallData()
        loadWallData(grid.data)
        loadCheckpoints(grid.checkpoints)
    }

    function nearestCheckpoint(pos) {
        let nearest = null
        let nearestIndex = -1
        let nearestDist = Infinity
        for (let i = 0; i < checkpoints.length; i++) {
            let dist = checkpoints[i].distance(pos)
            if (dist < nearestDist) {
                nearestDist = dist
                nearest = checkpoints[i]
                nearestIndex = i
            }
        }
        return [nearest, nearestIndex]
    }

    function canvasPosFromPos(pos) {
        return new Vector2d(
            pos.x / gridSize.x * canvas.width,
            pos.y / gridSize.y * canvas.height
        )
    }

    function posFromCanvasPos(canvasPos) {
        return new Vector2d(
            canvasPos.x / canvas.width * gridSize.x,
            canvasPos.y / canvas.height * gridSize.y
        )
    }

    function raycast(startPos, direction, maxDist) {
        let pos = startPos.copy()
        let dist = 0
        let directionLength = direction.length
        while (dist <= maxDist) {
            let x = Math.floor(pos.x)
            let y = Math.floor(pos.y)
            if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
                return [Infinity, pos]
            }
            if (wallData[x][y]) {
                return [dist, pos]
            }
            pos.iadd(direction)
            dist += directionLength
        }
        return [Infinity, pos]
    }

    class Brain {

        constructor() {
            this.net = new terminal.modules.neural.Net([raycastLines + 3, 10, 2])
            this.signals = ["left", "right"]
        }

        mutate() {
            this.net.mutate(mutationRate)
        }

        copy() {
            let newBrain = new Brain()
            newBrain.net = this.net.copy()
            return newBrain
        }

        think(car) {
            let inputs = []
            inputs.push(car.pos.x / gridSize.x)
            inputs.push(car.pos.y / gridSize.y)
            inputs.push(car.angle % (Math.PI * 2))
            for (let i = 0; i < raycastLines; i++) {
                inputs.push(car.lastRaycastData[i] / gridSize.length * 20)
            }
            let outputs = this.net.input(inputs)
            let maxIndex = terminal.modules.neural.indexOfMax(outputs)
            return this.signals[maxIndex]
        }
    }

    let lastSound = Date.now()

    class Car {

        constructor() {
            this.pos = checkpoints[0].copy()
            this.speed = 0.3
            this.angle = Math.PI / 2
            this.color = "blue"
            this.alive = true
            this.lastRaycastData = null
            this.brain = new Brain()
            this.score = 0
            this.bestScore = 0
            this.waypoints = []
            this.ticks = 0
        }

        die() {
            if (this.alive) {
                if (Date.now() - lastSound > 20) {
                    playFrequency(
                        Math.random() * 300 + 800,
                        100,
                        0.1
                    )
                    lastSound = Date.now()
                }
            }
            this.alive = false
        }

        get reachedEnd() {
            return this.score >= checkpoints.length - 2
        }

        get vel() {
            return Vector2d.fromAngle(this.angle).scale(this.speed)
        }

        checkCollision() {
            let x = Math.floor(this.pos.x)
            let y = Math.floor(this.pos.y)
            if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
                return true
            }
            return wallData[x][y]
        }

        update() {
            if (!this.alive) {
                return
            }

            this.ticks++

            let signal = this.brain.think(this)

            if (signal == "left") {
                this.angle -= carTurnSpeed
            } else if (signal == "right") {
                this.angle += carTurnSpeed
            }

            this.pos.iadd(this.vel)
            if (this.checkCollision()) {
                this.die()
            }

            this.score = this.calcScore()
            if (this.score > this.bestScore) {
                this.bestScore = this.score
            }

            if (this.bestScore - 1 > this.score)
                this.die()

            if (this.ticks % 5 == 0)
                this.waypoints.push(this.pos.copy())
        }

        get canvasPos() {
            return canvasPosToZoomPos(canvasPosFromPos(this.pos))
        }

        calcScore() {
            let [_, score] = nearestCheckpoint(this.pos)
            return score
        }

        raycast({draw=false}={}) {
            this.lastRaycastData = []
            let maxDist = Infinity
            for (let i = 0; i < raycastLines; i++) {
                let angle = this.angle - carFOV / 2 + carFOV / (raycastLines - 1) * i
                let direction = Vector2d.fromAngle(angle)
                let [dist, hitPos] = raycast(this.pos, direction, maxDist)
                this.lastRaycastData.push(dist)

                if (draw) {
                    let canvasPos = canvasPosToZoomPos(canvasPosFromPos(hitPos))
                    context.beginPath()
                    context.moveTo(this.canvasPos.x, this.canvasPos.y)
                    context.lineTo(canvasPos.x, canvasPos.y)
                    context.strokeStyle = "rgba(0, 0, 0, 0.2)"
                    context.lineWidth = 1
                    context.stroke()
                    context.closePath()
                }
            }
        }

        draw() {
            let size = new Vector2d(3.5, 2).scale(1 / gridSize.x * canvas.width).scale(currZoom)
            context.save()
            context.translate(this.canvasPos.x, this.canvasPos.y)
            context.rotate(this.angle)
            context.beginPath()
            let halfSize = size.scale(0.5)
            context.rect(-halfSize.x, -halfSize.y, size.x, size.y)
            context.strokeStyle = "black"
            context.lineWidth = 3
            context.fillStyle = this.alive ? this.color : "red"
            context.stroke()
            context.fill()
            context.closePath()

            context.fillStyle = "white"
            context.font = `${size.y}px monospace`
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillText(this.score, 0, 0)

            context.restore()
        }

    }

    function getBestCar(cars, allowDead=false) {
        let bestCar = cars[0]
        let bestScore = cars[0].score
        for (let car of cars) {
            if ((car.alive || allowDead) && car.score > bestScore) {
                bestScore = car.score
                bestCar = car
            }
        }
        return [bestCar, bestScore]
    }

    initWallData()
    loadGrid(myNewGrid)

    async function initWallDrawer() {
        let mouseDown = false
        let leftMouseDown = false
        let currMousePos = null
        let mouseDownPos = null

        let currDrawMode = "paint"

        function redraw() {
            clearCanvas()
            drawWalls()
            drawCheckpoints()
        }

        function posFromEvent(event) {
            let rect = canvas.getBoundingClientRect()
            let xCanvasPos = event.clientX - rect.left
            let yCanvasPos = event.clientY - rect.top
            let x = Math.floor(xCanvasPos / canvas.width * gridSize.x)
            let y = Math.floor(yCanvasPos / canvas.height * gridSize.y)
            return new Vector2d(x, y)
        }

        canvas.addEventListener("mousedown", function(event) {
            if (event.button == 0) {
                mouseDown = true
            } else if (event.button == 2) {
                leftMouseDown = true
            }
            let pos = posFromEvent(event)
            mouseDownPos = pos
        })

        canvas.addEventListener("mouseup", function(event) {
            mouseDown = false
            leftMouseDown = false
        })

        canvas.addEventListener("mouseleave", function(event) {
            mouseDown = false
            leftMouseDown = false
            currMousePos = null
        })

        canvas.addEventListener("contextmenu", function(event) {
            event.preventDefault()
        })

        function fill(pos, val) {
            let queue = []
            queue.push(pos)
            while (queue.length > 0) {
                let pos = queue.shift()
                if (pos.x < 0 || pos.x >= gridSize.x || pos.y < 0 || pos.y >= gridSize.y) {
                    continue
                }
                if (wallData[pos.x][pos.y] == val) {
                    continue
                }
                wallData[pos.x][pos.y] = val
                queue.push(pos.add(new Vector2d(1, 0)))
                queue.push(pos.add(new Vector2d(-1, 0)))
                queue.push(pos.add(new Vector2d(0, 1)))
                queue.push(pos.add(new Vector2d(0, -1)))
            }
        } 

        function fillRect(start, end, val) {
            for (let x = start.x; x <= end.x; x++) {
                for (let y = start.y; y <= end.y; y++) {
                    wallData[x][y] = val
                }
            }
        }

        function fillLine(start, end, val) {
            let delta = end.sub(start)
            let direction = delta.normalized
            for (let i = 0; i < delta.length; i++) {
                let pos = start.add(direction.scale(i))
                wallData[Math.floor(pos.x)][Math.floor(pos.y)] = val
            }
        }

        function drawCircle(pos, radius, val) {
            radius = Math.floor(radius)
            for (let x = pos.x - radius; x <= pos.x + radius; x++) {
                for (let y = pos.y - radius; y <= pos.y + radius; y++) {
                    if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
                        continue
                    }
                    let dist = new Vector2d(x, y).sub(pos).length
                    if (Math.floor(dist) <= Math.floor(radius)) {
                        wallData[x][y] = val
                    }
                }
            }
        }

        canvas.addEventListener("mousemove", function(event) {
            let pos = posFromEvent(event)

            if (currDrawMode == "paint") {
                if (mouseDown) {
                    wallData[pos.x][pos.y] = true
                } else if (leftMouseDown) {
                    wallData[pos.x][pos.y] = false
                }
            }

            if (currDrawMode == "fill") {
                if (mouseDown) {
                    fill(pos, true)
                } else if (leftMouseDown) {
                    fill(pos, false)
                }
            }

            if (currDrawMode == "rect" && mouseDownPos) {
                if (mouseDown) {
                    fillRect(mouseDownPos, pos, true)
                } else if (leftMouseDown) {
                    fillRect(mouseDownPos, pos, false)
                }
            }

            if (currDrawMode == "line" && mouseDownPos) {
                if (mouseDown) {
                    fillLine(mouseDownPos, pos, true)
                } else if (leftMouseDown) {
                    fillLine(mouseDownPos, pos, false)
                }
            }

            if (currDrawMode == "circle") {
                if (mouseDown) {
                    drawCircle(pos, 5, true)
                } else if (leftMouseDown) {
                    drawCircle(pos, 5, false)
                }
            }

            currMousePos = pos
            redraw()
        })

        terminal.window.addEventListener("resize", function(event) {
            redraw()
        })

        addEventListener("keydown", function(event) {
            if (event.key == "Enter") {
                if (gridSize.x * gridSize.y % 8 != 0) {
                    alert("Grid size must be a multiple of 8")
                    return
                }
                let dataString = ""
                for (let x = 0; x < gridSize.x; x++) {
                    for (let y = 0; y < gridSize.y; y++) {
                        dataString += wallData[x][y] ? "X" : " "
                    }
                    dataString += "\n"
                }

                let outString = `const myNewGrid = {\n`
                outString += `    width: ${gridSize.x},\n`
                outString += `    height: ${gridSize.y},\n`
                outString += `    data: \`${dataString}\`,\n`
                outString += `    checkpoints: [\n        `

                for (let i = 0; i < checkpoints.length; i++) {
                    outString += `[${checkpoints[i].x}, ${checkpoints[i].y}],`
                    if (i % 5 == 4) {
                        outString += "\n        "
                    }
                }
                outString += "    ]\n}"

                terminal.copy(outString, {printMessage: false})
                console.log(outString)
            } else if (event.key == " " && currMousePos != null) {
                checkpoints.push(currMousePos)
            } else if (event.key == "Backspace") {
                let [nearest, nearestIndex] = nearestCheckpoint(currMousePos)
                if (nearest != null) {
                    checkpoints.splice(nearestIndex, 1)
                }
            } else if (event.key == "f") {
                currDrawMode = "fill"
                console.log("fill mode activated")
            } else if (event.key == "p") {
                currDrawMode = "paint"
                console.log("paint mode activated")
            } else if (event.key == "l") {
                currDrawMode = "line"
                console.log("line mode activated")
            } else if (event.key == "r") {
                currDrawMode = "rect"
                console.log("rect mode activated")
            } else if (event.key == "c") {
                currDrawMode = "circle"
                console.log("circle mode activated")
            }
            redraw()
        })

        redraw()

        while (gameRunning) {
            await sleep(100)
        }
    }

    async function initSimulation() {
        const cars = []
        let bestWaypoints = []

        for (let i = 0; i < args.cars; i++) {
            cars.push(new Car())
        }

        function drawBestway() {
            if (bestWaypoints.length == 0) return
            let bestwayColor = "rgba(0, 255, 0, 0.5)"
            context.lineWidth = 10
            context.lineCap = "round"
            context.beginPath()
            let firstCanvasPos = canvasPosFromPos(bestWaypoints[0])
            firstCanvasPos = canvasPosToZoomPos(firstCanvasPos)
            context.moveTo(firstCanvasPos.x, firstCanvasPos.y)
            for (let i = 0; i < bestWaypoints.length - 1; i++) {
                let pos = canvasPosFromPos(bestWaypoints[i + 1])
                pos = canvasPosToZoomPos(pos)
                context.lineTo(pos.x, pos.y)
            }
            context.strokeStyle = bestwayColor
            context.stroke()
            context.closePath()
        }

        function redraw() {
            clearCanvas()
            drawWalls()
            drawBestway()
            for (let i = 0; i < cars.length; i++) {
                cars[i].draw()
                cars[i].raycast({draw: true})
            }
            drawBestScore()
        }

        function update() {
            for (let i = 0; i < cars.length; i++) {
                cars[i].update()
            }
        }

        function geneticAlgorithm() {
            let [bestCar, bestScore] = getBestCar(cars, true)
            bestWaypoints = bestCar.waypoints.slice()

            if (bestScore > totalBestScore) {
                totalBestScore = bestScore
            }

            let newCars = []
            for (let i = 0; i < cars.length; i++) {
                let newCar = new Car()
                newCar.brain = bestCar.brain.copy()
                if (i != 0) {
                    newCar.brain.mutate(mutationRate)
                }
                newCars.push(newCar)
            }

            cars.splice(0, cars.length)
            for (let i = 0; i < newCars.length; i++) {
                cars.push(newCars[i])
            }
        }
        
        addEventListener("keydown", function(event) {
            if (event.key == "ArrowDown") {
                currZoomGoal *= 1.1
            } else if (event.key == "ArrowUp") {
                currZoomGoal /= 1.1
            }

            if (event.key == " ") {
                activeZooming = !activeZooming
                if (!activeZooming) {
                    currViewGoal = new Vector2d(0, 0)
                    currZoomGoal = 1
                } else {
                    currZoomGoal = 2
                }
            }
        })

        while (gameRunning) {
            let tick = 0

            while (tick < maxTicks) {
                redraw()
                update()
                await sleep(30)

                let aliveCars = 0
                for (let i = 0; i < cars.length; i++) {
                    if (cars[i].alive) {
                        aliveCars++
                    }
                }

                if (cars.every(car => !car.alive)) {
                    break
                }

                // if a car has reached the end of the track, stop the simulation
                if (cars.reduce((acc, car) => acc + (car.reachedEnd ? 1 : 0), 0) > 0) {
                    break
                }

                tick++

                if (tick % 1 == 0) {
                    let [bestCar, bestScore] = getBestCar(cars)
                    if (bestCar) {
                        bestWaypoints = bestCar.waypoints

                        if (activeZooming) {
                            // set viewOffset to the best car
                            currViewGoal = canvasPosFromPos(bestCar.pos).scale(-currZoom).add(
                                new Vector2d(canvas.width / 2, canvas.height / 2)
                            )
                        }
                    }

                    if (bestScore > totalBestScore) {
                        totalBestScore = bestScore
                    }
                }

                let delta = currViewGoal.sub(currViewPos)
                currViewPos = currViewPos.add(delta.scale(0.05))

                currZoom += (currZoomGoal - currZoom) * 0.05
            }

            geneticAlgorithm()
            playFrequency(
                1000, 100, 0.1
            )
        }
    }

    if (args.edit) {
        await initWallDrawer()
    } else {
        await initSimulation()
    }

    terminalWindow.close()
}, {
    description: "start a neural car simulation",
    args: {
        "?cars:i:1~9999": "number of cars to simulate",
        "?edit:b": "activate the wall editor",
    },
    defaultValues: {
        cars: 100,
    }
})
// ------------------- neural-rocket.js --------------------
terminal.addCommand("neural-rocket", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("neural", terminal)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Neural Rocket Simulation (Genetic Algorithm)"
    })

    terminal.onInterrupt(() => {
        terminalWindow.close()
        gameRunning = false
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const canvasSize = () => new Vector2d(canvas.width, canvas.height)

    const GRAVITY = new Vector2d(0, 0.05)
    const ALIVE_ROCKET_COLOR = "rgba(255, 255, 255, 0.5)"
    const DEAD_ROCKET_COLOR = "rgba(255, 0, 0, 0.5)"
    const THRUST_COLOR = "rgba(255, 255, 0, 0.5)"
    const THRUST_POWER = 0.5
    const TURN_SPEED = 0.05

    const TURN_LEFT = 1
    const TURN_RIGHT = 2
    const TURN_THRUST_OFF = 3
    const DONT_TURN = 4

    const TICK_SCORE = 1

    const BRAIN_OUTPUTS = [TURN_THRUST_OFF, DONT_TURN]
    const MUTATION_RATE = 0.1
    const CROSSOVER_RATE = 0.7
    const MAX_TICKS = 1000
    const bestRocketsPerGen = Math.max(5, Math.floor(args.population / 20))

    const ACTIONS = {
        [TURN_THRUST_OFF]: rocket => rocket.thrust = 0,
        [TURN_LEFT]: rocket => rocket.angle -= TURN_SPEED,
        [TURN_RIGHT]: rocket => rocket.angle += TURN_SPEED,
        [DONT_TURN]: rocket => {}
    }

    class RocketBrain {

        constructor() {
            this.net = new terminal.modules.neural.Net([
                8, // x, y, angle, distanceWallX, distanceWallY, velocityX, velocityY
                16,
                BRAIN_OUTPUTS.length
            ], {
                biasEnabled: true,
            })
        }

        static crossover(brain1, brain2) {
            let newBrain = new RocketBrain()
            newBrain.net = terminal.modules.neural.Net.crossover(brain1.net, brain2.net)
            return newBrain
        }

        copy() {
            let copy = new RocketBrain()
            copy.net = this.net.copy()
            return copy
        }

        mutate() {
            this.net.mutate(MUTATION_RATE)
        }

        think(rocket) {
            // x, y, angle, ticks, distanceWallX, distanceWallY, velocityX, velocityY
            let inputs = [
                rocket.pos.x / canvas.width,
                rocket.pos.y / canvas.height,
                (rocket.angle % (Math.PI * 2)) / (2 * Math.PI),
                rocket.survivedTicks / MAX_TICKS,
                canvas.width - rocket.pos.x,
                canvas.height - rocket.pos.y,
                rocket.vel.x,
                rocket.vel.y
            ]

            let outputs = this.net.input(inputs)
            let maxIndex = terminal.modules.neural.indexOfMax(outputs)
            let actionIndex = BRAIN_OUTPUTS[maxIndex]
            return ACTIONS[actionIndex]
        }

    }

    class Rocket {

        constructor() {
            this.pos = canvasSize().scale(0.5)
            this.angle = Math.PI / 2
            this.thrust = 0
            this.vel = new Vector2d(0, 0)
            this.size = 10
            this.alive = true
            this.brain = new RocketBrain()
            this.score = -Infinity
            this.currScore = 0
            this.survivedTicks = 0
        }

        calcScore() {
            this.currScore = TICK_SCORE * this.survivedTicks
            if (this.currScore > this.score) {
                this.score = this.currScore
            }
        }

        die() {
            if (!this.alive) return

            this.alive = false
        }

        get thrustVel() {
            return Vector2d.fromAngle(this.angle).scale(this.thrust)
        }

        isOutOfBounds() {
            return this.pos.x < 0 || this.pos.x > canvas.width ||
                this.pos.y < 0 || this.pos.y > canvas.height
        }

        update() {
            if (!this.alive) return

            this.survivedTicks++

            this.thrust = THRUST_POWER

            this.brain.think(this)(this)
            ACTIONS[TURN_LEFT](this)

            this.vel.iadd(GRAVITY)
            this.vel.iadd(this.thrustVel)
            let prevPos = this.pos.copy()
            this.pos.iadd(this.vel)

            if (this.isOutOfBounds()) {
                this.pos = prevPos
                this.vel = new Vector2d(0, 0)
                this.die()
            }

            this.calcScore()
        }

        _drawBody() {
            context.beginPath()
            context.moveTo(0, -this.size)
            context.lineTo(-this.size, this.size)
            context.lineTo(this.size, this.size)
            context.closePath()
            context.fillStyle = this.bodyColor
            context.fill()
        }

        _drawThrust() {
            context.beginPath()
            context.moveTo(-this.size / 2, this.size)
            context.lineTo(0, this.size + this.size / 2 * this.thrust * 30)
            context.lineTo(this.size / 2, this.size)
            context.closePath()
            context.strokeStyle = THRUST_COLOR
            context.stroke()
        }

        get bodyColor() {
            return this.alive ? ALIVE_ROCKET_COLOR : DEAD_ROCKET_COLOR
        }

        draw() {
            if (!this.alive)
                return
            
            context.save()
            context.translate(this.pos.x, this.pos.y)
            context.rotate(this.angle + Math.PI / 2)
            this._drawBody()
            this._drawThrust()
            context.restore()
        }

    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height)
    }

    function getBestRockets(population, n=bestRocketsPerGen) {
        let sorted = population.slice().sort((a, b) => b.score - a.score)
        return sorted.slice(0, n)
    }

    function makePopulation(populationSize) {
        let population = []
        for (let i = 0; i < populationSize; i++) {
            population.push(new Rocket())
        }
        return population
    }

    function allDead() {
        for (let rocket of population) {
            if (rocket.alive) return false
        }
        return true
    }

    function populationFromParents(populationSize, bestRockets) {
        let population = []
        for (let i = 0; i < populationSize; i++) {
            population.push(new Rocket())
        }

        function twoParents() {
            let i1 = Math.floor(Math.random() * bestRockets.length)
            let i2 = Math.floor(Math.random() * bestRockets.length)
            return [bestRockets[i1], bestRockets[i2]]
        }

        let bestRocket = bestRockets[0]
        let isFirst = true
        for (let rocket of population) {
            if (isFirst) {
                isFirst = false
                rocket.brain = bestRocket.brain.copy()
            } else {
                if (Math.random() < MUTATION_RATE) {
                    rocket.brain = new RocketBrain()
                } else if (Math.random() < CROSSOVER_RATE) {
                    let [p1, p2] = twoParents()
                    rocket.brain = RocketBrain.crossover(p1.brain, p2.brain)
                } else {
                    rocket.brain = bestRocket.brain.copy()
                    rocket.brain.mutate()
                }
            }
        }

        return population
    }

    function mutatePopulation(population, bestRocket) {
        let isFirst = true
        for (let rocket of population) {
            if (isFirst) {
                isFirst = false
                rocket.brain = bestRocket.brain.copy()
            } else {
                if (Math.random() < MUTATION_RATE) {
                    rocket.brain = new RocketBrain()
                } else {
                    rocket.brain = bestRocket.brain.copy()
                    rocket.brain.mutate()
                }
            }
        }
    }

    function getBestRocket(population) {
        let bestRocket = population[0]
        for (let rocket of population) {
            if (rocket.score > bestRocket.score) {
                bestRocket = rocket
            }
        }
        return bestRocket
    }

    function geneticAlgorithm(population) {
        let bestRockets = getBestRockets(population)
        let bestRocket = bestRockets[0]
        population = populationFromParents(population.length, bestRockets)
        bestScore = bestRocket.score
        return population
    }

    function drawInfos(infos) {
        context.fillStyle = "white"
        context.font = "20px monospace"
        context.textAlign = "left"
        context.textBaseline = "top"

        let y = 5
        for (let info of infos) {
            context.fillText(info, 10, y)
            y += 20
        }
    }

    function aliveCount(population) {
        let count = 0
        for (let rocket of population) {
            if (rocket.alive) count++
        }
        return count
    }

    let population = makePopulation(args.population)
    let generationCount = 0
    let bestScore = 0
    let currTick = 0

    function gameLoop() {
        currTick++

        clearCanvas()
        for (let rocket of population) {
            rocket.update()
            rocket.draw()
        }
        drawInfos([
            `generation: ${generationCount}`,
            `alive: ${aliveCount(population)}`,
            `best score: ${bestScore}`,
            `tick: ${currTick}`
        ])

        if (currTick > MAX_TICKS || allDead()) {
            population = geneticAlgorithm(population)
            currTick = 0
            generationCount++
        }
        
        if (gameRunning) {
            requestAnimationFrame(gameLoop)
        }
    }

    let gameRunning = true
    let r = new Rocket()
    gameLoop()

}, {
    description: "trains neural networks to fly rockets",
    args: {
        "?population:i:10~99999": "number of rockets in the population",
    },
    defaultValues: {
        "population": 100,
    },
    isSecret: true
})

// ------------------- nsolve.js --------------------
terminal.addCommand("nsolve", async function(args) {
    function makeDerivative(f, h=0.0001) {
        return x => (f(x + h) - f(x)) / h
    }

    function newtonSolve(f, df, startX, n) {
        let x = startX
        for (let i = 0; i < n; i++) {
            const slope = df(x)
            const value = f(x)

            if (slope == 0) {
                throw new Error(`slope is zero (at x=${x})`)
            }

            if (Math.abs(value) == Infinity) {
                throw new Error(`value is infinite (at x=${x})`)
            }

            if (args.list) {
                terminal.printLine(`n(${i}) = ${x}`)
            }

            let prevX = x
            x -= f(x) / slope

            if (prevX == x) {
                break
            }
        }
        return x
    }

    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+=[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(args.equation)) {
        terminal.printError("Invalid equation.")
        terminal.printLine("Only numbers, letters, *, +, -, ^, (, ), \\ and spaces are allowed")
        return
    }

    if (args.equation.split("=").length != 2) {
        throw new Error("More than one equation found.")
    }

    const [lhs, rhs] = args.equation.split("=")
    const f = Function("x", `return (${lhs})-(${rhs})`)
    const df = makeDerivative(f)

    const result = newtonSolve(f, df, args.startn, args.iterations)

    const error = Math.abs(f(result) - 0)
    if (error > 0.01) {
        terminal.printError("Method did not converge.", "Warning")
        terminal.printLine(`(wrong) result: ${result}`)
        terminal.printLine(`error: ${error}`)
    } else {
        terminal.printLine(result, Color.COLOR_1)
    }
}, {
    description: "solve an equation using the newton-raphson method",
    args: {
        "*e=equation:s": "the equation to solve",
        "?s=startn:n": "Starting number",
        "?i=iterations:i:1~999999": "number of iterations to perform",
        "?l=list:b": "list all intermediate values"
    },
    defaultValues: {
        startn: 0.71,
        iterations: 1000
    }
})
// ------------------- number-guess.js --------------------
terminal.addCommand("number-guess", async function(args) {
    await terminal.modules.import("game", window)

    terminal.printLine("i'm thinking of a random number. can you guess it?")
    let number = Math.floor(Math.random() * 1000) + 1
    let tries = 0
    while (true) {
        let guess = await terminal.promptNum("guess: ", {lineEnd: false})
        tries++
        if (guess == number) {
            break
        }
        if (guess < number) {
            terminal.printLine(`too low! (n > ${guess})`)
        }
        if (guess > number) {
            terminal.printLine(`too high! (n < ${guess})`)
        }
    }
    terminal.printLine(`you got it! it took you ${tries} tries`)    

    await HighscoreApi.registerProcess("number-guess")
    await HighscoreApi.uploadScore(-tries)

}, {
    description: "guess a random number",
    isGame: true
})
// ------------------- particle.js --------------------
terminal.addCommand("particle", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../particle/?p=" + encodeURIComponent(args.n),
        name: "Click to change gravity"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a particle simulation",
    args: {
        "?n:i:1000~10000000": "number of particles"
    },
    standardVals: {
        n: 100000
    },
    isSecret: true
})
// ------------------- pascal.js --------------------
terminal.addCommand("pascal", async function(args) {
    function generate(depth) {
        let rows = []
        let prevRow = []
        for (let i = 0; i < depth; i++) {
            let row = Array(i + 1)
            row[0] = 1
            row[i] = 1
            for (let j = 1; j < i; j++)
                row[j] = prevRow[j - 1] + prevRow[j]
            rows.push(row)
            prevRow = row
        }
        return rows
    }

    args.depth = ~~args.depth

    let data = generate(args.depth)
    // highest number is the one at the bottom middle always
    let maxNumWidth = data[args.depth - 1][Math.floor(args.depth / 2)].toString().length
    let nums = data.map(row => row.map(n => stringPadMiddle(n, maxNumWidth)))
    let rows = nums.map(row => row.join(" "))

    if (args.f) {
        terminal.printLine(rows[rows.length - 1])
        return
    }

    for (let i = 0; i < rows.length; i++) {
        terminal.printLine(stringPadMiddle(rows[i], args.depth * (maxNumWidth + 1)))
    }

}, {
    description: "print a pascal triangle",
    args: {
        "?depth:n:1~100": "the depth of the triangle",
        "?f:b": "only show the final row"
    },
    standardVals: {
        depth: 10
    }
})


// ------------------- password.js --------------------
terminal.addCommand("password", async function(args) {
    function generatePassword(length, characters, repeatChars) {
        let password = String()
        let tries = 0
        const maxTries = 10000
        while (password.length < length) {
            tries++
            if (tries > maxTries) {
                terminal.printError("Could not generate password!")
                return password
            }

            let char = characters[Math.floor(Math.random() * characters.length)]
            if (password.length > 0 && repeatChars) {
                let lastChar = password[password.length - 1]
                if (char == lastChar)
                    continue
            }
            password += char
        }
        return password
    }

    let password = generatePassword(args.l, args.c, args.norepeat)

    if (args.diverse) {
        let allLowerCaseLetters = "abcdefghijklmnopqrstuvwxyz"
        let allUpperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let allNumbers = "0123456789"
        let allSpecialChars = "$#@%&!?.,;:[]{}()_-+=*"

        if (args.l < 4) {
            throw new Error("Password length must be at least 4 to use the diverse option!")
        }

        function isValidPassword(password) {
            return (
                allLowerCaseLetters.split("").some(char => password.includes(char)) &&
                allUpperCaseLetters.split("").some(char => password.includes(char)) &&
                allNumbers.split("").some(char => password.includes(char)) &&
                allSpecialChars.split("").some(char => password.includes(char))
            )
        }

        if (isValidPassword(args.c)) {
            let i = 0
            let maxTries = 1000
            for (; i < maxTries; i++) {
                password = generatePassword(args.l, args.c, args.norepeat)
                if (isValidPassword(password))
                    break
            }

            if (i == maxTries) {
                throw new Error("Failed to generate a diverse password! Try increasing the length.")
            }
        } else {
            throw new Error("Could not generate a diverse password!\nThe characters you provided are not diverse enough.")
        }
    }

    terminal.printLine(password)
    if (!args.nocopy) {
        await terminal.copy(password)
        terminal.printLine("Copied to Clipboard ✓")
    }
}, {
    description: "Generate a random password",
    args: {
        "?l=length:i:1~9999": "The length of the password",
        "?c=chars:s": "The characters to use in the password",
        "?norepeat:b": "If present, the password will not repeat characters",
        "?nocopy:b": "Do not copy the password to the clipboard",
        "?d=diverse:b": "Use at least one special character, number, and uppercase letter",
    },
    standardVals: {
        l: 20,
        c: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&!?.,;:[]{}()_-+=*",
    }
})


// ------------------- pendulum.js --------------------
terminal.addCommand("pendulum", async function(args) {
    args.o /= args.n / 20
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../pendulum-wave/?n=" + encodeURIComponent(args.n) + "&o=" + encodeURIComponent(args.o),
        name: "Pendulum Wave Simulation",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "start a pendulum wave simulation",
    args: {
        "?n:i:1~10000": "number of pendulums",
        "?o:n:0~1": "offset of pendulums",
        "?f=fullscreen:b": "start in fullscreen mode"
    },
    standardVals: {
        n: 20,
        o: 0.025
    }
})
// ------------------- perilious-path.js --------------------
terminal.addCommand("perilious-path", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../perilious-path/",
        name: "Perilious Path Game",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "play perilous path",
    isGame: true,
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- physics.js --------------------
terminal.addCommand("physics", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../cloth/",
        name: "Click to add points, Space to simulate",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start a physics simulation",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- pi.js --------------------
terminal.addCommand("pi", function(args) {
    let pi = ""
    pi += "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"
    pi += "8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196"
    pi += "4428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273"
    pi += "7245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094"
    pi += "3305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912"
    pi += "9833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132"
    pi += "0005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235"
    pi += "4201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859"
    pi += "5024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303"
    pi += "5982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989"
    pi += "3809525720106548586327886593615338182796823030195203530185296899577362259941389124972177528347913151"
    pi += "5574857242454150695950829533116861727855889075098381754637464939319255060400927701671139009848824012"
    pi += "8583616035637076601047101819429555961989467678374494482553797747268471040475346462080466842590694912"
    pi += "9331367702898915210475216205696602405803815019351125338243003558764024749647326391419927260426992279"
    pi += "6782354781636009341721641219924586315030286182974555706749838505494588586926995690927210797509302955"
    pi += "3211653449872027559602364806654991198818347977535663698074265425278625518184175746728909777727938000"
    pi += "8164706001614524919217321721477235014144197356854816136115735255213347574184946843852332390739414333"
    pi += "4547762416862518983569485562099219222184272550254256887671790494601653466804988627232791786085784383"
    pi += "8279679766814541009538837863609506800642251252051173929848960841284886269456042419652850222106611863"
    pi += "0674427862203919494504712371378696095636437191728746776465757396241389086583264599581339047802759009"
    pi += "9465764078951269468398352595709825822620522489407726719478268482601476990902640136394437455305068203"
    pi += "4962524517493996514314298091906592509372216964615157098583874105978859597729754989301617539284681382"
    pi += "6868386894277415599185592524595395943104997252468084598727364469584865383673622262609912460805124388"
    pi += "4390451244136549762780797715691435997700129616089441694868555848406353422072225828488648158456028506"
    pi += "0168427394522674676788952521385225499546667278239864565961163548862305774564980355936345681743241125"
    pi += "1507606947945109659609402522887971089314566913686722874894056010150330861792868092087476091782493858"
    pi += "9009714909675985261365549781893129784821682998948722658804857564014270477555132379641451523746234364"
    pi += "5428584447952658678210511413547357395231134271661021359695362314429524849371871101457654035902799344"
    pi += "0374200731057853906219838744780847848968332144571386875194350643021845319104848100537061468067491927"
    pi += "8191197939952061419663428754440643745123718192179998391015919561814675142691239748940907186494231961"
    pi += "5679452080951465502252316038819301420937621378559566389377870830390697920773467221825625996615014215"
    pi += "0306803844773454920260541466592520149744285073251866600213243408819071048633173464965145390579626856"
    pi += "1005508106658796998163574736384052571459102897064140110971206280439039759515677157700420337869936007"
    pi += "2305587631763594218731251471205329281918261861258673215791984148488291644706095752706957220917567116"
    pi += "7229109816909152801735067127485832228718352093539657251210835791513698820914442100675103346711031412"
    pi += "6711136990865851639831501970165151168517143765761835155650884909989859982387345528331635507647918535"
    pi += "8932261854896321329330898570642046752590709154814165498594616371802709819943099244889575712828905923"
    pi += "2332609729971208443357326548938239119325974636673058360414281388303203824903758985243744170291327656"
    pi += "1809377344403070746921120191302033038019762110110044929321516084244485963766983895228684783123552658"
    pi += "2131449576857262433441893039686426243410773226978028073189154411010446823252716201052652272111660396"
    pi += "6655730925471105578537634668206531098965269186205647693125705863566201855810072936065987648611791045"
    pi += "3348850346113657686753249441668039626579787718556084552965412665408530614344431858676975145661406800"
    pi += "7002378776591344017127494704205622305389945613140711270004078547332699390814546646458807972708266830"
    pi += "6343285878569830523580893306575740679545716377525420211495576158140025012622859413021647155097925923"
    pi += "0990796547376125517656751357517829666454779174501129961489030463994713296210734043751895735961458901"
    pi += "9389713111790429782856475032031986915140287080859904801094121472213179476477726224142548545403321571"
    pi += "8530614228813758504306332175182979866223717215916077166925474873898665494945011465406284336639379003"
    pi += "9769265672146385306736096571209180763832716641627488880078692560290228472104031721186082041900042296"
    pi += "6171196377921337575114959501566049631862947265473642523081770367515906735023507283540567040386743513"
    pi += "6222247715891504953098444893330963408780769325993978054193414473774418426312986080998886874132604721"
    pi += "5695162396586457302163159819319516735381297416772947867242292465436680098067692823828068996400482435"
    pi += "4037014163149658979409243237896907069779422362508221688957383798623001593776471651228935786015881617"
    pi += "5578297352334460428151262720373431465319777741603199066554187639792933441952154134189948544473456738"
    pi += "3162499341913181480927777103863877343177207545654532207770921201905166096280490926360197598828161332"
    pi += "3166636528619326686336062735676303544776280350450777235547105859548702790814356240145171806246436267"
    pi += "9456127531813407833033625423278394497538243720583531147711992606381334677687969597030983391307710987"
    pi += "0408591337464144282277263465947047458784778720192771528073176790770715721344473060570073349243693113"
    pi += "8350493163128404251219256517980694113528013147013047816437885185290928545201165839341965621349143415"
    pi += "9562586586557055269049652098580338507224264829397285847831630577775606888764462482468579260395352773"
    pi += "4803048029005876075825104747091643961362676044925627420420832085661190625454337213153595845068772460"
    pi += "2901618766795240616342522577195429162991930645537799140373404328752628889639958794757291746426357455"
    pi += "2540790914513571113694109119393251910760208252026187985318877058429725916778131496990090192116971737"
    pi += "2784768472686084900337702424291651300500516832336435038951702989392233451722013812806965011784408745"
    pi += "1960121228599371623130171144484640903890644954440061986907548516026327505298349187407866808818338510"
    pi += "2283345085048608250393021332197155184306354550076682829493041377655279397517546139539846833936383047"
    pi += "4611996653858153842056853386218672523340283087112328278921250771262946322956398989893582116745627010"
    pi += "2183564622013496715188190973038119800497340723961036854066431939509790190699639552453005450580685501"
    pi += "9567302292191393391856803449039820595510022635353619204199474553859381023439554495977837790237421617"
    pi += "2711172364343543947822181852862408514006660443325888569867054315470696574745855033232334210730154594"
    pi += "0516553790686627333799585115625784322988273723198987571415957811196358330059408730681216028764962867"
    pi += "4460477464915995054973742562690104903778198683593814657412680492564879855614537234786733039046883834"
    pi += "3634655379498641927056387293174872332083760112302991136793862708943879936201629515413371424892830722"
    pi += "0126901475466847653576164773794675200490757155527819653621323926406160136358155907422020203187277605"
    pi += "2772190055614842555187925303435139844253223415762336106425063904975008656271095359194658975141310348"
    pi += "2276930624743536325691607815478181152843667957061108615331504452127473924544945423682886061340841486"
    pi += "3776700961207151249140430272538607648236341433462351897576645216413767969031495019108575984423919862"
    pi += "9164219399490723623464684411739403265918404437805133389452574239950829659122850855582157250310712570"
    pi += "1266830240292952522011872676756220415420516184163484756516999811614101002996078386909291603028840026"
    pi += "9104140792886215078424516709087000699282120660418371806535567252532567532861291042487761825829765157"
    pi += "9598470356222629348600341587229805349896502262917487882027342092222453398562647669149055628425039127"
    pi += "5771028402799806636582548892648802545661017296702664076559042909945681506526530537182941270336931378"
    pi += "5178609040708667114965583434347693385781711386455873678123014587687126603489139095620099393610310291"
    pi += "6161528813843790990423174733639480457593149314052976347574811935670911013775172100803155902485309066"
    pi += "9203767192203322909433467685142214477379393751703443661991040337511173547191855046449026365512816228"
    pi += "8244625759163330391072253837421821408835086573917715096828874782656995995744906617583441375223970968"
    pi += "3408005355984917541738188399944697486762655165827658483588453142775687900290951702835297163445621296"
    pi += "4043523117600665101241200659755851276178583829204197484423608007193045761893234922927965019875187212"
    pi += "7267507981255470958904556357921221033346697499235630254947802490114195212382815309114079073860251522"
    pi += "7429958180724716259166854513331239480494707911915326734302824418604142636395480004480026704962482017"
    pi += "9289647669758318327131425170296923488962766844032326092752496035799646925650493681836090032380929345"
    pi += "9588970695365349406034021665443755890045632882250545255640564482465151875471196218443965825337543885"
    pi += "6909411303150952617937800297412076651479394259029896959469955657612186561967337862362561252163208628"
    pi += "6922210327488921865436480229678070576561514463204692790682120738837781423356282360896320806822246801"
    pi += "2248261177185896381409183903673672220888321513755600372798394004152970028783076670944474560134556417"
    pi += "2543709069793961225714298946715435784687886144458123145935719849225284716050492212424701412147805734"
    pi += "5510500801908699603302763478708108175450119307141223390866393833952942578690507643100638351983438934"
    pi += "1596131854347546495569781038293097164651438407007073604112373599843452251610507027056235266012764848"
    pi += "3084076118301305279320542746286540360367453286510570658748822569815793678976697422057505968344086973"
    pi += "5020141020672358502007245225632651341055924019027421624843914035998953539459094407046912091409387001"
    pi += "2645600162374288021092764579310657922955249887275846101264836999892256959688159205600101655256375678"

    let digits = "3." + pi.slice(0, args.n)
    terminal.printLine(digits)
}, {
    description: "calculate pi to the n-th digit",
    args: {
        "?n:i:1~10000": "the number of digits"
    },
    standardVals: {
        n: 100
    }
})



// ------------------- piano.js --------------------
const asciiPiano = `+-+---+---+-+-+---+---+---+-+-+---+---+-+
| | C | D | | | F | G | A | | | C | D | |
| | # | # | | | # | # | # | | | # | # | |
| |   |   | | |   |   |   | | |   |   | |
| | q | w | | | r | t | z | | | i | o | |
| +---+---+ | +---+---+---+ | +---+---+ |
|   |   |   |   |   |   |   |   |   |   |
| C | D | E | F | G | A | H | C | D | E |
|   |   |   |   |   |   |   |   |   |   |
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
+---+---+---+---+---+---+---+---+---+---+
      < Press keys to play notes. >      
      
Star Wars (Main Theme):   1 5 4-3-2 8 5 4-3-2 8 5 4-3-4-2
Star Wars (Force Theme):  36 7 8-9-8 3 3-6 7 8 3 8 6 0 9
Happy Birthday:           112143 112154 1186432 zz6454
Avengers Theme:           2 22 65 4 3 2, 22 67 5 6
Twinkle Twinkle:          1 1 5 5 6 6 5, 4 4 3 3 2 2 1
Harry Potter:             36 876 09 7 6 875 z3
Shrek Intro (All Star):   r i-zztrr 7-zzttrr izztrrtw
Country Roads:            123 312 321 356 6553 2123 211 121
Despacito:
  8 7 63 3333 6666 6564 4444 66667 8 5 5555 888 99 7 8 7 6 3
Disney's Up Theme:
  4643 4632 2421 265 265 4-2 4543 3531 8-0-8-7
USSR Anthem:
  8 58 567 336 545 11 2 234 456 789
  550 989 558 767 336 545 118 7650`

terminal.addCommand("piano", async function(args) {
    const notesToUrl = {
        "C": "https://carolinegabriel.com/demo/js-keyboard/sounds/040.wav",
        "C#": "https://carolinegabriel.com/demo/js-keyboard/sounds/041.wav",
        "D": "https://carolinegabriel.com/demo/js-keyboard/sounds/042.wav",
        "D#": "https://carolinegabriel.com/demo/js-keyboard/sounds/043.wav",
        "E": "https://carolinegabriel.com/demo/js-keyboard/sounds/044.wav",
        "F": "https://carolinegabriel.com/demo/js-keyboard/sounds/045.wav",
        "F#": "https://carolinegabriel.com/demo/js-keyboard/sounds/046.wav",
        "G": "https://carolinegabriel.com/demo/js-keyboard/sounds/047.wav",
        "G#": "https://carolinegabriel.com/demo/js-keyboard/sounds/048.wav",
        "A": "https://carolinegabriel.com/demo/js-keyboard/sounds/049.wav",
        "A#": "https://carolinegabriel.com/demo/js-keyboard/sounds/050.wav",
        "H": "https://carolinegabriel.com/demo/js-keyboard/sounds/051.wav",
        "C2": "https://carolinegabriel.com/demo/js-keyboard/sounds/052.wav",
        "C2#": "https://carolinegabriel.com/demo/js-keyboard/sounds/053.wav",
        "D2": "https://carolinegabriel.com/demo/js-keyboard/sounds/054.wav",
        "D2#": "https://carolinegabriel.com/demo/js-keyboard/sounds/055.wav",
        "E2": "https://carolinegabriel.com/demo/js-keyboard/sounds/056.wav",
        "F2": "https://carolinegabriel.com/demo/js-keyboard/sounds/057.wav",
    }

    const audioElements = {}
    for (let note in notesToUrl) {
        audioElements[note] = new Audio(notesToUrl[note])
        audioElements[note].preload = true
    }

    const keysToNotes = {
        "1": "C", "q": "C#", "2": "D", "w": "D#", "3": "E",
        "4": "F", "r": "F#", "5": "G", "t": "G#", "6": "A",
        "z": "A#", "7": "H", "8": "C2", "i": "C2#", "9": "D2",
        "o": "D2#", "0": "E2",
    }

    let running = true
    terminal.onInterrupt(() => running = false)

    terminal.printLine(asciiPiano)
    terminal.scroll()

    terminal.document.addEventListener("keydown", function(event) {
        if (!running) return
        if (event.repeat) return
        if (event.key in keysToNotes) {
            // play even if already playing
            let note = keysToNotes[event.key]
            let audioElement = audioElements[note]
            audioElement.currentTime = 0
            audioElement.play()
        }
    })

    while (running) {
        await sleep(100)
    }
}, {
    description: "play a piano with your keyboard"
})
// ------------------- plane.js --------------------
terminal.addCommand("plane", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../flugzeug-spiel/",
        name: "Plane Game",
        fullscreen: args.fullscreen
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
    while (1) await sleep(100)
}, {
    description: "play the plane game",
    args: {
        "?f=fullscreen:b": "open in fullscreen mode"
    },
    isGame: true
})
// ------------------- plot.js --------------------
terminal.addCommand("plot", async function(args) {
    await terminal.modules.load("mathenv", terminal)

    let equation = args.equation
    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(equation)) {
        terminal.printError("Invalid equation")
        terminal.printLine("Only numbers, x, *, +, -, ^, (, ), \\ and spaces are allowed")
        return
    }
    let gridSize = {
        x: 67,
        y: 30
    }
    while (/[0-9]x/g.test(equation))
        equation = equation.replace(/([0-9])x/g, "$1*x")
    while (/[0-9a-z\.]+\s*\^\s*[0-9a-z\.]+/g.test(equation))
        equation = equation.replace(/([0-9a-z\.]+)\s*\^\s*([0-9a-z\.]+)/g, "$1**$2")
    let jsEnv = await terminal.modules.load("mathenv", terminal)
    let grid = Array.from(Array(gridSize.y)).map(() => Array(gridSize.x).fill(" "))
    let viewBound = {
        x: {min: args.xmin, max: args.xmax},
        y: {min: args.ymin, max: args.ymax}
    }
    if (viewBound.x.min >= viewBound.x.max || viewBound.y.min >= viewBound.y.max) {
        terminal.printError("Invalid bounds!")
        return
    }

    function drawIntoGrid(x, y, v) {
        if (isNaN(x) || isNaN(y)) return
        let gridX = Math.round((x - viewBound.x.min) / (viewBound.x.max - viewBound.x.min) * (gridSize.x - 1))
        let gridY = Math.round((y - viewBound.y.min) / (viewBound.y.max - viewBound.y.min) * (gridSize.y - 1))
        if (gridX < 0 || gridX >= gridSize.x || gridY < 0 || gridY >= gridSize.y) {
            return
        }
        grid[gridSize.y - 1 - gridY][gridX] = v
    }
    async function drawGrid() {
        let tempText = ""
        let tempColor = new Color(-1, -1, -1)
        for (let y = 0; y < gridSize.y; y++) {
            for (let x = 0; x < gridSize.x; x++) {
                let color = Color.WHITE
                switch(grid[y][x]) {
                    case ".":
                        color = Color.rgb(100, 100, 100)
                        break
                    case "/":
                    case "#":
                    case "\\":
                    case "]":
                    case "[":
                        color = Color.COLOR_1
                }
                if (tempColor.eq(color)) {
                    tempText += grid[y][x]
                } else {
                    if (tempText) {
                        terminal.print(tempText, tempColor)
                    }
                    tempText = grid[y][x]
                    tempColor = color
                }
            }
            if (tempText) {
                terminal.print(tempText, tempColor)
                tempText = ""
            }
            terminal.printLine()
        }
    }
    for (let y = viewBound.y.min; y <= viewBound.y.max; y += (viewBound.y.max - viewBound.y.min) / (gridSize.y - 1)) {
        drawIntoGrid(0, y, "|")
    }
    for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1)) {
        drawIntoGrid(x, 0, "~")
    }
    for (let x = ~~(viewBound.x.min); x < viewBound.x.max; x++) {
        let axisVal = (String(x).length > 1) ? String(x).slice(-1) : String(x)
        for (let y = viewBound.y.min; y <= viewBound.y.max; y += (viewBound.y.max - viewBound.y.min) / (gridSize.y - 1)) {
            if (x == 0) break
            drawIntoGrid(x, y, ".")
        }
        drawIntoGrid(x, 0, axisVal)
    }
    for (let y = ~~(viewBound.y.min); y < viewBound.y.max; y++) {
        let axisVal = (String(y).length > 1) ? String(y).slice(-1) : String(y)
        for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1)) {
            if (y == 0) break
            drawIntoGrid(x, y, ".")
        }
        drawIntoGrid(0, y, axisVal)
    }
    drawIntoGrid(0, 0, "+")

    function f(x) {
        terminal.modules.mathenv.setValue("x", x)
        let [result, error] = terminal.modules.mathenv.eval(equation)
        if (error) {
            terminal.printError(error)
            return
        } else {
            return result
        }
    }

    function slope(f, x, accuracy=0.01) {
        let minY = f(x - accuracy)
        let maxY = f(x + accuracy)
        let diff = maxY - minY
        return diff / (accuracy * 2)
    }
    const symbols = [
        ["]", 10],
        ["/", 1.5],
        ["#", -1.5],
        ["\\", -10],
        ["[", -Infinity],
    ]
    let yValues = []
    for (let x = viewBound.x.min; x <= viewBound.x.max; x += (viewBound.x.max - viewBound.x.min) / (gridSize.x - 1) / 5) {
        terminal.modules.mathenv.setValue("x", x)
        let [y, error] = terminal.modules.mathenv.eval(equation)
        if (error) {
            throw new Error(error)
        } else {
            let printSymbol = null
            let slopeVal = slope(f, x)
            for (let [symbol, minVal] of symbols) {
                if (slopeVal > minVal) {
                    printSymbol = symbol
                    break
                }
            }
            if (!isNaN(y))
                yValues.push(y)
            if (printSymbol != null)
                drawIntoGrid(x, y, printSymbol)
        }
    }
    await drawGrid()
    terminal.scroll()
    let playTime = args.playtime * 2
    function calcFrequency(y) {
        let maxFreq = 1000
        let minFreq = 200
        let yDiffBound = viewBound.y.max - viewBound.y.min
        let yDiffMin = y - viewBound.y.min
        let freqDiff = maxFreq - minFreq
        let freq = freqDiff * (yDiffMin / yDiffBound)
        return freq
    }
    let frequencies = []
    for (let y of yValues) {
        let frequency = calcFrequency(y)
        frequency = Math.max(50, frequency)
        frequency = Math.min(20000, frequency)
        frequencies.push(frequency)
    }
    let noteTime = playTime / frequencies.length
    for (let note of frequencies) {
        playFrequency(note, noteTime)
        await sleep(noteTime * 0.5)
    }
}, {
    description: "plot a mathematical function within bounds",
    args: {
        "equation": "the equation to plot",
        "?xmin:n:-1000~1000": "the minimum x value",
        "?xmax:n:-1000~1000": "the maximum x value",
        "?ymin:n:-1000~1000": "the minimum y value",
        "?ymax:n:-1000~1000": "the maximum y value",
        "?playtime:i:0~10000": "the time to play the sound for in milliseconds"
    },
    standardVals: {
        xmin: -3, xmax: 3.1,
        ymin: -3, ymax: 3.1,
        playtime: 2500
    }
})
// ------------------- plotter.js --------------------
terminal.addCommand("plotter", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../plot/",
        name: "Function Plotter",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "plot mathematical functions",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- polyrythm.js --------------------
terminal.addCommand("polyrythm", async function(args) {
    if (!args.numbers.match(/^(?:\d+\s)*\d+$/)) {
        terminal.printLine(`Example Use: "polyrythm 3 4 5"`)
        throw new Error("Invalid Numbers Format.")
    }

    let polyrythms = args.numbers.split(" ").map(s => parseInt(s))
    let polyrythmPrevSideProgress = polyrythms.map(() => 0)

    polyrythms.forEach(n => {
        if (n < 2) {
            throw new Error("Polyrythm cannot consist of numbers lower than 2")
        }
    })

    await terminal.modules.import("game", window)

    const canvas = printSquareCanvas({widthChars: 50})
    const context = canvas.getContext("2d")

    const canvasSize = new Vector2d(canvas.width, canvas.height)

    function circlePos(alpha, {
        radius=canvasSize.min * 0.4,
        offset=canvasSize.scale(0.5),
        applyOffset=true
    }={}) {
        alpha += Math.PI
        return new Vector2d(
            Math.sin(alpha) * radius + offset.x * applyOffset,
            Math.cos(alpha) * radius + offset.y * applyOffset
        )
    }

    function fillCircle(position, {
        radius=10,
    }={}) {
        context.beginPath()
        context.moveTo(...position.array)
        context.arc(...position.array, radius, 0, Math.PI * 2)
        context.fill()
    }

    function positionOnPolygon(numCorners, t) {
        let scaledT = t * numCorners
        let sideProgress = scaledT % 1
        let corner1Angle = Math.floor(scaledT) / numCorners * 2 * Math.PI
        let corner2Angle = Math.ceil(scaledT) / numCorners * 2 * Math.PI
        let corner1Pos = circlePos(corner1Angle)
        let corner2Pos = circlePos(corner2Angle)
        return [corner1Pos.lerp(corner2Pos, sideProgress), sideProgress]
    }

    function strokePolygon(numCorners) {
        context.beginPath()
        for (let i = 0; i <= numCorners; i++) {
            let alpha = i / numCorners * 2 * Math.PI
            let position = circlePos(alpha)
            if (i == 0) {
                context.moveTo(...position.array)
            } else {
                context.lineTo(...position.array)
            }
        }
        context.stroke()
    }

    context.strokeStyle = "white"
    context.fillStyle = "white"
    context.lineWidth = 2

    const startTime = Date.now()

    const noteFrequencies = [
        523.25,
        587.33,
        659.25,
        698.46,
        783.99,
        880.00,
        987.77,
        1046.50,
        1174.66,
        1318.51,
        1396.91,
        1567.98,
        1760.00,
        1975.53
    ]

    let running = true

    function redraw() {
        context.clearRect(0, 0, canvas.width, canvas.height)

        let t = ((Date.now() - startTime) % args.time) / args.time

        for (let i = 0; i < polyrythms.length; i++) {
            let corners = polyrythms[i]
            
            strokePolygon(corners)
            let [position, sideProgress] = positionOnPolygon(corners, t)
            let deltaSideProgress = Math.abs(sideProgress - polyrythmPrevSideProgress[i])
            fillCircle(position)

            if (deltaSideProgress > 0.5) {
                playFrequency(noteFrequencies[i % noteFrequencies.length], args.beepMs)
            }

            polyrythmPrevSideProgress[i] = sideProgress
        }

        if (running)
            requestAnimationFrame(redraw)
    }

    redraw()
    
    terminal.onInterrupt(() => running = false)

    terminal.scroll()

    while (running) {
        await sleep(1000)
    }
}, {
    description: "creates a polyrythm",
    args: {
        "*numbers": "numbers (e.g. \"3 4 5\")",
        "?t=time:n:10~99999": "time in miliseconds for full rotation",
        "?b=beepMs:n": "time in miliseconds that they beep for" 
    },
    defaultValues: {
        time: 4000,
        beepMs: 150
    }
})
// ------------------- pong.js --------------------
terminal.addCommand("pong", async function(args) {
    await terminal.modules.import("game", window)

    let fieldSize = new Vector2d(35, 20)
    let elements = []
    terminal.printLine(" " + "_".repeat(fieldSize.x * 2 + 1) + " ")
    for (let y = 0; y < fieldSize.y; y++) {
        let elementRow = []
        terminal.print("| ")
        for (let x = 0; x < fieldSize.x; x++) {
            let element = terminal.print(" ", undefined, {forceElement: true})
            element.style.transition = "none"
            terminal.print(" ")
            elementRow.push(element)
        }
        terminal.print("|")
        terminal.addLineBreak()
        elements.push(elementRow)
    }

    terminal.printLine("+" + "-".repeat(fieldSize.x * 2 + 1) + "+")
    terminal.print("| Player-score: ")
    let playerScoreOutput = terminal.print("0")
    terminal.printLine(" | Move your paddle using the arrow keys! |")
    terminal.print("| Enemy-score:  ")
    let enemyScoreOutput = terminal.print("0")
    terminal.printLine(" |----------------------------------------+")
    terminal.printLine("+-----------------+")
    
    let paddleWidth = 5
    let playerPaddlePos = Math.floor(fieldSize.y / 2 - paddleWidth / 2)
    let enemyPaddlePos = 0
    
    let ballColor = "white"
    
    function drawPaddle(x, pos) {
        for (let y = 0; y < fieldSize.y; y++) {
            if (y >= pos && y <= pos + paddleWidth) {
                elements[y][x].textContent = "#"
                elements[y][x].style.color = Color.WHITE
            } else {
                elements[y][x].textContent = " "
            }
        }
    }
    
    function drawPaddles() {
        drawPaddle(0, playerPaddlePos)
        drawPaddle(fieldSize.x - 1, enemyPaddlePos)
    }
    
    let possibleBallRot = [
        Math.PI / 4 * 1,
        Math.PI / 4 * 3,
        Math.PI / 4 * 5,
        Math.PI / 4 * 7
    ]
    
    let ballPos = new Vector2d(fieldSize.x / 2, fieldSize.y / 2)
    let ballVel = Vector2d.fromAngle(possibleBallRot[Math.floor(Math.random() * possibleBallRot.length)])
    ballVel.iscale(0.5)
    
    function resetBall() {
        ballPos = new Vector2d(fieldSize.x / 2, fieldSize.y / 2)
        ballVel = Vector2d.fromAngle(possibleBallRot[Math.floor(Math.random() * possibleBallRot.length)])
        ballVel.iscale(0.5)
    }
    
    function touchesPaddle(x, y) {
        let playerPaddleEnd = playerPaddlePos + paddleWidth
        let enemyPaddleEnd = enemyPaddlePos + paddleWidth
        if (x == 0 && y >= playerPaddlePos && y <= playerPaddleEnd)
            return "player"
        if (x == fieldSize.x - 1 && y >= enemyPaddlePos && y <= enemyPaddleEnd)
            return "enemy"
        return false
    }
    
    let gameRunning = true
    
    let listener = addEventListener("keydown", event => {
        if (!gameRunning) return
        if (event.key == "c" && event.ctrlKey) {
            removeEventListener("keydown", listener)
            gameRunning = false
        }
        if (event.key == "ArrowUp") {
            playerPaddlePos = Math.max(0, playerPaddlePos - 1)
            event.preventDefault()
        } else if (event.key == "ArrowDown") {
            playerPaddlePos = Math.min(playerPaddlePos + 1, fieldSize.y - paddleWidth - 1)
            event.preventDefault()
        }
        drawPaddles()
    })

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout([
            ["↑"],
            ["↓"],
            ["STRG+C"]
        ])

        let goingUp = false
        let goingDown = false

        terminal.mobileKeyboard.onkeydown = (e, keyCode) => {
            if (keyCode == "ArrowUp") {
                goingUp = true
            } else if (keyCode == "ArrowDown") {
                goingDown = true
            }
        }

        terminal.mobileKeyboard.onkeyup = (e, keyCode) => {
            if (keyCode == "ArrowUp") {
                goingUp = false
            } else if (keyCode == "ArrowDown") {
                goingDown = false
            }
        }

        function loop() {
            if (goingUp) {
                playerPaddlePos = Math.max(0, playerPaddlePos - 1)
            } else if (goingDown) {
                playerPaddlePos = Math.min(playerPaddlePos + 1, fieldSize.y - paddleWidth - 1)
            }
            drawPaddles()
        }

        setInterval(loop, 1000 / 30)
    }
    
    let playerScore = 0
    let enemyScore = 0
    
    function updateBall() {
        let x = Math.max(0, Math.min(Math.floor(ballPos.x), fieldSize.x - 1))
        let y = Math.max(0, Math.min(Math.floor(ballPos.y), fieldSize.y - 1))
        elements[y][x].textContent = " "
        elements[y][x].style.color = Color.WHITE
        ballPos.x += ballVel.x
        ballPos.y += ballVel.y
        x = Math.floor(ballPos.x)
        y = Math.floor(ballPos.y)
        
        if (y < 0 || y >= fieldSize.y) {
            ballVel.y *= -1
            ballPos.y += ballVel.y
        }
        
        x = Math.max(0, Math.min(x, fieldSize.x - 1))
        y = Math.max(0, Math.min(y, fieldSize.y - 1))
        
        if (touchesPaddle(x, y)) {
            ballVel.x *= -1
            ballPos.x += ballVel.x
            ballVel.iscale(1.1)
            ballColor = Color.random()
        } else if (x == 0) {
            enemyScore++
            resetBall()
            updateScoreBoard()
        } else if (x == fieldSize.x - 1) {
            playerScore++
            resetBall()
            updateScoreBoard()
        }
        
        elements[y][x].style.color = ballColor
        elements[y][x].textContent = "#"
    }
    
    function updateScoreBoard() {
        playerScoreOutput.textContent = stringPad(playerScore, 1, "0")
        enemyScoreOutput.textContent = stringPad(enemyScore, 1, "0")
    }
    
    function moveEnemy() {
        if (Math.random() < 0.5) return
        let diff = Math.floor(ballPos.y) - (enemyPaddlePos + Math.floor(paddleWidth / 2))
        if (diff < 0) {
            enemyPaddlePos -= 1
        } else if (diff > 0) {
            enemyPaddlePos += 1
        }
        enemyPaddlePos = Math.max(0, Math.min(enemyPaddlePos, fieldSize.y - paddleWidth - 1))
    }
    
    terminal.scroll()
    
    while (gameRunning) {
        let startIterationTime = Date.now()
        drawPaddles()
        updateBall()
        moveEnemy()
        let iterationTime = Date.now() - startIterationTime
        await sleep(30 - iterationTime)
        
        if (Math.max(enemyScore, playerScore) >= 3) {
            gameRunning = false
        }
    }
    
    removeEventListener("keydown", listener)
    terminal.addLineBreak()
    
    if (enemyScore > playerScore) {
        terminal.printLine("You lost to the enemy! Sorry!")
    } else {
        terminal.printLine("You won against the enemy! Congratulations!")
    }
    
}, {
    description: "play a game of pong against the computer",
    isGame: true
})
// ------------------- primes.js --------------------
terminal.addCommand("primes", async function() {
    function sqrt(value) {
        if (value < 0n) {
            throw 'square root of negative numbers is not supported'
        }
    
        if (value < 2n) {
            return value;
        }
    
        function newtonIteration(n, x0) {
            const x1 = ((n / x0) + x0) >> 1n;
            if (x0 === x1 || x0 === (x1 - 1n)) {
                return x0;
            }
            return newtonIteration(n, x1);
        }
    
        return newtonIteration(value, 1n);
    }

    function isPrime(n) {
        if (n < 2n)
            return false
        if (n === 2n)
            return true
        if (n % 2n === 0n)
            return false
        for (let i = 3n; i <= sqrt(n); i += 2n) {
            if (n % i === 0n)
                return false
        }
        return true
    }

    async function lucasLehmerTest(p, n) {
        let s = 4n
        for (let i = 0n; i < p - 2n; i++) {
            s = (s ** 2n - 2n) % n
        }
        return s === 0n
    }

    terminal.printLine("Press enter to generate the next mersenne prime.")

    for (let p = 0n; p < 10000n; p++) {
        if (!isPrime(p))
            continue
        const n = 2n ** p - 1n
        if (await lucasLehmerTest(p, n)) {
            terminal.print(`(2^${p}-1) ${n}`)
            await terminal.prompt("", {printInputAfter: false})
            terminal.addLineBreak()
        }
        await sleep(0)
    }
}, {
    description: "generate mersenne primes"
})
// ------------------- pull.js --------------------
terminal.addCommand("pull", async function(args) {
    if (terminal.fileExists(args.file))
        throw new Error("file already exists in folder")

    if (!terminal.isValidFileName(args.file))
        throw new Error("invalid file name")
    await terminal.modules.load("cliapi", terminal)
    let content = await terminal.modules.cliapi.pullFile(args.file)
    if (content == "undefined") {
        throw new Error("file does not exist on server")
    }

    try {
        let file = File.fromObject(JSON.parse(content))
        terminal.currFolder.content[args.file] = file
        await terminal.fileSystem.reload()
        terminal.printSuccess("pulled file from server")
    } catch (e) {
        console.error(e)
        throw new Error("pulled file is not a valid file")
    }
}, {
    description: "pull a file from the server",
    args: {
        "file": "file to pull"
    }
})
// ------------------- push.js --------------------
terminal.addCommand("push", async function(args) {
    if (!terminal.isValidFileName(args.file))
        throw new Error("invalid file name")
    let file = terminal.getFile(args.file)
    let content = JSON.stringify(file.toJSON())

    await terminal.modules.load("cliapi", terminal)
    let result = await terminal.modules.cliapi.pushFile(args.file, content)
    if (result.ok) {
        terminal.printSuccess("pushed file to server")
    } else {
        throw new Error(result.error)
    }
}, {
    description: "push a file to the server",
    args: {
        "file": "file to push"
    }
})
// ------------------- pv.js --------------------
terminal.addCommand("pv", async function(args) {
    await terminal.animatePrint(args.message)
}, {
    description: "print a message with a typing animation",
    args: ["*message"]
})


// ------------------- pwd.js --------------------
terminal.addCommand("pwd", function() {
    terminal.printLine("/" + terminal.fileSystem.pathStr)
}, {
    description: "print the current working directory"
})


// ------------------- python.js --------------------
terminal.addCommand("python", async function(args) {
    if (args.file)
        terminal.getFile(args.file)

    if (!terminal.modules.pyscript) {
        terminal.printLine("Initializing Python...")
        await terminal.modules.load("pyscript", terminal)
        await terminal.modules.pyscript.load()
        terminal.modules.pyscript.history = []
    }

    function escapeJsCodeToPythonCode(code) {
        return code
            .replaceAll("\"", "\\\"")
    }

    const runInterpreter = async () => {
        const pyodide = terminal.modules.pyscript.pyodide
        let version = pyodide.runPython("import sys; sys.version").split("[")
        terminal.printLine(`Python ${version[0]}`)

        let shiftPressed = false
        terminal.window.addEventListener("keydown", (e) => {
            if (e.key === "Shift") {
                shiftPressed = true
            }
        })
        terminal.window.addEventListener("keyup", (e) => {
            if (e.key === "Shift") {
                shiftPressed = false
            }
        })

        while (true) {
            try {
                let pythonPrompt = ""
                let result = null

                while (pythonPrompt === "" || shiftPressed) {
                    let promptStart = (pythonPrompt === "") ? ">>> " : "... "
                    pythonPrompt += await terminal.prompt(promptStart, {
                        addToHistory: item => terminal.modules.pyscript.history.push(item),
                        getHistory: () => terminal.modules.pyscript.history,
                        inputCleaning: false,
                        inputSuggestions: false
                    })
                }

                if (pythonPrompt.includes('"""')) {
                    terminal.printLine("SyntaxError: \"\"\" cannot be used in the interpreter. Try ''' instead.")
                    continue
                }

                if (pythonPrompt === "exit()" || pythonPrompt === "quit()" || pythonPrompt === "exit" || pythonPrompt === "quit")
                    break

                let injectedCode = escapeJsCodeToPythonCode(pythonPrompt)                

                let code = `
                try:
                    _ = eval("""${injectedCode}""")
                    if _ is not None:
                        print(repr(_))
                except Exception as e:
                    exec("""${injectedCode}""")
                    _ = None`

                console.log(code)

                pyodide.runPython(code)
            } catch (pythonError) {
                terminal.printLine(pythonError)
            }
        }
    }

    if (args.file) {
        let file = terminal.getFile(args.file)
        if (file instanceof Directory) {
            throw new Error("Cannot run a directory")
        }
        let code = file.content
        terminal.modules.pyscript.pyodide.runPython(code)
        return
    }

    
    if (args.code) {
        terminal.modules.pyscript.pyodide.runPython(`
        _ = eval("""${escapeJsCodeToPythonCode(args.code)}""")
        if _ is not None:
            print(repr(_))
        `)
        return
    }

    await runInterpreter()

}, {
    description: "run a script or open a python shell",
    args: {
        "?f=file:s": "the script to run",
        "?c=code:s": "the code to run"
    },
    disableEqualsArgNotation: true
})
// ------------------- qr.js --------------------
terminal.addCommand("qr", async function(args) {
    
    let api = "https://chart.apis.google.com/chart?chs=500x500&cht=qr&chld=L&chl="
    let url = api + encodeURIComponent(args.text)

    terminal.addLineBreak()
    terminal.printImg(url)
    terminal.addLineBreak()

}, {
    description: "generate a qr code",
    args: {
        "*text": "the text to encode"
    }
})
// ------------------- rate.js --------------------
terminal.addCommand("rate", function(args) {
    let languageEvaluations = {
        "py": "it's got everything: explicity, typing, great syntax, just speed is lacking",
        "python2": "who really uses python2 nowadays? just update to python3",
        "java": "not too fond of strict object oriented programming, but it's quite beginner friendly",
        "ruby": "let me introduce: a worse python",
        "html": "is this really supposed to be a programming language?",
        "css": "secretely a big fan but don't tell anyone",
        "js": "this one is just a mix of everything. it aged like milk",
        "javascript": "this one is just a mix of everything. it aged like milk",
        "jsx": "this one is just a mix of everything. it aged like milk",
        "php": "i hate myself for using this one",
        "lua": "i wish i could use lua more often - it's actually quite awesome",
        "go": "liked the 8 hour long tutorial but have yet to use it",
        "c": "i really want to hate it but its simplictiy and speed is just awesome",
        "c++": "use this instead of c when you want complexity",
        "c#": "java but better syntax - love it",
        "kotlin": "c# but not from microsoft lol",
        "swift": "what is this language? i don't know",
        "rust": "c but 2020 version. A person that doesn't love rust hasn't used rust",
        "hs": "functional programming requires so much brain power.\nyou automatically feel smarter when using it.\nLOVE IT!!",
    }
    
    languageEvaluations["python"] = languageEvaluations["py"]
    languageEvaluations["python3"] = languageEvaluations["py"]
    languageEvaluations["javascript"] = languageEvaluations["js"]
    languageEvaluations["jsx"] = languageEvaluations["js"]
    languageEvaluations["csharp"] = languageEvaluations["c#"]
    languageEvaluations["cpp"] = languageEvaluations["c++"]
    languageEvaluations["haskell"] = languageEvaluations["hs"]

    if (languageEvaluations[args.language]) {
        terminal.printLine(languageEvaluations[args.language])
    } else {
        terminal.printLine("i don't know that one")
    }
}, {
    description: "rate a programming language",
    args: ["language"]
})
// ------------------- raycasting.js --------------------
terminal.addCommand("raycasting", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.baseUrl + "../raycasting/",
        name: "Raycasting Demo",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "play with raycasting",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- reboot.js --------------------
terminal.addCommand("reboot", () => terminal.reload(), {
    description: "reboot the website"
})


// ------------------- reload.js --------------------
terminal.addCommand("reload", async function(args) {
    if (terminal.inTestMode)
        return
    const newLoadIndex = parseInt(loadIndex) + 1
    localStorage.setItem("loadIndex", newLoadIndex)
    terminal.reload()
}, {
    description: "Reloads the terminal",
})
// ------------------- rename.js --------------------
terminal.addCommand("rename", async function(args) {
    if (!terminal.isValidFileName(args.name))
        throw new Error("invalid file name")

    if (terminal.fileExists(args.name))
        throw new Error("file already exists in folder")

    let file = terminal.getFile(args.file)
    if (terminal.rootFolder.id == file.id)
        throw new Error("cannot rename root folder")
    let renamingCurrentFolder = file.id == terminal.currFolder.id
    delete file.parent.content[file.name]
    file.parent.content[args.name] = file
    terminal.log(`renamed ${file.path} to ${args.name}`)
    file.name = args.name

    if (renamingCurrentFolder) {
        terminal.fileSystem.currPath = file.pathArray
    }

    await terminal.fileSystem.reload()
}, {
    description: "rename a file or folder",
    args: {
        "file": "the file or folder to rename",
        "name": "the new name of the file or folder"
    }
})
// ------------------- reset.js --------------------
terminal.addCommand("reset", async function(args) {
    async function animatedDo(action) {
        return new Promise(async resolve => {
            terminal.print(action)
            for (let i = 0; i < 6; i++) {
                await terminal.sleep(200)
                terminal.print(".")
            }
            await terminal.sleep(500)
            terminal.printLine("done")
            resolve()
        })
    }
    if (!args.now)
        await terminal.acceptPrompt("this will fully reset the terminal (including all files). are you sure?", false)
    return new Promise(async () => {
        if (!args.now) {
            await animatedDo("resetting")
        }
        terminal.reset()
        terminal.reload()
    })
}, {
    description: "reset the terminal",
    args: {
        "?n=now:b": "reset now"
    }
})
// ------------------- reverse.js --------------------
terminal.addCommand("reverse", async function(args) {
    let reversed = args.message.split("").reverse().join("")
    terminal.printLine(reversed)
    if (args.c) {
        terminal.copy(reversed)
        terminal.printLine("Copied to Clipboard ✓", Color.COLOR_1)
    }
}, {
    description: "reverse a message",
    args: {
        "*message": "the message to reverse",
        "?c": "copy the reversed message to the clipboard"
    }
})


// ------------------- rm.js --------------------
terminal.addCommand("rm", async function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot remove directory. use 'rmdir' instead")
    delete file.parent.content[file.name]
    await terminal.fileSystem.reload()
}, {
    description: "remove a file",
    args: ["*file"]
})
// ------------------- rmdir.js --------------------
terminal.addCommand("rmdir", async function(args) {
    let directory = terminal.getFile(args.directory, FileType.FOLDER)
    if (Object.keys(directory.content).length > 0) {
        let msg = "the selected directory isn't empty. Continue?"
        await terminal.acceptPrompt(msg, false)
    }
    delete directory.parent.content[directory.name]
    await terminal.fileSystem.reload()
}, {
    description: "remove a directory",
    args: ["directory"]
})


// ------------------- rndm.js --------------------
terminal.addCommand("rndm", async function(args) {
    if (args.max - args.min <= 0)
        throw new Error("max value must be greater than min value")

    let randomNum = ""

    if (args.t && args.f) {
        throw new Error("cannot use both time and float options")
    }

    if (!args.f) {
        if (!Number.isInteger(args.min) || !Number.isInteger(args.max)) {
            throw new Error("min and max values must be integers in integer mode")
        }
    }

    if (args.t) {
        args.min = Math.floor(args.min)
        args.max = Math.floor(args.max + 1)

        let range = args.max - args.min
        randomNum = (Date.now() % range) + args.min
    } else if (args.f) {
        randomNum = Math.random() * (args.max - args.min) + args.min
    } else {
        args.min = Math.floor(args.min)
        args.max = Math.floor(args.max + 1)

        randomNum = Math.floor(Math.random() * (args.max - args.min) + args.min)
    }
    
    terminal.printLine(randomNum)
}, {
    description: "generate a random number based on the current time",
    args: {
        "?min:n:0~100000": "minimum value (inclusive)",
        "?max:n:0~100000": "maximum value (inclusive)",
        "?t=time:b": "use a time based random number generator",
        "?f=float:b": "generate a float instead of an integer",
    },
    standardVals: {
        min: 1,
        max: 100,
    }
})


// ------------------- sc.js --------------------
terminal.addCommand("sc", async function(args) {
    if (args.command && args.mode == "add") {
        let tokens = TerminalParser.tokenize(args.command)
        if (tokens.length == 0)
            throw new Error("Command cannot be empty")
        let [commandToken, argTokens] = TerminalParser.extractCommandAndArgs(tokens)
        if (!terminal.commandExists(commandToken))
            throw new Error(`Command '${commandToken}' does not exist`)
    }

    const modeFuncs = {
        add: async function() {
            if (!args.command)
                throw new Error("Must specify a command to add")
            let commands = terminal.data.startupCommands
            if (commands.includes(args.command))
                throw new Error(`Command '${args.command}' is already in the startup commands`)
            commands.push(args.command)
            terminal.data.startupCommands = commands
            terminal.printSuccess(`Added '${args.command}' to startup commands`)
        },
        remove: async function() {
            if (!args.command)
                throw new Error("Must specify a command to remove")
            let commands = terminal.data.startupCommands

            if (/^[0-9]+$/.test(args.command)) {
                let index = parseInt(args.command)
                if (index < 1 || index > commands.length) {
                    throw new Error("Invalid Index: command not found")
                }
                args.command = commands[index - 1]
            }

            if (!commands.includes(args.command))
                throw new Error(`Command '${args.command}' is not in the startup commands`)
            commands.splice(commands.indexOf(args.command), 1)
            terminal.data.startupCommands = commands
            terminal.printSuccess(`Removed '${args.command}' from startup commands`)
        },
        reset: async function() {
            terminal.data.resetProperty("startupCommands")
            terminal.printSuccess("Reset startup commands")
        },
        list: async function() {
            if (args.command)
                throw new Error("Cannot specify a command when listing")
            let commands = terminal.data.startupCommands
            if (commands.length == 0)
                terminal.printLine("No startup commands found")
            else {
                terminal.printLine("Startup Commands:")
                for (let i = 0; i < commands.length; i++) {
                    terminal.printLine(`(${i + 1}): ${commands[i]}`)
                }
            }

            terminal.printLine()
            terminal.print("To add a command, use ")
            terminal.printLine("sc add <command>", Color.COLOR_1)
            terminal.print("To remove a command, use ")
            terminal.printLine("sc remove <index>", Color.COLOR_1)
        }
    }

    if (args.mode in modeFuncs) {
        await modeFuncs[args.mode]()
    } else {
        terminal.printError(`Unknown mode '${args.mode}'`)
    }
}, {
    description: "manage the startup commands",
    args: {
        "?mode": "'add', 'remove', 'reset' or 'list'",
        "?command": "the command to add or remove (or index)"
    },
    defaultValues: {
        mode: "list"
    }
})
// ------------------- scarpet.js --------------------
terminal.addCommand("scarpet", async function(args) {
	await terminal.modules.import("game", window)

	function initDisplay() {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let widthPx = Math.floor(terminal.charWidth * args.size)
        let heightPx = widthPx
        canvas.width = widthPx
        canvas.height = heightPx
        canvas.style.width = widthPx + "px"
        canvas.style.height = heightPx + "px"
        terminal.parentNode.appendChild(canvas)
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        terminal.addLineBreak()
        return [context, canvas]
	}

	const [context2d, canvas] = initDisplay()

    const possibleGoals = [
        new Vector2d(0, 0),
        new Vector2d(0.5, 0),
        new Vector2d(1, 0),
        new Vector2d(1, 0.5),
        new Vector2d(1, 1),
        new Vector2d(0.5, 1),
        new Vector2d(0, 1),
        new Vector2d(0, 0.5)
    ]

    function drawDot(position) {
        context2d.fillStyle = "black"
        context2d.fillRect(
            position.x * canvas.width,
            position.y * canvas.height,
            1, 1
        )
    }

    let currPosition = Vector2d.fromFunc(Math.random)
    for (let i = 0; true; i++) {
        const randomGoal = possibleGoals[Math.floor(Math.random() * 8)]
        const delta = randomGoal.sub(currPosition)
        currPosition.iadd(delta.scale(2 / 3))

        drawDot(currPosition)

        if (i % args.speed == 0) {
            await sleep(0)
        }
    }

}, {
	description: "draws the Sierpinski carpet using the chaos game",
    args: {
        "?s=speed:i:1~99999": "the speed of dots placed. The higher the faster.",
        "?size:i:10~1000": "size of output canvas in characters",
    },
    defaultValues: {
        speed: 30,
        size: 50
    }
})
// ------------------- search.js --------------------
terminal.addCommand("search", async function(args) {
    terminal.href(args.b + encodeURIComponent(args.query))
}, {
    description: "search something via google.com",
    args: {
        "*query": "the search query",
        "?b=baseUrl": "the base search-engine url"
    },
    standardVals: {
        b: "https://www.google.com/search?q="
    }
})


// ------------------- set.js --------------------
terminal.addCommand("set", async function(args) {
    await terminal.modules.load("cliapi", terminal)
    const CliApi = terminal.modules.cliapi
    if (!CliApi.KEY_REGEX.test(args.key)) {
        terminal.printError("Invalid key")
        return
    }
    if (args.value.length > 255) {
        terminal.printError("Value too big in size")
        return
    }
    await CliApi.set(args.key, args.value)
    terminal.printLine("Success", Color.LIGHT_GREEN)
}, {
    description: "set a value on the server",
    args: {
        key: "the key to set the value of",
        value: "the value to set"
    },
    disableEqualsArgNotation: true
})


// ------------------- sha256.js --------------------
terminal.addCommand("sha256", async function(args) {
    if (!window.crypto || !window.crypto.subtle)
        throw new Error("crypto API not supported")

    if (!args.s && !args.f) {
        terminal.printError("must specify either -s or -f")
        terminal.print("Use ")
        terminal.printCommand("man sha256")
        terminal.printLine(" for more information")
        throw new IntendedError()
    }

    if (args.s && args.f)
        throw new Error("cannot specify both -s and -f")

    let text = ""
    if (args.s) {
        text = args.s
    } else if (args.f) {
        let file = terminal.getFile(args.f, FileType.READABLE)
        text = file.content
    }

    let hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    let hashArray = Array.from(new Uint8Array(hash))
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    terminal.printLine(hashHex)
}, {
    description: "calculate the SHA-256 hash of a message",
    args: {
        "?s": "a string to hash",
        "?f": "a file to hash"
    },
    standardVals: {
        s: null,
        f: null
    }
})


// ------------------- shoot.js --------------------
terminal.addCommand("shoot", async function(args) {
	const world1 = `
+--------------------------------------------------------------------+
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                  +----------+             +------------+           |
|                                                                    |
|                                                                    |
|                                                                    |
|                                                                    |
|         +-------------------+             +            +-----------|
|                                           |                        |
|                                           |                        |
|                                           |                        |
|                                           |                        |
+--------------------------------------------------------------------+`

    await terminal.modules.import("game", window)
		
	let fieldSize = null
	
	const N = " "
	const P1 = "A"
	const P2 = "Y"

	const isWall = textContent => [
		"|", "+", "-"
	].includes(textContent)
	
	let field = []
	
	let gravity = new Vector2d(0, 0.03)
	let jumpVel = new Vector2d(0, -0.5)
	
	const TOTAL_JUMPS = 1

	terminal.printLine("            CONTROLS                              OBJECTIVE          ")
	terminal.printLine("+------------------------------+      +------------------------------+")
	terminal.printLine("| Player | Action | Key        |      | Shoot the other player       |")
	terminal.printLine("|--------+--------+------------|      | without getting shot first.  |")
	terminal.printLine("| A      | Move   | A/D        |      | Escape the Bullet Hell by    |")
	terminal.printLine("| A      | Jump   | W 	       |      | using the environment to     |")
	terminal.printLine("| A      | Shoot  | Space      |      | jump around (there is also   |")
	terminal.printLine("| Y      | Move   | Left/Right |      | a double jump!).             |")
	terminal.printLine("| Y      | Jump   | Up 	       |      |                              |")
	terminal.printLine("| Y      | Shoot  | Enter      |      |           HAVE FUN!          |")
	terminal.printLine("+------------------------------+      +------------------------------+")
	terminal.printLine("")
	
	let lineBreaks = []
	function printField(world=world1) {
		let worldData = world.split("\n").map(row => row.split(""))
		worldData.shift()

		fieldSize = new Vector2d(worldData[0].length, worldData.length)

		for (let i = 0; i < fieldSize.y; i++) {
			let row = []
			for (let j = 0; j < fieldSize.x; j++) {
				let data = worldData[i][j]
				let fill = data
				
				let element = terminal.print(fill, undefined, {forceElement: true})
				row.push(element)
			}
			lineBreaks.push(terminal.printLine("", undefined, {forceElement: true}))
			field.push(row)
		}
	}

	function removeField() {
		for (let row of field) {
			for (let element of row) {
				element.remove()
			}
		}
		for (let lineBreak of lineBreaks) {
			lineBreak.remove()
		}
		field = []
	}
	
	printField()
	
	let projectiles = []
	let keysDown = {}
	
	class Player {

		printLivesDisplay() {
			terminal.print(`player#${this.name} lives: `)
			this.liveOutput = terminal.print(this.lives, undefined, {forceElement: true})
			terminal.printLine()
		}

		updateLiveDisplay() {
			if (this.liveOutput)
				this.liveOutput.textContent = this.lives
		}

		constructor(name, pos, char) {
			this.name = name
			this.pos = pos
			this.char = char
			this.vel = new Vector2d(0, 0)
			this.prevPos = null
			this.shootCooldown = 0
			
			this.inputVel = new Vector2d(0, 0)
			this.inputJump = false
			this.inputShoot = false
			
			this.goingLeft = false
			
			this.jumpsLeft = 0
			this.speed = 0.5

			this.lives = args.l

			this.dead = false

			this.printLivesDisplay()
		}

		hurt(projectile) {
			if (projectile.deleteReady) return
			if (this.dead) return
			if (!gameRunning) return

			this.lives--
			this.updateLiveDisplay()
			projectile.deleteReady = true

			if (this.lives == 0) {
				this.dead = true
				gameRunning = false
				terminal.printLine(`GAME OVER! ${this.name} has been shot and no lives left!`)
			}
		}
		
		projectileDirection({projectileSpeed=1}={}) {
			if (!this.goingLeft) return new Vector2d(projectileSpeed, 0)
			else return new Vector2d(-projectileSpeed, 0)
		}
		
		projectileChar() {
			if (this.char == P1) return "."
			if (this.char == P2) return ","
		}

		get canShoot() {
			return this.shootCooldown <= 0
		}
		
		shoot() {
			if (!this.canShoot) return

			let projectile = new Projectile(this.pos.copy(), this.projectileDirection(), this.projectileChar())
			projectile.update()
			projectile.update()
			projectiles.push(projectile)

			this.shootCooldown = args.s
		}
		
		draw() {
			if (this.prevPos) {
				let prevX = Math.floor(this.prevPos.x)
				let prevY = Math.floor(this.prevPos.y)
				let prevElement = field[prevY][prevX]
				prevElement.textContent = N
			}
			
			let xPos = Math.floor(this.pos.x)
			let yPos = Math.floor(this.pos.y)
			let element = field[yPos][xPos]
			if (!element) {
				throw new Error(`Player ${this.name} out of bounds`)
			}
			
			element.textContent = this.char
		}
		
		getElement(dir) {
			let xPos = Math.floor(this.pos.x)
			let yPos = Math.floor(this.pos.y)
			try {
				return field[yPos + dir.y][xPos + dir.x]
			} catch {
				return null
			}
		}
		
		update() {
			this.prevPos = this.pos.copy()
			this.shootCooldown--
			
			let underElement = this.getElement(new Vector2d(0, 1))
			let isOnGround = underElement.textContent == "-" || underElement.textContent == "+"
			
			if (!isOnGround) {
				this.vel.x += gravity.x
				this.vel.y += gravity.y
			}
			
			this.pos.x += this.inputVel.x * this.speed
			this.pos.y += this.inputVel.y * this.speed
			
			if (this.inputJump) {
				if (isOnGround) {
					this.jumpsLeft = TOTAL_JUMPS
					this.vel.y = jumpVel.y
					this.pos.y -= 1
				} else if (this.jumpsLeft > 0) {
					this.jumpsLeft--
					this.vel.y = jumpVel.y
				}
				this.inputJump = false
			}
			
			if (this.inputVel.x < 0) {
				this.goingLeft = true
			} else if (this.inputVel.x > 0) {
				this.goingLeft = false
			}
			
			if (this.inputShoot) {
				this.shoot()
				this.inputShoot = false
			}
			
			this.pos.x += this.vel.x
			this.pos.y += this.vel.y

			let newElement = this.getElement(new Vector2d(0, 0))
			if (!newElement || (newElement.textContent != N && newElement.textContent != this.char)) {
				this.pos.y = this.prevPos.y
				this.pos.x = this.prevPos.x
				this.vel.y = 0
			}
		}
		
	}
	
	let player1 = new Player("A", new Vector2d(2, 2), P1)
	let player2 = new Player("Y", new Vector2d(fieldSize.x - 3, 2), P2)

	class Projectile {
	
		constructor(pos, vel, char) {
			this.pos = pos
			this.vel = vel
			this.prevPos = null
			this.char = char
			
			this.deleteReady = false
		}
		
		draw() {
			if (this.prevPos) {
				let prevX = Math.floor(this.prevPos.x)
				let prevY = Math.floor(this.prevPos.y)
				let prevElement = field[prevY][prevX]
				prevElement.textContent = N
			}

			let element = this.getCurrElement()
			
			if (this.deleteReady && element) {
				element.textContent = N
			} else if (element) {
				element.textContent = this.char
			}
		}

		getCurrElement() {
			let xPos = Math.floor(this.pos.x)
			let yPos = Math.floor(this.pos.y)
			try {
				return field[yPos][xPos]
			} catch (e) {
				return null
			}
		}
		
		update() {
			this.prevPos = this.pos.copy()
			this.pos.x += this.vel.x
			this.pos.y += this.vel.y
			let element = this.getCurrElement()
			if (!element || isWall(element.textContent)) {
				this.deleteReady = true
				this.pos = this.prevPos
				return null
			}

			if (element.textContent == player1.char) {
				return player1
			} else if (element.textContent == player2.char) {
				return player2
			}

			return null
		}
		
	}

	function updatePlayerInputs() {
		if (keysDown["p1-up"]) {
			player1.inputJump = true
			keysDown["p1-up"] = false
		}

		if (keysDown["p2-up"]) {
			player2.inputJump = true
			keysDown["p2-up"] = false
		}

		if (keysDown["p1-left"]) player1.inputVel.x = -1
		else if (keysDown["p1-right"]) player1.inputVel.x = 1
		else player1.inputVel.x = 0

		if (keysDown["p2-left"]) player2.inputVel.x = -1
		else if (keysDown["p2-right"]) player2.inputVel.x = 1
		else player2.inputVel.x = 0

		if (keysDown["p1-shoot"]) {
			player1.inputShoot = true
			keysDown["p1-shoot"] = false
		}

		if (keysDown["p2-shoot"]) {
			player2.inputShoot = true
			keysDown["p2-shoot"] = false
		}
	}
	
	let gameRunning = true

	function keyToCode(key) {
		switch (key) {
			case "w": return "p1-up"
			case "a": return "p1-left"
			case "s": return "p1-down"
			case "d": return "p1-right"
			case " ": return "p1-shoot"
			case "shoot1": return "p1-shoot"
			case "arrowup": return "p2-up"
			case "arrowleft": return "p2-left"
			case "arrowdown": return "p2-down"
			case "arrowright": return "p2-right"
			case "enter": return "p2-shoot"
			case "shoot2": return "p2-shoot"
		}
	}
	
	addEventListener("keydown", event => {
		if (gameRunning && event.repeat) event.preventDefault()
		if (event.repeat || !gameRunning) return
		let key = event.key.toLowerCase()
		let code = keyToCode(key)
		if (code) {
			keysDown[code] = true
			event.preventDefault()
		}
	})
	
	addEventListener("keyup", event => {
		if (gameRunning && event.repeat) event.preventDefault()
		if (event.repeat || !gameRunning) return
		let key = event.key.toLowerCase()
		let code = keyToCode(key)
		if (code) {
			keysDown[code] = false
			event.preventDefault()
		}
	})

	if (terminal.mobileKeyboard) {
		terminal.mobileKeyboard.updateLayout([
			[null, "W", null, null, "↑", null],
			["A", "S", "D", "←", "↓", "→"],
			["shoot1", "shoot2"],
			["STRG+C"]
		])

		terminal.mobileKeyboard.onkeydown = (e, keyCode) => {
			let code = keyToCode(keyCode.toLowerCase())
			if (code) {
				keysDown[code] = true
			}
		}

		terminal.mobileKeyboard.onkeyup = (e, keyCode) => {
			let code = keyToCode(keyCode.toLowerCase())
			if (code) {
				keysDown[code] = false
			}
		}
	}
	
	const gameUpdate = () => {
		if (!gameRunning) return
		
		projectiles = projectiles.filter(p => !p.deleteReady)
		
		for (let p of projectiles) {
			let hitPlayer = p.update()
			p.draw()

			if (hitPlayer) {
				hitPlayer.hurt(p)
			}
		}
		
		updatePlayerInputs()

		player1.update()
		player1.draw()
		
		player2.update()
		player2.draw()
	}

	let intervalFunc = setInterval(gameUpdate, 1000 / 60)

	terminal.scroll()

	terminal.onInterrupt(() => {
		gameRunning = false
		clearInterval(intervalFunc)
		removeField()
	})
	
	while (gameRunning) {
		await sleep(100)
	}

	removeField()
	clearInterval(intervalFunc)

	// wait for players to realize the game is over
	await sleep(2000)
	
}, {
	description: "Play a game of Shoot against another player locally",
	isGame: true,
	args: {
		"?l=lives:i:1~100": "The number of lives each player has",
		"?s=shoot-delay:i:0~1000": "The number of frames between each shot"
	},
	defaultValues: {
		l: 3,
		s: 20
	}
})

// ------------------- shutdown.js --------------------
terminal.addCommand("shutdown", async function() {
    terminal.print("Shutting down")
    for (let i = 0; i < 10; i++) {
        terminal.print(".")
        await sleep(300)
    }
    terminal.printLine()
    await terminal.animatePrint("Initiating Shutdown Process......")
    for (let i = 10; i > 0; i--) {
        terminal.print(i, Color.COLOR_1)
        terminal.printLine(" Seconds left")
        await sleep(1000)
    }
    await sleep(1000)
    await terminal.animatePrint("...?")
    await sleep(1000)
    await terminal.animatePrint("Why didn't anything happen?")
    await sleep(1000)
    await terminal.animatePrint("I guess this is just a website.")
    await sleep(1000)
    await terminal.animatePrint("Let's just not shutdown. Have a good day!")
}, {
    description: "shutdown the terminal"
})


// ------------------- sl.js --------------------
terminal.addCommand("sl", async function(args) {
    let FRAME = "", FRAMES = []
    FRAME  = "     ooOOOO\n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()-()() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "     oo OO OO\n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()-()()() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "     oo O O O O\n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()-()() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "      o o o  OO O O\n"
    FRAME += "    o       _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()()-() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "     ooOOOO  o  O \n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()-()() o   oo  oo"
    FRAMES.push(FRAME)
    
    await terminal.modules.load("window", terminal)

    const terminalWindow = terminal.modules.window.make({name: "Steam Locomotive", fullscreen: true})
    const CANVAS = terminalWindow.CANVAS
    const CONTEXT = terminalWindow.CONTEXT

    function drawText(x, y, text, color="#348d36") {
        CONTEXT.fillStyle = "black"
        CONTEXT.clearRect(x - 1, y - 1, CHARWIDTH + 1, 22)
        CONTEXT.fillStyle = color
        CONTEXT.fillText(text, x, y)
    }

    function CHARWIDTH() {
        return CONTEXT.measureText("A").width * 1.8
    }

    function drawTrain(x, frameIndex, y) {
        let frame = FRAMES[frameIndex]
        let currY = y ?? CANVAS.height / 2 - 50
        for (let line of frame.split("\n")) {
            drawText(x, currY, line, Color.WHITE)
            currY += 20
        }
    }

    function generateFlightPath({
        numWaves=10,
        numTries=10000,
    }={}) {
        const arr = f => Array.from({length: numWaves}, f)
        const makeRandomPath = () => {
            // f(x) = a * sin(b * x + c) + d
            let a = arr(() => Math.random() * 1)
            let b = arr(() => Math.random() * 5 + Math.PI * 2)
            let c = arr(() => Math.random() * Math.PI * 2)
            let d = arr(() => (Math.random() - 0.5) * 2 * 2)
            return x => {
                let sum = 0
                for (let i = 0; i < numWaves; i++)
                    sum += a[i] * Math.sin(b[i] * x + c[i]) + d[i]
                return sum
            }
        }

        const checkRandomPath = f => {
            let highestMidOffset = 0
            for (let x = 0; x < 1; x += 0.01) {
                let y = f(x)
                if (y > 1 || y < 0)
                    return false
                let midOffset = Math.abs(y - 0.5)
                highestMidOffset = Math.max(highestMidOffset, midOffset)
            }
            return highestMidOffset > 0.2
        }

        for (let i = 0; i < numTries; i++) {
            let f = makeRandomPath()
            if (checkRandomPath(f))
                return f
        }

        return null
    }

    let running = true

    const msPerFrame = 40
    const trainTime = Math.random() * 10000 + 10000
    const startTime = Date.now()
    let flightPath = null
    if (args.f) {
        flightPath = generateFlightPath()
        if (flightPath == null) {
            terminal.printEasterEgg("Navigator-Egg")
            throw new Error("Flight Navigation not found.")
        }
    } 
    function draw() {
        let frameIndex = Math.floor((Date.now() / msPerFrame) % FRAMES.length)
        CONTEXT.fillStyle = "#000000"
        CONTEXT.globalAlpha = 0.2
        CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height)
        CONTEXT.globalAlpha = 1 
        const deltaTime = (Date.now() - startTime) / trainTime
        const x = CANVAS.width - deltaTime * CANVAS.width
        
        if (args.f) {
            const y = flightPath(deltaTime) * CANVAS.height - 50
            drawTrain(x, frameIndex, y)
        } else {
            drawTrain(x, frameIndex)
        }

        if (x < -300) running = false

        if (running)
            terminal.window.requestAnimationFrame(draw)
    }

    draw()

    while (running) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    terminalWindow.close()
}, {
    description: "Steam Locomotive",
    args: {
        "?f=F:b": "Make it fly"
    }
})
// ------------------- sleep.js --------------------
terminal.addCommand("sleep", async function(args) {
    await sleep(args.seconds * 1000)
}, {
    description: "sleep for a number of seconds",
    args: ["seconds:n:0~1000000"]
})

// ------------------- slime.js --------------------
terminal.addCommand("slime", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../slime/",
        name: "Slime Simulation"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "Start a slime simulation"
})
// ------------------- snake.js --------------------
terminal.addCommand("snake", async function(args) {
    await terminal.modules.import("game", window)

    const width = 30
    const height = 20
    const speed = 150 / args.s
    const startLength = 10

    const EMPTY = 0
    const SNAKE = 1
    const FOOD = 2
    const WALLY = 3
    const WALLX = 4
    const WALLC1 = 5
    const WALLC2 = 6
    let snake = [[width / 2, height / 2]]
    let direction = [1, 0]
    let snakeAlive = true

    let cells = null
    let foodPos = null
    function updateCells() {
        cells = Array.from({length: height}, () => Array.from({length: width}, () => EMPTY))
        for (let i = 0; i < width; i++) {
            cells[0][i] = WALLX
            cells[height - 1][i] = WALLX
        }
        for (let i = 0; i < height; i++) {
            cells[i][0] = WALLY
            cells[i][width - 1] = WALLY
        }
        cells[0][0] = WALLC1
        cells[0][width - 1] = WALLC2
        cells[height - 1][0] = WALLC1
        cells[height - 1][width - 1] = WALLC2
        for (let [x, y] of snake) {
            cells[y][x] = SNAKE
        }
        if (foodPos != null)
            cells[foodPos[1]][foodPos[0]] = FOOD
        return cells
    }
    updateCells()

    function makeNewFood() {
        let x = Math.floor(Math.random() * width)
        let y = Math.floor(Math.random() * height)
        if (cells[y][x] == EMPTY) {
            return [x, y]
        } else {
            return makeNewFood()
        }
    }
    foodPos = makeNewFood()

    function enlargenSnake() {
        snake.push([...snake[snake.length - 1]])
        foodPos = makeNewFood()
    }

    for (let i = 0; i < startLength; i++) {
        enlargenSnake()
    }

    function updateSnake() {
        if (moves.length > 0) {
            let newDirection = moves.shift()
            if (newDirection[0] != -direction[0] || newDirection[1] != -direction[1]) {
                direction = newDirection
            }
        }
        let newHead = [snake[0][0] + direction[0], snake[0][1] + direction[1]]
        for (let i = snake.length - 1; i >= 0; i--) {
            if (i == 0) {
                snake[i] = newHead
            } else {
                snake[i] = [...snake[i - 1]]
            }
            if (snake[i][0] >= width - 1) snake[i][0] = 1
            if (snake[i][0] <= 0) snake[i][0] = width - 2
            if (snake[i][1] >= height - 1) snake[i][1] = 1
            if (snake[i][1] <= 0) snake[i][1] = height - 2
            if (snake[i][0] == foodPos[0] && snake[i][1] == foodPos[1]) {
                enlargenSnake()
            }
        }
        for (let i = 1; i < snake.length; i++) {
            if (snake[i][0] == snake[0][0] && snake[i][1] == snake[0][1]) {
                snakeAlive = false
            }
        }
    }

    function printCells() {
        let elements = []
        for (let y = 0; y < height; y++) {
            let line = []
            for (let x = 0; x < width; x++) {
                line.push(terminal.print(" ", undefined, {forceElement: true}))
            }
            elements.push(line)
            terminal.addLineBreak()
        }
        return elements
    }

    let elements = printCells()

    let moves = []

    function draw() {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let cell = cells[y][x]
                if (cell == EMPTY) {
                    elements[y][x].innerText = ". "
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == SNAKE) {
                    elements[y][x].innerText = "# "
                    elements[y][x].style.color = "var(--accent-color-1)"
                } else if (cell == FOOD) {
                    elements[y][x].innerText = "# "
                    elements[y][x].style.color = "var(--accent-color-2)"
                } else if (cell == WALLY) {
                    elements[y][x].innerText = "| "
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == WALLX) {
                    elements[y][x].innerText = "--"
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == WALLC1) {
                    elements[y][x].innerText = "+-"
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == WALLC2) {
                    elements[y][x].innerText = "+ "
                    elements[y][x].style.color = "var(--foreground)"
                }
            }
        }
    }

    function turnSnakeRed() {
        for (let i = 0; i < snake.length; i++) {
            elements[snake[i][1]][snake[i][0]].style.color = "var(--error-color)"
        }
    }

    terminal.printLine("Use the arrow keys to move the snake.")
    terminal.scroll()

    function onkeydown(keycode) {
        if (keycode == "ArrowUp") {
            moves.push([0, -1])
            return true
        } else if (keycode == "ArrowDown") {
            moves.push([0, 1])
            return true
        } else if (keycode == "ArrowLeft") {
            moves.push([-1, 0])
            return true
        } else if (keycode == "ArrowRight") {
            moves.push([1, 0])
            return true
        }
    }

    let listener = addEventListener("keydown", function(event) {
        if (event.repeat) return
        if (snakeAlive == false) return
        if (onkeydown(event.key)) {
            event.preventDefault()
        }
    })

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout(
            terminal.mobileKeyboard.Layout.ARROWS
        )

        terminal.mobileKeyboard.onkeydown = function(e, keycode) {
            if (snakeAlive == false) return
            onkeydown(keycode)
        }
    }

    while (snakeAlive) {
        updateCells()
        updateSnake()
        draw()
        await sleep(speed)
    }

    updateCells()
    draw()
	let score = snake.length - startLength
    terminal.printLine(`You lost! Your score was ${score}.`)
    turnSnakeRed()

    removeEventListener("keydown", listener)

    await HighscoreApi.registerProcess("snake")
    await HighscoreApi.uploadScore(score)

}, {
    description: "play a game of snake",
    args: {"?s:n:1~10": "speed level of snake moving"},
    standardVals: {
        s: 2
    },
    isGame: true
})
// ------------------- sodoku.js --------------------
terminal.addCommand("sodoku", async function(args) {

    const MODES = ["play", "solve"]

    if (args.mode !== undefined && !MODES.includes(args.mode)) {
        terminal.printLine(`Unknown mode: "${args.mode}"`)
        args.mode = undefined
    }

    if (!args.mode) {
        terminal.printLine("Please select a mode:")
        for (let mode of MODES) {
            terminal.print("- ")
            terminal.printCommand(`${mode} a sodoku`, `sodoku ${mode}`)
        }
        return
    }

    class SodokuBoard {

        _makeBlockData(fill=undefined) {
            let data = []
            for (let i = 0; i < this.blockSize; i++) {
                let row = []
                for (let j = 0; j < this.blockSize; j++) {
                    row.push(fill)
                }
                data.push(row)
            }
            return data
        }

        constructor(blockSize, boardBlockSize) {
            this.blockSize = blockSize
            this.boardBlockSize = boardBlockSize
            this.blockRows = []
            for (let i = 0; i < this.boardBlockSize; i++) {
                let row = []
                for (let j = 0; j < this.boardBlockSize; j++) {
                    row.push(this._makeBlockData())
                }
                this.blockRows.push(row)
            }
            this.highlightedIndex = null
            this.hasCheated = false
        }

        getBlock(x, y) {
            return this.blockRows[y][x]
        }

        getNumber(x, y) {
            let blockX = Math.floor(x / this.blockSize)
            let blockY = Math.floor(y / this.blockSize)
            let block = this.getBlock(blockX, blockY)
            let localX = x % this.blockSize
            let localY = y % this.blockSize
            return block[localY][localX]
        }

        setNumber(x, y, number) {
            let blockX = Math.floor(x / this.blockSize)
            let blockY = Math.floor(y / this.blockSize)
            let block = this.getBlock(blockX, blockY)
            let localX = x % this.blockSize
            let localY = y % this.blockSize
            block[localY][localX] = number
        }

        getRows() {
            let rows = []
            for (let i = 0; i < this.blockSize * this.boardBlockSize; i++) {
                let row = []
                for (let j = 0; j < this.blockSize * this.boardBlockSize; j++) {
                    row.push(this.getNumber(j, i))
                }
                rows.push(row)
            }
            return rows
        }

        getColumns() {
            let columns = []
            for (let i = 0; i < this.blockSize * this.boardBlockSize; i++) {
                let column = []
                for (let j = 0; j < this.blockSize * this.boardBlockSize; j++) {
                    column.push(this.getNumber(i, j))
                }
                columns.push(column)
            }
            return columns
        }

        getBlocks() {
            let blocks = []
            for (let i = 0; i < this.boardBlockSize; i++) {
                for (let j = 0; j < this.boardBlockSize; j++) {
                    let block = this.getBlock(j, i)
                    blocks.push(block)
                }
            }
            return blocks
        }

        toString() {
            let outputString = ""
            let lineString = "+"
            for (let i = 0; i < this.boardBlockSize; i++) {
                lineString += "-".repeat(this.blockSize * 4 - 1) + "+"
                if (i != this.boardBlockSize - 1) {
                    lineString += "+"
                }
            }
            let thickLineString = lineString.replaceAll("-", "=")
            let rows = this.getRows()
            for (let i = 0; i < rows.length; i++) {
                if (i != 0 && i % this.blockSize === 0) {
                    outputString += thickLineString + "\n|"
                } else {
                    outputString += lineString + "\n|"
                }
                if (i * rows.length == this.highlightedIndex) {
                    outputString += "<"
                } else {
                    outputString += " "
                }
                let row = rows[i]
                for (let j = 0; j < row.length; j++) {
                    let number = row[j]
                    let index = i * row.length + j
                    let nextIsHighlighted = index + 1 == this.highlightedIndex
                    let isHighlightedIndex = index == this.highlightedIndex
                    if (number === undefined) {
                        outputString += " "
                    } else {
                        outputString += number
                    }
                    if (isHighlightedIndex) {
                        outputString += ">"
                    } else {
                        outputString += " "
                    }
                    if (j % this.blockSize === this.blockSize - 1 && j != row.length - 1) {
                        outputString += "||" 
                    } else {
                        outputString += "|"
                    }
                    if (nextIsHighlighted && j != row.length - 1) {
                        outputString += "<"
                    } else {
                        outputString += " "
                    }
                }
                outputString += "\n"
            }
            outputString += lineString + "\n"
            return outputString
        }

        xyFromIndex(index) {
            let x = index % (this.blockSize * this.boardBlockSize)
            let y = Math.floor(index / (this.blockSize * this.boardBlockSize))
            return [x, y]
        }

        indexFromXY(x, y) {
            return y * (this.blockSize * this.boardBlockSize) + x
        }

        get maxIndex() {
            return (this.blockSize * this.boardBlockSize) ** 2
        }

        printToElement() {
            return terminal.printLine(this.toString(), undefined, {forceElement: true})
        }

        getLockedMap() {
            let lockedMap = []
            for (let i = 0; i < this.blockSize * this.boardBlockSize; i++) {
                let row = []
                for (let j = 0; j < this.blockSize * this.boardBlockSize; j++) {
                    row.push(this.getNumber(j, i) !== undefined)
                }
                lockedMap.push(row)
            }
            return lockedMap
        }

        async playFromInput() {
            await sleep(100)

            let currX = 0
            let currY = 0
            let gameRunning = true

            let lockedMap = this.getLockedMap()

            terminal.onInterrupt(() => {
                gameRunning = false
            })

            const onkeydown = (key, event) => {
                if (!gameRunning) {
                    return
                }

                let prevFen = this.toFEN()

                if (key == "Backspace") {
                    if (lockedMap[currY][currX]) {
                        return
                    }
                    this.setNumber(currX, currY, undefined)
                    this.highlightedIndex = this.indexFromXY(currX, currY)
                    event.preventDefault()
                    return
                } else if (key == "s") {
                    this.hasCheated = true
                    this.solveLive(element).then(() => {
                        gameRunning = false
                    })
                } else if (/^[1-9]$/.test(key)) {
                    if (lockedMap[currY][currX]) {
                        return
                    }
                    this.setNumber(currX, currY, parseInt(key))
                    event.preventDefault()
                } else if (key.startsWith("Arrow")) {
                    if (key == "ArrowUp") {
                        currY--
                        if (currY < 0) currY = 0
                    }
                    if (key == "ArrowDown") {
                        currY++
                        if (currY >= this.size) currY = this.size - 1
                    }
                    if (key == "ArrowLeft") {
                        currX--
                        if (currX < 0) currX = 0
                    }
                    if (key == "ArrowRight") {
                        currX++
                        if (currX >= this.size) currX = this.size - 1
                    }
                    event.preventDefault()
                }

                if (this.includesConflict()) {
                    this.loadFEN(prevFen)
                } else {
                    if (this.getAmountLeft() == this.size ** 2) {
                        gameRunning = false
                    }
                }

                this.highlightedIndex = this.indexFromXY(currX, currY)
            }

            let listener = terminal.window.addEventListener("keydown", async event => {
                if (!gameRunning) {
                    terminal.window.removeEventListener("keydown", listener)
                }
                
                onkeydown(event.key, event)
            })

            if (terminal.mobileKeyboard) {
                terminal.mobileKeyboard.updateLayout([
                    ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
                    [null, "↑", null],
                    ["←", "↓", "→"],
                    ["Backspace"],
                    ["STRG+C"]
                ])
        
                terminal.mobileKeyboard.onkeydown = function(e, keycode) {
                    onkeydown(keycode, e)
                }
            }

            let element = this.printToElement()
            terminal.addLineBreak()
            terminal.printLine("- Use the Arrow Keys to move around")
            terminal.printLine("- Press a number to set it")
            terminal.printLine("- Press Backspace to remove a number")

            terminal.scroll()
            this.highlightedIndex = this.indexFromXY(currX, currY)

            while (gameRunning) {
                element.textContent = this.toString()
                await sleep(50)
            }

            terminal.printSuccess("You made it!")

            this.highlightedIndex = null
            element.textContent = this.toString()

            terminal.window.removeEventListener("keydown", listener)

            return element
        }

        async fillFromInput() {
            await sleep(100)

            let currIndex = 0

            terminal.onInterrupt(() => {
                currIndex = this.maxIndex
            })

            const onkeydown = (key, event) => {
                if (currIndex >= this.maxIndex) {
                    return
                }
                
                let [x, y] = this.xyFromIndex(currIndex)

                if (key == "Backspace") {
                    if (currIndex > 0)
                        currIndex--
                    [x, y] = this.xyFromIndex(currIndex)
                    this.setNumber(x, y, undefined)
                    this.highlightedIndex = currIndex
                    event.preventDefault()
                    return
                } else if (/^[1-9]$/.test(key)) {
                    this.setNumber(x, y, parseInt(key))
                    event.preventDefault()
                } else if (key == "Enter" || key == " ") {
                    currIndex++
                    this.highlightedIndex = currIndex
                    event.preventDefault()
                    return
                } else {
                    return
                }

                currIndex++
                this.highlightedIndex = currIndex
            }

            let listener = terminal.window.addEventListener("keydown", async event => {
                if (currIndex >= this.maxIndex) {
                    terminal.window.removeEventListener("keydown", listener)
                }
                
                onkeydown(event.key, event)
            })

            if (terminal.mobileKeyboard) {
                terminal.mobileKeyboard.updateLayout([
                    ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
                    ["Enter", "Backspace"],
                    ["STRG+C"]
                ])
        
                terminal.mobileKeyboard.onkeydown = function(e, keycode) {
                    onkeydown(keycode, e)
                }
            }

            let element = this.printToElement()
            terminal.addLineBreak()
            terminal.printLine("- Press a number to set it")
            terminal.printLine("- Press Backspace to remove a number")
            terminal.printLine("- Press Enter to go to the next field")
            terminal.scroll()
            this.highlightedIndex = currIndex

            while (currIndex < this.maxIndex) {
                element.textContent = this.toString()
                await sleep(50)
            }

            this.highlightedIndex = null
            element.textContent = this.toString()

            terminal.window.removeEventListener("keydown", listener)

            return element
        }

        loadFEN(fenString) {
            // example: 123456789/123456789/123456789|123456789/123456789/123456789|123456789/123456789/123456789
            let rows = fenString.split("|")
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i]
                let numbers = row.split("/")
                for (let j = 0; j < numbers.length; j++) {
                    let blockNumbers = numbers[j].split("")
                    for (let k = 0; k < blockNumbers.length; k++) {
                        let block = this.getBlock(j, i)
                        let value = blockNumbers[k] == "_" ? undefined : parseInt(blockNumbers[k])
                        if (value !== undefined && (isNaN(value) || value < 1 || value > 9))
                            throw new Error("Invalid FEN string")
                        block[Math.floor(k / this.blockSize)][k % this.blockSize] = value
                    }
                }
            }
        }

        get size() {
            return this.blockSize * this.boardBlockSize
        }

        getBlockData(x, y) {
            let i = Math.floor(x / 3)
            let j = Math.floor(y / 3)
            return this.getBlock(i, j).flat()
        }

        toFEN() {
            let fenString = ""
            let blocks = this.getBlocks()
            for (let i = 0; i < blocks.length; i++) {
                let blockData = blocks[i].flat()
                let blockString = blockData.map(x => x == undefined ? "_" : x).join("")
                fenString += blockString
                if (i % this.boardBlockSize == this.boardBlockSize - 1 && i != blocks.length - 1) {
                    fenString += "|"
                } else if (i != blocks.length - 1) {
                    fenString += "/"
                }
            }
            return fenString
        }

        copy() {
            let newBoard = new Board(this.blockSize, this.boardBlockSize)
            newBoard.loadFEN(this.toFEN())
            return newBoard
        }

        includesConflict() {
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    let prevNum = this.getNumber(x, y)
                    if (prevNum == undefined) continue
                    this.setNumber(x, y, undefined)

                    let row = this.getRows()[y]
                    let column = this.getColumns()[x]
                    let blockData = this.getBlockData(x, y)

                    let foundError = (
                        row.includes(prevNum) ||
                        column.includes(prevNum) ||
                        blockData.includes(prevNum)
                    )

                    this.setNumber(x, y, prevNum)

                    if (foundError) {
                        return [x, y]
                    }
                }
            }
            return false
        }

        async wavefunctionCollapse(sleepTime=100, outputElement=null) {
            const iterate = () => {
                let possibleOptions = this.getPossibleData()
                let entropies = possibleOptions.map(arr => {
                    if (arr === undefined) return Infinity
                    return arr.length
                })

                let lowestEntropy = Math.min(...entropies)

                if (lowestEntropy == 0)
                    return "fail"
                if (lowestEntropy == Infinity)
                    return "finished"

                let lowestEntropyIndeces = entropies.map((e, i) => {
                    if (e == lowestEntropy) return i
                    return -1
                }).filter(i => i != -1)

                let randomIndex = Math.floor(Math.random() * lowestEntropyIndeces.length)
                let randomEntropyIndex = lowestEntropyIndeces[randomIndex]
                
                let options = possibleOptions[randomEntropyIndex]
                let choiceIndex = Math.floor(Math.random() * options.length)
                let choice = options[choiceIndex]
                let [x, y] = this.xyFromIndex(randomEntropyIndex)

                this.setNumber(x, y, choice)
                return "continue"
            }

            let iterationResult = "continue"
            while (iterationResult == "continue") {
                if (sleepTime > 0)
                    await sleep(sleepTime)
                iterationResult = iterate()
                if (outputElement)
                    outputElement.textContent = this.toString()
            }

            return iterationResult
        }

        getPossibleData() {
            let possibleNumbers = []
            let rows = this.getRows()
            let columns = this.getColumns()
            let options = Array.from(Array(9), (_, i) => i + 1)
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    if (this.getNumber(x, y) != undefined) {
                        possibleNumbers.push(undefined)
                        continue
                    }

                    let row = rows[y]
                    let column = columns[x]
                    let blockData = this.getBlockData(x, y)

                    let possibleOptions = options.filter(n => {
                        if (row.includes(n)) return false
                        if (column.includes(n)) return false
                        if (blockData.includes(n)) return false

                        return true
                    })

                    possibleNumbers.push(possibleOptions)
                }
            }
            return possibleNumbers
        }

        async solveLive(outputElement) {
            // solve using wavefunction collapse technique
            let originalFEN = this.toFEN()
            let waitTimes = [30, 20, 10]
            let waitBetweenIndex = 2
            for (let i = 0; true; i++) {
                let result = await this.wavefunctionCollapse(waitTimes[i] ?? 0, outputElement)
                if (result == "finished")
                    break

                this.loadFEN(originalFEN)
                if (waitTimes[i] === undefined && i % waitBetweenIndex == 0) {
                    await sleep(0)
                    waitBetweenIndex++
                    waitBetweenIndex = Math.min(waitBetweenIndex, 100)
                }
            }
        }

        async solveFast(maxAttempts=10000) {
            let originalFEN = this.toFEN()
            let i = 0
            for (; true; i++) {
                let result = await this.wavefunctionCollapse(0)
                if (result == "finished")
                    break
                this.loadFEN(originalFEN)
                if (i >= maxAttempts)
                    throw new Error("Could not solve board!")
            }
            return i + 1
        }

        getAmountLeft() {
            return this.getRows().flat().reduce((a, b) => a + (b != undefined ? 1 : 0), 0)
        }

        getRandomXY() {
            let x = Math.floor(Math.random() * this.size)
            let y = Math.floor(Math.random() * this.size)
            return [x, y]
        }

        getRandomFilled(maxAttempts=10000) {
            let [x, y] = this.getRandomXY()
            let i = 0
            while (this.getNumber(x, y) == undefined) {
                [x, y] = this.getRandomXY()
                i++
                if (i >= maxAttempts)
                    throw new Error("Could not find filled square!")
            }
            return [x, y]
        }

        static async random(amountLeft) {
            let board = new SodokuBoard(3, 3)
            try {
                await board.solveFast()
            } catch (e) {
                throw new Error("Could not generate random board!")
            }
            while (board.getAmountLeft() > amountLeft) {
                let [x, y] = board.getRandomFilled()
                board.setNumber(x, y, undefined)
            }
            return board
        }

    }

    const MODE_FUNCS = {

        async solve() {
            let board = new SodokuBoard(3, 3)
            let outputElement = null

            if (args.fen) {
                try {
                    board.loadFEN(args.fen)
                } catch (e) {
                    throw new Error("Invalid FEN string!")
                }
                outputElement = board.printToElement()
            } else {
                outputElement = await board.fillFromInput()
                if (args["give-fen"]) {
                    let fen = board.toFEN()
                    terminal.printLine(fen)
                    await terminal.copy(fen, {printMessage: true})
                }
            }

            let conflict = board.includesConflict()
            if (conflict) {
                throw new Error("Conflict at (" + conflict.map(x => x + 1).join(", ") + "): Impossible Board!")
            }

            await board.solveLive(outputElement)
            terminal.printSuccess("Solved Sudoku puzzle successfully!")
        },

        async play() {
            const difficulties = {
                "easy": 1 / 1,
                "medium": 1 / 0.2,
                "hard": 1 / 0.1
            }

            const amountLeftDifficulties = {
                "easy": [40, 50],
                "medium": [20, 30],
                "hard": [17, 20]
            }

            async function getDifficulty() {
                terminal.printLine("Choose a difficulty:")
                for (let difficulty in difficulties) {
                    terminal.print("  " + difficulty)
                    terminal.printLine(` (${difficulty.charAt(0)})`)
                }
                let chosenDifficulty = null
                while (chosenDifficulty == null) {
                    let difficulty = await terminal.prompt("> ")
                    difficulty = difficulty.toLowerCase()
                    if (difficulty in difficulties) {
                        return difficulty
                    } else if (difficulty.length == 1) {
                        for (let virtualDifficulty in difficulties) {
                            if (virtualDifficulty.charAt(0) == difficulty) {
                                return virtualDifficulty
                            }
                        }
                    }
                    terminal.printLine("unknown difficulty: " + `"${difficulty}"`)
                }
            }

            async function generateBoard(difficulty) {
                let minAmountLeft = amountLeftDifficulties[difficulty][0]
                let maxAmountLeft = amountLeftDifficulties[difficulty][1]
                let amountLeft = Math.floor(Math.random() * (maxAmountLeft - minAmountLeft + 1) + minAmountLeft)
                let board = null
                let difficultyTries = difficulties[difficulty]
                let maxTries = difficultyTries + Math.ceil(difficultyTries / 5)
                let attempts = 0
                while (true) {
                    board = await SodokuBoard.random(amountLeft)
                    let fen = board.toFEN()
                    let solves = await board.solveFast()
                    board.loadFEN(fen)

                    attempts++
                    if (attempts % 10 == 0)
                        await sleep(0)
                    
                    if (solves >= difficultyTries && solves <= maxTries) {
                        break
                    }
                }
                return board
            }

            let difficulty = await getDifficulty()

            let board = new SodokuBoard(3, 3)

            if (args.fen) {
                try {
                    board.loadFEN(args.fen)
                } catch (e) {
                    throw new Error("Invalid FEN string!")
                }
            } else {
                terminal.addLineBreak()
                terminal.printLine(`Generating ${difficulty} board...`)
                await sleep(100)
                board = await generateBoard(difficulty)
                if (args["give-fen"]) {
                    let fen = board.toFEN()
                    await terminal.copy(fen, {printMessage: true})
                }
            }

            await board.playFromInput()

            if (difficulty == "hard" && !board.hasCheated) {
                terminal.printSuccess("You beat the hardest Sudoku puzzle!")
                terminal.printLine("For this achievement, you get an easter egg:")
                terminal.printEasterEgg("Sodoku-Egg")
            }

        }

    }

    await MODE_FUNCS[args.mode]()

}, {
    description: "Solve or generate a sodoku puzzle",
    args: {
        "?mode:s": "the mode to run in (play, solve)",
        "?fen:s": "a FEN string to load",
        "?give-fen:b": "output the FEN string for the inputted puzzle"
    },
    isGame: true
})
// ------------------- solve.js --------------------
terminal.addCommand("solve", async function(args) {
    let equation = args.equation
    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+=[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(equation)) {
        terminal.printError("Invalid equation")
        terminal.printLine("Only numbers, x, *, +, -, ^, (, ), \\ and spaces are allowed")
        return
    }
    while (/[0-9]x/g.test(equation)) equation = equation.replace(/([0-9])x/g, "$1*x")
    while (/[0-9a-z]\s*\^\s*[0-9a-z]/g.test(equation)) equation = equation.replace(/([0-9a-z])\s*\^\s*([0-9a-z])/g, "$1**$2")
    let [left, right] = equation.split("=")
    let iterations = args.i
    let iterationCount = 0
    let maxIterations = args.m
    let lowerBound = args.l
    let upperBound = args.u
    try {
        var [LHS, RHS] = [Function("x", `return ${left}`), Function("x", `return ${right}`)]
    } catch {
        throw new Error("Invalid equation!")
    }
    function findSolution(minX, maxX, resolution, depth) {
        let diff = maxX - minX
        let stepSize = diff / resolution
        let lastState = LHS(minX) > RHS(maxX)
        let solutions = Array()
        for (let x = minX; x <= maxX; x += stepSize) {
            iterationCount++
            if (iterationCount > maxIterations)
                return solutions
            let currState = LHS(x) > RHS(x)
            if (currState != lastState) {
                if (depth === 1) {
                    solutions.push(x)
                } else {
                    solutions = solutions.concat(findSolution(
                        x - stepSize,
                        x + stepSize,
                        resolution,
                        depth - 1
                    ))
                }
            }
            lastState = currState
        }
        return solutions
    }
    
    let solutions = findSolution(lowerBound, upperBound, Math.round((upperBound - lowerBound) * 10), iterations)
    let roundFactor = 10 ** 3
    let shownSolutions = Array()
    let solutionCount = 0
    for (let i = 0; i < solutions.length; i++) {
        let solution = String(Math.round(solutions[i] * roundFactor) / roundFactor)
        if (shownSolutions.includes(solution)) continue
        solutionCount++
        let xName = `x${solutionCount}`
        terminal.print(xName, Color.COLOR_1)
        terminal.print(" = ")
        terminal.printLine(solution, Color.LIGHT_GREEN)
        shownSolutions.push(solution)
    }
    if (solutions.length == 0) {
        terminal.printLine("No solutions found")
    }
    if (iterationCount >= maxIterations) {
        terminal.printError("Max iterations reached")
    }
}, {
    description: "solve a mathematical equation for x",
    args: {
        "*equation": "the equation to solve",
        "?i:n:1~5": "the number of iteration-steps to perform",
        "?m:n:1~100000": "the maximum number of total iterations to perform",
        "?l:n": "the lower bound of the search interval",
        "?u:n": "the upper bound of the search interval"
    },
    standardVals: {
        i: 4,
        m: 100000,
        l: -100,
        u: 100
    },
    disableEqualsArgNotation: true
})


// ------------------- sorting.js --------------------
terminal.addCommand("sorting", async function(args) {

    let array = Array.from({length: args.n}, (_, i) => i + 1)

    function shuffleArray() {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffleArray()

    let windowSize = Math.min((terminal.parentNode.clientWidth - 100) * 0.9, (terminal.parentNode.clientHeight - 100) * 0.9)

    const elementSize = Math.max(Math.floor(windowSize / array.length), 1)

    let elements = []
    
    function firstDraw() {
        let parentContainer = document.createElement("div")
        parentContainer.style.width = `${args.n * elementSize}px`
        parentContainer.style.height = `${args.n * elementSize}px`
        parentContainer.style.display = "grid"
        parentContainer.style.gridTemplateColumns = `repeat(${args.n}, 1fr)`
        parentContainer.style.alignItems = "end"
        for (let i = 0; i < array.length; i++) {
            let element = document.createElement("div")
            element.style.backgroundColor = "white"
            element.style.width = `${elementSize}px`
            element.style.height = `${array[i] * elementSize}px`
            elements.push(element)
            parentContainer.appendChild(element)
        }
        terminal.parentNode.appendChild(parentContainer)
    }

    let prevElements = []
    const swapColor = "lightgreen"

    function unmark() {
        for (let element of prevElements) {
            element.style.backgroundColor = "white"
        }
        prevElements = []
    }

    function heightToFreq(height) {
        const minFreq = 100
        const maxFreq = 1000
        return (height / args.n) * (maxFreq - minFreq) + minFreq
    }

    let waitTime = 100 / args.speed

    function swap(i, j) {
        unmark()
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
        elements[i].style.height = `${array[i] * elementSize}px`
        elements[j].style.height = `${array[j] * elementSize}px`
        elements[i].style.backgroundColor = swapColor
        elements[j].style.backgroundColor = swapColor
        prevElements = [elements[i], elements[j]]
        if (!args.s) {
            playFrequency(heightToFreq(array[i]), waitTime)
        }
    }

    function mark(i) {
        elements[i].style.backgroundColor = swapColor
        prevElements.push(elements[i])
        if (!args.s) {
            playFrequency(heightToFreq(array[i]), waitTime)
        }
    }

    function update(i) {
        elements[i].style.height = `${array[i] * elementSize}px`
    }

    async function endAnimation() {
        unmark()
        for (let i = 0; i < array.length; i++) {
            elements[i].style.backgroundColor = swapColor
            if (!args.s) {
                playFrequency(heightToFreq(array[i]), waitTime)
            }
            await sleep(waitTime)
        }
        await sleep(waitTime)
        for (let i = 0; i < array.length; i++) {
            elements[i].style.backgroundColor = "white"
        }
    }

    const algorithms = {
        "bubble": async function() {
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array.length - i - 1; j++) {
                    if (array[j] > array[j + 1]) {
                        swap(j, j + 1)
                        await sleep(waitTime)
                    }
                }
            }
        },
        "insertion": async function() {
            for (let i = 1; i < array.length; i++) {
                let j = i - 1
                let key = array[i]
                while (j >= 0 && array[j] > key) {
                    swap(j, j + 1)
                    await sleep(waitTime)
                    j--
                }
                array[j + 1] = key
            }
        },
        "selection": async function() {
            for (let i = 0; i < array.length; i++) {
                let minIndex = i
                for (let j = i + 1; j < array.length; j++) {
                    mark(j)
                    await sleep(waitTime)
                    unmark()
                    if (array[j] < array[minIndex]) {
                        minIndex = j
                    }
                }
                swap(i, minIndex)
                await sleep(waitTime)
            }
        },
        "quick": async function() {
            async function partition(min, max) {
                let pivot = array[max]
                let i = min - 1
                for (let j = min; j < max; j++) {
                    if (array[j] < pivot) {
                        i++
                        swap(i, j)
                        await sleep(waitTime)
                    }
                }
                swap(i + 1, max)
                await sleep(waitTime)
                return i + 1
            }

            async function quickSort(min, max) {
                if (min < max) {
                    let pi = await partition(min, max)
                    await quickSort(min, pi - 1)
                    await quickSort(pi + 1, max)
                }
            }

            await quickSort(0, array.length - 1)
        },
        "heap": async function() {
            async function heapify(n, i) {
                let largest = i
                let l = 2 * i + 1
                let r = 2 * i + 2
                if (l < n && array[l] > array[largest]) {
                    largest = l
                }
                if (r < n && array[r] > array[largest]) {
                    largest = r
                }
                if (largest != i) {
                    swap(i, largest)
                    await sleep(waitTime)
                    await heapify(n, largest)
                }
            }

            for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
                await heapify(array.length, i)
            }
            for (let i = array.length - 1; i >= 0; i--) {
                swap(0, i)
                await sleep(waitTime)
                await heapify(i, 0)
            }
        },
        "merge": async function() { 
            // inplace merge sort with marking
            async function merge(start, mid, end) {
                let i = start
                let j = mid + 1
                let temp = []
                while (i <= mid && j <= end) {
                    mark(i)
                    mark(j)
                    await sleep(waitTime)
                    unmark()
                    if (array[i] <= array[j]) {
                        temp.push(array[i])
                        i++
                    } else {
                        temp.push(array[j])
                        j++
                    }
                }
                while (i <= mid) {
                    temp.push(array[i])
                    i++
                }
                while (j <= end) {
                    temp.push(array[j])
                    j++
                }
                for (let i = start; i <= end; i++) {
                    array[i] = temp[i - start]
                    update(i)
                    mark(i)
                    await sleep(waitTime)
                }
            }

            async function mergeSort(start, end) {
                if (start < end) {
                    let mid = Math.floor((start + end) / 2)
                    await mergeSort(start, mid)
                    await mergeSort(mid + 1, end)
                    await merge(start, mid, end)
                }
            }

            await mergeSort(0, array.length - 1)
        }
    }

    if (args.algorithm === null) {
        terminal.printLine("Available algorithms:")
        for (let algorithm in algorithms) {
            terminal.print("- ")
            terminal.printCommand(algorithm, `sorting ${algorithm}`)
        }
        return
    }

    if (!(args.algorithm in algorithms)) {
        throw new Error("Unknown algorithm")
    }

    firstDraw()

    terminal.scroll()

    await sleep(1000)

    await algorithms[args.algorithm]()

    await endAnimation()

    unmark()

}, {
    description: "display a sorting algorithm",
    args: {
        "?algorithm": "the algorithm to display",
        "?n:i:10~1000": "the number of elements to sort",
        "?speed:n:0~100": "the speed of the sorting algorithm",
        "?s:b": "silent mode (deactivate sound)"
    },
    standardVals: {
        algorithm: null,
        n: 20,
        speed: 1,
    }
})


// ------------------- spion.js --------------------
const getApiUrl = "../spion/api/get.php"
const addApiUrl = "../spion/api/add.php"

terminal.addCommand("spion", async function(args) {
    let result = await fetch(getApiUrl)
    let places = await result.json()
    let placeNames = places.map(place => place.place.toLowerCase())

    if (args.add && args.list) {
        throw new Error("Cannot add and list at the same time")
    }

    if (args.add) {
        let name = await terminal.prompt("Ort Name: ")
        name = name.trim()
        while (name == "" || placeNames.includes(name.toLowerCase())) {
            if (name == "") {
                terminal.printLine("Name darf nicht leer sein", Color.COLOR_1)
            } else {
                terminal.printLine("Name bereits vorhanden", Color.COLOR_1)
            }
            name = await terminal.prompt("Ort Name: ")
            name = name.trim()
        }

        let roles = []
        while (roles.length < 20) {
            let role = await terminal.prompt("Rolle " + (roles.length + 1) + ": ")
            role = role.trim()

            if (role == "") {
                terminal.printError("Name darf nicht leer sein")
                continue
            }

            let roleNames = roles.map(role => role.toLowerCase())
            if (roleNames.includes(role.toLowerCase())) {
                terminal.printError("Name bereits vorhanden")
                continue
            }

            roles.push(role)
        }

        let formData = new FormData()

        formData.append("json", JSON.stringify({
            place: name,
            roles: roles,
        }))

        let result = await fetch(addApiUrl, {
            method: "POST",
            body: formData,
        })

        let json = await result.json()
        if (json.ok) {
            terminal.printSuccess("Ort hinzugefügt")
        } else {
            terminal.printError("Fehler beim hinzufügen: " + json.message)
        }
    } else if (args.list) {
        let place = places.find(place => place.place == args.list)
        if (!place) {
            terminal.print("Ort nicht gefunden", Color.COLOR_1)
            return
        }
        terminal.printLine("Ort: " + place.place, Color.COLOR_1)
        terminal.printLine("Rollen:")
        for (let i = 0; i < place.roles.length; i++) {
            const role = place.roles[i]
            terminal.print(i + 1, Color.COLOR_1)
            terminal.printLine(": " + role)
        }
    } else {
        terminal.printLine("Alle Orte:", Color.COLOR_1)
        for (let i = 0; i < places.length; i++) {
            const place = places[i]
            terminal.print(i + 1, Color.COLOR_1)
            terminal.print(": ")
            terminal.printCommand(place.place, "spion --list \"" + place.place + "\"")
        }
        terminal.addLineBreak()
        terminal.printCommand("Ort hinzufügen", "spion --add")
    }
}, {
    description: "Spiel Spiel Manager",
    args: {
        "?a=add:b": "add a new place",
        "?l=list:s": "list a given places roles"
    },
    isSecret: true
})
// ------------------- stacker.js --------------------
terminal.addCommand("stacker", async function(args) {
    await terminal.modules.import("game", window)

    const GAME_SIZE = new Vector2d(26, 10)
    const towerOffset = 3

    let towerWidth = 12

    const firstPrint = () => {
        let outputs = []
        for (let i = 0; i < GAME_SIZE.y; i++) {
            let line = []
            for (let j = 0; j < GAME_SIZE.x; j++) {
                let output = terminal.print(" ")
                line.push(output)
            }
            outputs.push(line)
            terminal.addLineBreak()
        }
        return outputs
    }

    terminal.printLine("press SPACE to place block")
    let outputs = firstPrint()

    const drawTowerLine = (lineIndex, towerWidth) => {
        let startX = Math.floor(GAME_SIZE.x / 2 - towerWidth / 2)
        for (let i = 0; i < towerWidth; i++) {
            outputs[lineIndex][startX + i].textContent = "#"
        }
    }

    for (let i = towerOffset; i < outputs.length; i++) {
        drawTowerLine(i, towerWidth)
    }

    const moveDown = () => {
        for (let i = outputs.length - 1; i >= 0; i--) {
            let prevLine = ""
            if (i > 0) {
                for (let j = 0; j < outputs[i - 1].length; j++) {
                    prevLine += outputs[i - 1][j].textContent
                }
            } else {
                prevLine = " ".repeat(outputs.length)
            }

            for (let j = 0; j < outputs[i].length; j++) {
                outputs[i][j].textContent = prevLine[j]
            }
        }
    }

    let scrollPos = 0
    let scrollDirection = 1

    const clearScrollPiece = () => {
        let scrollLine = towerOffset - 1
        for (let i = 0; i < outputs[scrollLine].length; i++) {
            outputs[scrollLine][i].textContent = " "
        }
    }

    const drawScrollPiece = () => {
        let scrollLine = towerOffset - 1
        clearScrollPiece()
        for (let i = scrollPos; i < scrollPos + towerWidth; i++) {
            if (i < 0 || i > outputs[scrollLine].length - 1)
                continue
            outputs[scrollLine][i].textContent = "#"
        }
    }

    let score = 0

    const dropPiece = () => {
        let scrollLine = towerOffset - 1
        towerWidth = 0
        for (let i = 0; i < outputs[scrollLine].length; i++) {
            if (outputs[scrollLine][i].textContent != "#")
                continue

            if (outputs[scrollLine + 1][i].textContent == "#") {
                towerWidth++
            } else {
                outputs[scrollLine][i].textContent = " "
            }
        }
        if (towerWidth > 0) {
            score++
        } else {
            gameRunning = false
            return
        }

        moveDown()
        update()
    }

    const update = () => {
        if (scrollPos + towerWidth >= GAME_SIZE.x)
            scrollDirection = -1
        if (scrollPos <= 0)
            scrollDirection = 1

        scrollPos += scrollDirection

        drawScrollPiece()
    }

    let gameRunning = true

    let keyListener = addEventListener("keydown", (e) => {
        if (gameRunning == false)
            return

        if (e.key == "c" && e.ctrlKey) {
            removeEventListener("keydown", keyListener)
            gameRunning = false
        }

        if (e.key == " ") {
            dropPiece()
        }
    })

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout([
            ["DROP"],
            ["STRG+C"]
        ])

        terminal.mobileKeyboard.onkeydown = (e, keycode) => {
            if (gameRunning == false)
                return

            if (keycode == "DROP") {
                dropPiece()
            }
        }
    }

    terminal.scroll()
    while (gameRunning) {
        update()
        await sleep(100 - Math.min(score, 15) * 5)
    }

    terminal.printLine(`Game over! Your score: ${score}`)

    await HighscoreApi.registerProcess("stacker")
    await HighscoreApi.uploadScore(score)
}, {
    description: "play a stacker game",
    isGame: true
})
// ------------------- stat.js --------------------
terminal.addCommand("stat", async function(args) {
    await terminal.modules.import("statistics", window)

    if (args.color !== null && args["axis-color"] === null) {
        args["axis-color"] = args.color
    }

    if (args.color === null) {
        args.color = terminal.data.foreground.toString()
    }

    if (args["axis-color"] === null) {
        args["axis-color"] = terminal.data.foreground.toString()
    }

    if (args.background === null) {
        args.background = terminal.data.background.toString()
    }

    let dataset = null

    if (args.function) {
        if (args.nums) {
            throw new Error("Cannot specify both nums and function")
        }

        if (!args.x) {
            args.x = "x"
            args["x-name"] = "x"
        }

        if (!args.y) {
            args.y = "y"
            args["y-name"] = "y"
        }

        await terminal.modules.load("mathenv", terminal)

        let func = x => {
            terminal.modules.mathenv.setValue("x", x)
            let [result, error] = terminal.modules.mathenv.eval(args.function)
            if (error)
                throw new Error(error)
            if (isNaN(result))
                throw new Error("Function returned NaN")
            return result
        }

        dataset = Dataset.fromFunc(func, {min: args.min, max: args.max, length: args.length})
    }

    const options = {
        random: "a random data set",
        randomSorted: "a random sorted data set",
        gauss: "a gaussian distribution",
        sin: "a sine wave",
        triangle: "a triangle wave",
        square: "a square wave",
        pendulum: "a pendulum wave"
    }

    if (args.nums == null && dataset == null) {
        terminal.printLine("Usage: stat [options] [nums|dataset]")
        for (let key in options) {
            let command = `stat ${key}`
            terminal.printCommand(`${key.padEnd(12)} ${options[key]}`, command)
        }
        return
    }

    if (dataset == null)
    switch (args.nums.trim()) {
        case "random":
            dataset = Dataset.random({length: args.length})
            break
        case "randomSorted":
            dataset = Dataset.randomSorted({length: args.length})
            break
        case "gauss":
            dataset = Dataset.fromFunc(x => {
                return Math.exp(-Math.pow(x, 2))
            }, {min: -3, max: 3, length: args.length})
            break
        case "sin":
            dataset = Dataset.fromFunc(x => {
                return Math.sin(x) + 1
            }, {min: 0, max: Math.PI * 4, length: args.length})
            break
        case "triangle":
            dataset = Dataset.fromFunc(x => {
                return Math.abs(x % 2 - 1)
            }, {min: 0, max: 4, length: args.length})
            break
        case "square":
            dataset = Dataset.fromFunc(x => {
                return x % 2 < 1 ? 1 : 0
            }, {min: 0, max: 5, length: args.length})
            break
        case "pendulum":
            dataset = Dataset.fromFunc(x => {
                return Math.sin(x)* Math.exp(-x / 10) + 0.7
            }, {min: 1, max: Math.PI * 12, length: args.length})
            break
        default:
            dataset = Dataset.fromString(args.nums)
    }

    if (dataset.length < 2) {
        throw new Error("not enough data points")
    }

    const canvas = document.createElement("canvas")
    canvas.width = args.width
    canvas.height = args.height
    const context = canvas.getContext("2d")
    terminal.parentNode.appendChild(canvas)
    terminal.scroll()

    const plot = (d=dataset) => {
        d.lineplot(context, {
            xAxisName: args.x,
            yAxisName: args.y,
            paddingPx: args.padding,
            arrowSize: 5,
            xAxisNameColor: args["axis-color"],
            yAxisNameColor: args["axis-color"],
            color: args["axis-color"],
            backgroundColor: args.background
        }, {
            color: args.color,
            lineWidth: args.linewidth,
            displayPoints: !args.nopoints
        })
    }

    if (args.animateMs) {
        let intervalMs = args.animateMs / dataset.numbers.length
        let startTime = Date.now()
        let interval = setInterval(() => {
            let time = Date.now() - startTime
            let index = Math.max(Math.floor(time / intervalMs), 1)
            if (index >= dataset.numbers.length) {
                index = dataset.numbers.length - 1
                clearInterval(interval)
            }
            plot(new Dataset(dataset.numbers.slice(0, index + 1)))
        }, intervalMs)
        plot(new Dataset(dataset.numbers.slice(0, 1)))
    } else {
        plot()
    }

    terminal.addLineBreak()
}, {
    description: "show a statistic of a given data set",
    args: {
        "?*nums:s": "the numbers to show the statistic of",
        "?f=function:s": "the function to plot",    
        "?min:n": "the minimum value of the function",
        "?max:n": "the maximum value of the function",
        "?width:n:1~9999": "the width of the canvas",
        "?height:n:1~9999": "the height of the canvas",
        "?x=x-name:s": "the name of the x axis",
        "?y=y-name:s": "the name of the y axis",
        "?p=padding:n:0~9999": "the padding of the canvas",
        "?color=foreground:s": "the color of plot",
        "?axis-color:s": "the color of the axis",
        "?a=animateMs": "animate the plot",
        "?background": "the background color of the canvas",
        "?l=length:i:2~99999": "the length of a data set",
        "?linewidth:n:1~999": "the width of the line in pixels",
        "?nopoints:b": "disable the points being displayed"
    },
    defaultValues: {
        nums: null,
        width: 640,
        height: 400,
        x: null,
        y: null,
        min: -10,
        max: 10,
        padding: 20,
        "axis-color": null,
        color: null,
        animateMs: 500,
        background: null,
        length: 100,
        linewidth: 2,
    }
})
// ------------------- style.js --------------------
terminal.addCommand("style", async function(args) {
    class Preset {  

        constructor(b=undefined, f=undefined, c1=Color.rgb(255, 255, 0), c2=Color.rgb(139, 195, 74)) {
            this.background = b
            this.foreground = f
            this.accentColor1 = c1
            this.accentColor2 = c2
        }

    }

    let PRESETS = {}
    PRESETS["normal"] = new Preset(Color.rgb(3, 3, 6), Color.WHITE)
    PRESETS["ha©k€r"] = new Preset(Color.BLACK, Color.hex("#4aff36"), Color.hex("#20C20E"), Color.hex("#20C20E"))
    PRESETS["light"] = new Preset(Color.hex("#255957"), Color.hex("#EEEBD3"))
    PRESETS["purple"] = new Preset(Color.hex("#371E30"), Color.hex("#F59CA9"), Color.hex("#DF57BC"), Color.hex("#F6828C"))
    PRESETS["slate"] = new Preset(Color.hex("#282828"), Color.hex("#ebdbb2"), Color.hex("#d79921"), Color.hex("#98971a"))
    PRESETS["red"] = new Preset(Color.hex("#e74645"), Color.WHITE, Color.hex("#fdfa66"), Color.hex("#fdfa66"), Color.hex("#e74645"))
    PRESETS["cold"] = new Preset(Color.hex("#3c2a4d"), Color.hex("#e0f0ea"), Color.hex("#95adbe"), Color.hex("#95adbe"))

    if (args.preset == null) {
        terminal.printLine("There are a few presets to choose from:")
        let lineWidth = 0
        for (let presetName of Object.keys(PRESETS)) {
            lineWidth += (presetName + " ").length
            terminal.printCommand(presetName + " ", `style ${presetName}`, Color.WHITE, false)
            if (lineWidth > 35) {
                terminal.printLine()
                lineWidth = 0
            }
        }
        terminal.printLine()
        return
    }
    if (!(args.preset in PRESETS))
        throw new Error(`Unknown preset "${args.preset}"`)
    let attributes = ["background", "foreground", "accentColor1", "accentColor2"]
    let preset = PRESETS[args.preset]
    for (let attribute of attributes) {
        if (preset[attribute] == undefined)
            continue
        terminal.data[attribute] = preset[attribute]
    }
}, {
    description: "change the style of the terminal",
    args: ["?preset"],
    standardVals: {
        preset: null
    }
})


// ------------------- sudo.js --------------------
terminal.addCommand("sudo", async function() {
    let password = await terminal.prompt("[sudo] password: ", {password: true})
    
    if (password.length < 8)
        throw new Error("Password too short")
    if (password.length > 8)
        throw new Error("Password too long")
    if (password.match(/[A-Z]/))
        throw new Error("Password must not contain uppercase letters")
    if (password.match(/[a-z]/))
        throw new Error("Password must not contain lowercase letters")
    if (password.match(/[0-9]/))
        throw new Error("Password must not contain numbers")

    function containsRepeatedCharacters(str) {
        for (let char of str) {
            if (str.replace(char, "").includes(char))
                return true
        }
        return false
    }

    if (containsRepeatedCharacters(password))
        throw new Error("Password must not contain repeated characters")

    terminal.printSuccess("Password accepted")
    terminal.printLine("You are now officially a hacker!!")
    terminal.printEasterEgg("Hacker-Egg")
}, {
    description: "try to use sudo",
    args: ["**"]
})
// ------------------- terminal.js --------------------
terminal.addCommand("terminal", async function(args) {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: terminal.window.location.href,
        name: "Terminal inside Terminal",
        fullscreen: args.f
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "a terminal inside a terminal",
    args: {"?f=fullscreen:b": "Open in fullscreen mode"}
})
// ------------------- terml.js --------------------
class TermlSettings {

    static INLINE_DELIMITER = " "
    static LINE_DELIMIETER = "\n"
    static INDENT_CHAR = "\t" // must be a single character
    static DEF_KEYWORD = "DEF"
	static COMMENT_CHAR = "#" // must be a single character

	static TAB_WIDTH = 4

	static maxRepeat = 1000

	static OUT_FUNC = (str) => {
		Terml.output += str
	}

	static IN_FUNC = (str) => {
		return prompt(str)
	}

}

class TermlError extends Error {

    static makeName(name) {
        return `Terml${name}Error`
    }

    constructor(message) {
        super(message)
        this.name = TermlError.makeName("")
    }

}

class TermlSyntaxError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlError.makeName("Syntax")
	}

}

class TermlRuntimeError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlError.makeName("Runtime")
	}

    static makeName(name) {
		return `TermlRuntime${name}Error`
	}

}

class TermlRuntimeNumArgumentsError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("NumArguments")
	}

}

class TermlRuntimeTypeError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("Type")
	}

}

class TermlRuntimeMaxRepeatError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("MaxRepeat")
	}

}

class TermlRuntimeSubstatementIndexError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("SubstatementIndex")
	}

}

class TermlValueObject {}

class TermlLiteral extends TermlValueObject {

	constructor(value) {
		super()
		this._value = value
		this.isLiteral = true
	}

	get value() {
		return this._value	
	}

	static fromToken(token) {
		if (token.isStringLiteral)
			return new TermlStringLiteral(token.value)
		if (token.isNumberLiteral)
			return new TermlNumberLiteral(token.value)
		throw new TermlError("Token is not a literal")
	}

}

class TermlStringLiteral extends TermlLiteral {

	constructor(value) {
		super(value.toString())
	}

	static fromArray(arr) {
		let str = ""
		for (let charCode of arr) {
			let char = String.fromCharCode(charCode)
			str += char
		}
		return new TermlStringLiteral(str)
	}

	get stringValue() {
		return this._value
	}

	toString() {
		return `"${this.value}"`
	}

	get value() {
		let listData = []
		for (let char of this._value) {
			let charCode = char.charCodeAt(0)
			listData.push(charCode)
		}
		return listData
	}

}

class TermlNumberLiteral extends TermlLiteral {

	constructor(value) {
		super(value)
	}

	toString() {
		return `${this.value}`
	}

}

class TermlToken {

	checkIfNumberLiteral() {
		const numRegex = /^-?\d+(?:\.\d+)?$/

		if (numRegex.test(this.content)) {
			this.isNumberLiteral = true
			this.content = parseFloat(this.content)
			let error = TermlVariable.getValueError(this.content)
			if (error) throw error
			return true
		}

		return false
	}

	toString() {
		return this.content
	}

    constructor(content, {isStringLiteral=false}={}) {
        this.content = content
		this.isStringLiteral = isStringLiteral
		this.isNumberLiteral = this.checkIfNumberLiteral()
    }

	get isLiteral() {
		return this.isStringLiteral || this.isNumberLiteral
	}

	toLiteral() {
		return TermlLiteral.fromToken(this)
	}

    get value() {
        return this.content
    }

}

function TermlIsVar(obj) {
	return (
		obj instanceof TermlVariable ||
		obj instanceof TermlList
	)
}

class TermlVariable extends TermlValueObject {

    constructor(name, value, parentContainer) {
		super()
        if (!name) throw new TermlError("No name provided")
        this.name = name
        this.setValue(value)

        if (!(parentContainer instanceof TermlVariableContainer))
            throw new TermlError("Container is not a TermlVariableContainer")
        this.parentContainer = parentContainer
		this.isList = false
    }

	toString() {
		return `VAR{${this.name}}`
	}

	toCharacter() {
		let char = String.fromCharCode(this.value)
		return char
	}

    get isRoot() {
        return this.parentContainer === undefined   
    }

    get value() {
        return this._value
    }

    set value(value) {
        this.setValue(value)
    }

    static getValueError(value) {
        if (typeof value !== "number")
            return new TermlError("Value is not a number")
    }

    setValue(value=0) {
        const error = TermlVariable.getValueError(value)
        if (error) throw error
        this._value = value
    }

    get binString() {
        return this.value.toString(2).padStart(8, "0")
    }

    get hexString() {
        return this.value.toString(16).padStart(2, "0").toUpperCase()
    }

}

class TermlList extends TermlValueObject {

	constructor(name, value, parentContainer) {
		super()
        if (!name) throw new TermlError("No name provided")
        this.name = name
        this.setValue(value)

        if (!(parentContainer instanceof TermlVariableContainer))
            throw new TermlError("Container is not a TermlVariableContainer")
        this.parentContainer = parentContainer
		this.isList = true
	}

	toString() {
		return `LIST{${this.name}}`
	}

	set value(value) {
		this.setValue(value)
	}

	copyValue() {
		return this._value.slice()
	}

	get reference() {
		return this._value
	}

	get value() {
		return this.copyValue()
	}

	setValue(value=[]) {
        const error = TermlList.getValueError(value)
        if (error) throw error
        this._value = value
	}

	static getValueError(value) {
		if (!Array.isArray(value))
			return new TermlError("Value is not an array")
		for (let i = 0; i < value.length; i++) {
			const error = TermlVariable.getValueError(value[i])
			if (error) return error
		}
	}

	getStringContent() {
		return this.value.map(v => v.toCharacter()).join()
	}

	get binString() {
		return this.value.map(v => v.toString(2).padStart(8, "0")).join(" ")
	}

	get hexString() {
		return this.value.map(v => v.toString(16).padStart(2, "0").toUpperCase()).join(" ")
	}

}

class TermlModule {

	constructor(name, functions, variables, termlCode) {
		const toDict = (arr, key) => {
			let dict = {}
			for (let item of arr) {
				dict[item[key]] = item
			}
			return dict
		}

		if (!name) throw new TermlError("No name provided")
		this.name = name
		this.functions = toDict(functions, "name")
		this.variables = toDict(variables, "name")
		this.termlCode = termlCode
	}

}

class TermlVariableContainer {

    constructor({name=undefined, parentContainer=undefined}={}) {
        this.variables = {}
        this.functions = {}
        this.name = name // name may be undefined

        if (parentContainer && !(parentContainer instanceof TermlVariableContainer))
            throw new TermlError("Parent container is not a VariableContainer")
        this.parentContainer = parentContainer // parentContainer may be undefined
    }

	importModule(module) {
		if (!(module instanceof TermlModule))
			throw new TermlError("Module is not a TermlModule")
		for (let name in module.functions) {
			if (!this.functionExists(name))
				this.setFunction(name, module.functions[name])
		}
		for (let name in module.variables) {
			if (!this.variableExists(name))
				this.setVariable(name, module.variables[name])
		}
	}

    setFunction(name, func) {
        if (!name)
            throw new TermlError("No name provided")
        if (!(func instanceof TermlFunction))
            throw new TermlError("Function is not a TermlFunction")
        this.functions[name] = func
    }

    functionExists(name) {
        if (!name)
            throw new TermlError("No name provided")
        return this.functions[name] !== undefined
    }

    getFunction(name) {
        if (!name) 
            throw new TermlError("No name provided")
        return this.functions[name]
    }

    getVariable(name) {
        if (!name)
            throw new TermlError("No name provided")
        return this.variables[name]
    }

	variableExists(name) {
		if (!name)
			throw new TermlError("No name provided")
		return this.variables[name] !== undefined
	}

	setVariableRef(name, variable) {
		if (!name)
			throw new TermlError("No name provided")
		if (!TermlIsVar(variable))
			throw new TermlError("Variable is not a TermlVariable")
		this.variables[name] = variable
	}

    setVariable(name, value) {
        if (!name)
            throw new TermlError("No name provided")
        if (this.variables[name]) {
            this.variables[name].value = value
        } else {
			try {
				this.variables[name] = new TermlVariable(name, value, this)
			} catch (error) {
				try {
					this.variables[name] = new TermlList(name, value, this)
				} catch (error) {
					throw new TermlError("Variable is not a TermlVariable or TermlList")
				}
			}
        }
    }

}

class TermlStatement {

    constructor(functionName, args, {substatements=undefined, parent=undefined, container=undefined}={}) {
        if (!functionName)
            throw new TermlError("No functionName provided")
        this.functionName = functionName
        this.args = args || []
        this.substatements = substatements || []
		this.container = container || new TermlVariableContainer({name: this.makeContainerName()})
        this.parent = parent // parent may be undefined

		this.isStatement = true
		this.isFunction = false
    }

	toString() {
		return `STMT{${this.functionName.value}; ${this.args.map(a => a.toString()).join(", ")}}`
	}

	makeContainerName() {
        return `STMT{${this.functionName.value}}`
    }

    addSubstatement(statement) {
        if (!(statement instanceof TermlStatement))
            throw new TermlError("Statement is not a TermlStatement")
        this.substatements.push(statement)
    }

    static fromTokens(tokens, opts) {
        if (!tokens || !tokens.length)
            throw new TermlError("No tokens provided")
        const functionName = tokens.shift()
        return new TermlStatement(functionName, tokens, opts)
    }

}

class TermlFunction {

    constructor(name, args, statements, jsFunction) {
        if (!name)
            throw new TermlError("No name provided")
        this.name = name
        this.args = args || []
        this.statements = statements || []
        this.container = new TermlVariableContainer({name: this.makeContainerName()})

		if (jsFunction && typeof jsFunction !== "function")
			throw new TermlError("jsFunction is not a function")
		this.jsFunction = jsFunction

		this.isStatement = false
		this.isFunction = true
    }

	execute() {
		if (this.jsFunction) {
			return this.jsFunction(...arguments)
		} else {
			throw new TermlError("Function has no jsFunction")
		}
	}

    makeContainerName() {
        return `FUNC{${this.name.value}}`
    }

    addStatement(statement) {
        if (!(statement instanceof TermlStatement))
            throw new TermlError("Statement is not a TermlStatement")
        this.statements.push(statement)
    }

}

class TermlParser {

    constructor() {
        this.globalStatement = new TermlStatement(
			new TermlToken("__GLOBAL__"),
            [], {parent: undefined})
    }

    tokenize(line) {
        let tokens = []
        let currentToken = ""
        let inString = false
		const inlineDeliminiters = [TermlSettings.INLINE_DELIMITER]
        const stringDelimiters = ["\"", "'"]
        let currentStringDelimiter = undefined

        for (let char of line) {
            if (inString) {
                if (char === currentStringDelimiter) {
                    inString = false
                    currentStringDelimiter = undefined
                    tokens.push(new TermlToken(currentToken, {isStringLiteral: true}))
                    currentToken = ""
                } else {
                    currentToken += char
                }
            } else {
                if (stringDelimiters.includes(char)) {
                    inString = true
                    currentStringDelimiter = char
                } else if (inlineDeliminiters.includes(char)) {
                    if (currentToken !== "")
                        tokens.push(new TermlToken(currentToken))
                    currentToken = ""
                } else {
                    currentToken += char
                }
            }
			if (currentToken === TermlSettings.INDENT_CHAR) {
				tokens.push(new TermlToken(currentToken))
				currentToken = ""
			}
        }

        if (currentToken !== "")
            tokens.push(new TermlToken(currentToken))

		tokens = tokens.map(token => {
			if (token.isLiteral)
				return token.toLiteral()
			else
				return token
		})

        return tokens
    }

    parseLines(lines) {
		let tokenizedLines = lines.map(this.tokenize)
        let currIndent = 0

        let lastStatement = undefined
		
		let currParent = this.globalStatement
        for (let line of tokenizedLines) {
			if (line.length === 0)
				continue

            let indent = 0
            while (line[0].value === TermlSettings.INDENT_CHAR) {
                indent++
                line.shift()
            }

            if (indent - 1 > currIndent)
                throw new TermlSyntaxError("Invalid indentation")

            while (indent < currIndent) {
                currParent = currParent.parent
                currIndent--
            }

            if (indent > currIndent) {
                if (!lastStatement)
                    throw new TermlSyntaxError("Invalid indentation (no previous statement)")

                currParent = lastStatement
            }

            let statement = TermlStatement.fromTokens(line, 
                {parent: currParent})

            currParent.addSubstatement(statement)

			lastStatement = statement
			currIndent = indent
        }
    }

    extractLines(string) {
        return string
            .split(TermlSettings.LINE_DELIMIETER)
            .filter(line => line.trim().length > 0)
    }

    parse(string) {
        if (typeof string !== "string")
            throw new TermlError("Input is not a string")
        this.parseLines(this.extractLines(string))
		return this.globalStatement
    }

}

const TermlStandardModule = new TermlModule("standard", [

	new TermlFunction("__GLOBAL__", [], [], (args, statement, runtime) => {
		Terml.checkType(args, [])
		for (let substatement of statement.substatements) {
			runtime.executeStatement(substatement)
		}
	}),

	new TermlFunction("NEW", ["name", "?value"], [], (args, statement, runtime) => {
		let container = statement.parent.container
		if (!Terml.getTypeError(args, [TermlStringLiteral])) {
			container.setVariable(args[0].stringValue, undefined)
			return
		} 

		Terml.checkType(args, [TermlStringLiteral, TermlValueObject])
		let [varName, varValue] = args
		container.setVariable(varName.stringValue, varValue.value)
	}),

	new TermlFunction("NEW_LST", ["name", "?value"], [], (args, statement, runtime) => {
		let container = statement.parent.container
		if (!Terml.getTypeError(args, [TermlStringLiteral])) {
			container.setVariable(args[0].stringValue, [])
			return
		} 

		window.container = container

		Terml.checkType(args, [TermlStringLiteral, TermlStringLiteral])
		let [varName, varValue] = args
		container.setVariable(varName.stringValue, varValue.value)
	}),

	new TermlFunction("PUSH", ["name", "value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject])
		let [variable, valueToken] = args
		variable.reference.push(valueToken.value)
	}),

	new TermlFunction("INSERT_AT", ["name", "value", "index"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject, TermlNumberLiteral])
		let [variable, valueToken, indexToken] = args
		variable.reference.splice(indexToken.value, 0, valueToken.value)
	}),

	new TermlFunction("POP", ["name", "?var"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlList])) {
			let [variable] = args
			variable.reference.pop()
			return
		}
		Terml.checkType(args, [TermlList, TermlVariable])
		let [variable, valueToken] = args
		if (variable.value.length === 0)
			return
		valueToken.value = variable.reference.pop()
	}),

	new TermlFunction("CONCAT", ["list1", "list2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlList])
		let [list1, list2] = args
		list1.value = list1.value.concat(list2.value)
	}),

	new TermlFunction("UNSHIFT", ["name", "value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject])
		let [variable, valueToken] = args
		variable.reference.unshift(valueToken.value)
	}),

	new TermlFunction("DELETE_AT", ["name", "index"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject])
		let [variable, indexToken] = args
		if (indexToken.value >= variable.value.length)
			return
		variable.reference.splice(indexToken.value, 1)
	}),

	new TermlFunction("SHIFT", ["name", "?var"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlList])) {
			let [variable] = args
			variable.reference.shift()
			return
		}
		Terml.checkType(args, [TermlList, TermlVariable])
		let [variable, valueToken] = args
		valueToken.value = variable.reference.shift()
	}),

	new TermlFunction("GET_AT", ["name", "index", "var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject, TermlVariable])
		let [variable, indexToken, valueToken] = args
		valueToken.value = variable.reference[indexToken.value]
	}),

	new TermlFunction("SET_AT", ["name", "index", "value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject, TermlValueObject])
		let [variable, indexToken, valueToken] = args
		variable.reference[indexToken.value] = valueToken.value
	}),

	new TermlFunction("SET", ["name", "value"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlList, TermlList])) {
			let [list1, list2] = args
			list1.value = list2.value
			return
		}
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [variable, valueToken] = args
		variable.value = valueToken.value
	}),

	new TermlFunction("OUT", ["value"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlValueObject])) {
			let [valueToken] = args
			let value = valueToken.value
			if (Array.isArray(value)) 
				value = TermlStringLiteral.fromArray(value).stringValue
			TermlSettings.OUT_FUNC(("" + value).replace(/\\n/g, "\n"))
		}
	}),

	new TermlFunction("OUT_LST", ["value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let error = Terml.getTypeError(args, [TermlList])
		if (error) error = Terml.getTypeError(args, [TermlStringLiteral])
		if (error) throw error
		let stringVal = JSON.stringify(args[0].value)
		TermlSettings.OUT_FUNC(stringVal)
	}),

	new TermlFunction("IN", ["name"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList])
		let [variable] = args
		let input = TermlSettings.IN_FUNC()
		variable.value = new TermlStringLiteral(input).value
	}),

	new TermlFunction("ADD", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value += var2.value
	}),

	new TermlFunction("SUB", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value -= var2.value
	}),

	new TermlFunction("MUL", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value *= var2.value
	}),

	new TermlFunction("DIV", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value /= var2.value
	}),

	new TermlFunction("MOD", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value %= var2.value
	}),

	new TermlFunction("POW", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value = Math.pow(var1.value, var2.value)
	}),

	new TermlFunction("ROUND", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.round(var1.value)
	}),

	new TermlFunction("SQRT", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.sqrt(var1.value)
	}),

	new TermlFunction("FLOOR", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.floor(var1.value)
	}),

	new TermlFunction("CEIL", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.ceil(var1.value)
	}),

	new TermlFunction("DEF", [], [], (args, defStatement, runtime) => {
		Terml.checkType(args[0], TermlStringLiteral)
		let funcName = args[0].stringValue
		let funcArgs = args.slice(1)
		Terml.checkType(funcArgs, funcArgs.map(() => TermlStringLiteral))

		function parseVarName(name) {
			let info = {
				isReference: false,
			}

			if (name.startsWith("&")) {
				info.isReference = true
				name = name.slice(1)
			}

			info.name = name
			return info
		}

		function jsFunc(args, statement) {
			if (args.length !== funcArgs.length)
				throw new TermlRuntimeNumArgumentsError()
			Terml.checkType(args, args.map(() => TermlValueObject))
			for (let i = 0; i < funcArgs.length; i++) {
				let varInfo = parseVarName(funcArgs[i].stringValue)
				if (varInfo.isReference && TermlIsVar(args[i])) {
					defStatement.container.setVariableRef(varInfo.name, args[i])
				} else {
					defStatement.container.setVariable(funcArgs[i].stringValue, args[i].value)
				}
			}

			defStatement.container.setFunction("EXEC_SUB", new TermlFunction("EXEC_SUB", [], [], (execArgs) => {
				Terml.checkType(execArgs, [TermlValueObject])
				let subIndex = execArgs[0].value
				if (subIndex < 0 || subIndex >= defStatement.substatements.length)
					throw new TermlRuntimeSubstatementIndexError()
				let substatement = statement.substatements[subIndex]
				if (substatement === undefined)
					throw new TermlRuntimeSubstatementIndexError("undefined")
				runtime.executeStatement(substatement)
			}))

			defStatement.container.setFunction("LEN_SUB", new TermlFunction("LEN_SUB", [], [], (lenArgs) => {
				Terml.checkType(lenArgs, [TermlVariable])
				lenArgs[0].value = statement.substatements.length
			}))

			for (let substatement of defStatement.substatements) {
				runtime.executeStatement(substatement)
			}
		}

		let func = new TermlFunction(funcName, args, defStatement.substatements, jsFunc)
		defStatement.parent.container.setFunction(funcName, func)
	}),

	new TermlFunction("IS_EQ", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value === val2.value) ? 1 : 0
	}),

	new TermlFunction("IS_LT", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value < val2.value) ? 1 : 0
	}),

	new TermlFunction("IS_GT", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value > val2.value) ? 1 : 0
	}),

	new TermlFunction("OR", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value || val2.value) ? 1 : 0
	}),

	new TermlFunction("XOR", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		let a = val1.value ? 1 : 0
		let b = val2.value ? 1 : 0
		outputVar.value = (a ^ b) ? 1 : 0
	}),

	new TermlFunction("NOT", ["val1", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlVariable])
		let [val1, outputVar] = args
		outputVar.value = (val1.value) ? 0 : 1
	}),

	new TermlFunction("AND", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		let a = val1.value ? 1 : 0
		let b = val2.value ? 1 : 0
		outputVar.value = (a && b) ? 1 : 0
	}),

	new TermlFunction("IF", ["value"], [], (args, statements, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		if (value.value !== 0) {
			for (let substatement of statements.substatements) {
				runtime.executeStatement(substatement)
			}
		}
	}),

	new TermlFunction("IF_NOT", ["value"], [], (args, statements, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		if (value.value === 0) {
			for (let substatement of statements.substatements) {
				runtime.executeStatement(substatement)
			}
		}
	}),

	new TermlFunction("WHILE", ["value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		let count = 0
		while (value.value !== 0) {
			for (let substatement of statement.substatements) {
				runtime.executeStatement(substatement)
			}
			count++
			if (count > TermlSettings.maxRepeat)
				throw new TermlRuntimeMaxRepeatError("WHILE loop exceeded maximum number of iterations")
		}
	}),

	new TermlFunction("WHILE_NOT", ["value"], [], (args, statements, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		let count = 0
		while (value.value !== 0) {
			for (let substatement of statements.substatements) {
				runtime.executeStatement(substatement)
			}
			count++
			if (count > TermlSettings.maxRepeat)
				throw new TermlRuntimeMaxRepeatError("WHILE_NOT loop exceeded maximum number of iterations")
		}
	}),

	new TermlFunction("REPEAT", ["value"], [], (args, statement, runtime) => {
		let variable = null
		if (!Terml.getTypeError(args, [TermlValueObject, TermlStringLiteral])) {
			let container = statement.container
			container.setVariable(args[1].stringValue, undefined)
			variable = container.getVariable(args[1].stringValue)
		} else {
			Terml.checkType(args, [TermlValueObject])
		}
		
		let val = args[0].value

		if (val < 0)
			throw new TermlRuntimeError("REPEAT value must be positive")
		if (val > TermlSettings.maxRepeat)
			throw new TermlRuntimeMaxRepeatError(`REPEAT value must be less than ${TermlSettings.maxRepeat}`)
		for (let count = 0; count < val; count++) {
			if (variable)
				variable.value = count
			for (let substatement of statement.substatements) {
				runtime.executeStatement(substatement)
			}
		}
	}),

], [])

class TermlRuntime {

	constructor(globalStatement) {
		this.preCode = ""
		this.globalStatement = globalStatement
		this.importModule(TermlStandardModule)
	}

	importModule(module) {
		this.globalStatement.container.importModule(module)
	}

	execute() {
		this.executeStatement(this.globalStatement)
	}

	getVariable(name, statement) {
		if (!statement)
			statement = this.globalStatement

		let currContainer = statement
		while (!currContainer.container.variableExists(name)) {
			currContainer = currContainer.parent
			if (!currContainer) {
				throw new TermlError(`Variable ${name} is not defined`)
			}
		}
		return currContainer.container.getVariable(name)
	}

	getFunction(name, statement) {
		if (!statement)
			statement = this.globalStatement

		let currContainer = statement
		while (!currContainer.container.functionExists(name)) {
			currContainer = currContainer.parent
			if (!currContainer)
				throw new TermlError(`Function ${name} is not defined`)
		}
		return currContainer.container.getFunction(name)
	}

	executeStatement(statement) {
		let functionName = statement.functionName.value
		let func = this.getFunction(functionName, statement)
		let args = statement.args.map(arg => {
			return (arg.isLiteral) ? arg : this.getVariable(arg.value, statement)
		})
		func.execute(args, statement, this)
	}

}

class Terml {

	static output = ""

	static checkType(value, type) {
		let error = Terml.getTypeError(value, type)
		if (error) throw error
	}

	static getTypeError(value, type) {
		if (type instanceof Array) {
			if (!(value instanceof Array)) {
				return new TermlRuntimeTypeError("Array")
			}
			if (type.length !== value.length) {
				return new TermlRuntimeNumArgumentsError()
			}
			if (type.length === 0)
				return undefined
			for (let t of type) {
				for (let v of value)
					if (v instanceof t)
						return undefined
					else
						return new TermlRuntimeTypeError(t.name)
			}
			throw new TermlRuntimeTypeError(type.name)
		} else {
			if (value instanceof type)
				return undefined
			else
				return new TermlRuntimeTypeError(type.name)
		}
	}

	static get Settings() {
		return TermlSettings
	}

	static removeStaticWhitespace(text) {
		let lines = text.split("\n").filter(l => l.length > 0)
		const allLinesStartWith = str => {
			for (let line of lines)
				if (!line.startsWith(str))
					return false
			return true
		}

		const removeFirstCharOfLines = () => {
			for (let i = 0; i < lines.length; i++) {
				lines[i] = lines[i].slice(1)
			}
			lines = lines.filter(l => l.length > 0)
			return lines.length === 0
		}

		while (allLinesStartWith(" ")) if(removeFirstCharOfLines()) break
		while (allLinesStartWith("\t")) if(removeFirstCharOfLines()) break

		return lines.join("\n")
	}

	static furbishCode(code) {
		const commentRegex = new RegExp(`^[\\s\\t]*${TermlSettings.COMMENT_CHAR}.*$`)
		let lines = code.split(TermlSettings.LINE_DELIMIETER)
			.filter(l => l.length > 0)
			.filter(l => !commentRegex.test(l))
		
		code = lines.join(TermlSettings.LINE_DELIMIETER)
		code = Terml.removeStaticWhitespace(code)
			.replaceAll(" ".repeat(TermlSettings.TAB_WIDTH), TermlSettings.INDENT_CHAR)

		let docParser = new DOMParser().parseFromString(code, "text/html")
		return docParser.documentElement.textContent
	}

	static run(code, {log=false}={}) {
		code = Terml.furbishCode(code)
		Terml.output = ""
		const parser = new TermlParser()
		const globalStatement = parser.parse(code)
		const runtime = new TermlRuntime(globalStatement)
		runtime.execute()

		if (log) Terml.logOutput()

		return Terml.output
	}

	static logOutput() {
		console.log(Terml.output)
	}

	static parseDocument(document) {
		let termlElements = document.querySelectorAll("terml")
		for (let element of termlElements) {
			const code = element.innerHTML
			const parentElement = element.parentElement
			element.remove()

			let newTextContent = ""

			try {
				newTextContent = Terml.run(code)
			} catch (e) {
				if (e instanceof TermlError) {
					newTextContent = e.toString()
				} else {
					throw e
				}
			}

			parentElement.innerHTML += newTextContent
		}
	}

}

terminal.addCommand("terml", async function(args) {
	const file = terminal.getFile(args.file)
	if (file.isDirectory)
		throw new Error("File is not readable")
	const code = file.content
	TermlSettings.OUT_FUNC = txt => {
		terminal.print(txt)
	}
	
	try {
		Terml.run(code)
	} catch (e) {
		terminal.addLineBreak()
		throw e
	}
}, {
	description: "run a .terml file",
	args: {
		"file": "the file to run"
	}
})
// ------------------- tetris.js --------------------
terminal.addCommand("tetris", async function(args) {
    await terminal.modules.import("game", window)

    const pieces = [
        [[0,-2], [0,-1], [0, 0], [ 0, 1]],
        [[0,-1], [0, 0], [0, 1], [-1, 0]],
        [[0,-1], [0, 0], [0, 1], [-1, 1]],
        [[0,-1], [0, 0], [0, 1], [-1,-1]],
        [[0,-1], [0, 0], [-1,1], [-1, 0]],
        [[-1,-1],[0, 0], [-1,0], [ 0, 1]],
        [[-1,-1],[0, 0], [-1,0], [ 0,-1]],
    ].map(p => p.map(s => new Vector2d(s[0], s[1])))

    const pieceType = {
        CUBE: 6
    }

    const pieceColors = [
        Color.hex("FF0000"),
        Color.hex("00FF00"),
        Color.hex("0000FF"),
        Color.hex("FFFF00"),
        Color.hex("FF00FF"),
        Color.hex("00FFFF"),
        Color.hex("88FF88"),
    ]

    const FIELD_HEIGHT = 20
    const FIELD_WIDTH = 10

    class Piece {

        constructor(pieceIndex, game) {
            this.pieceIndex = pieceIndex ?? Math.floor(Math.random() * pieces.length)
            this.relativeCoords = [...pieces[pieceIndex]]
            this.color = pieceColors[pieceIndex]
            this.pos = 0
            this.falling = true
            this.game = game

            this.id = Math.random()
        }

        equals(otherPiece) {
            return this.id == otherPiece.id
        }

        get value() {
            return this.pieceIndex + 1
        }

        get type() {
            return this.pieceIndex
        }

        get coords() {
            return this.relativeCoords.map(c => c.add(this.pos))
        }

        rotate() {
            if (this.type == pieceType.CUBE)
                return

            let prevCoords = this.relativeCoords.map(c => c.copy())
            this.relativeCoords = this.relativeCoords.map(c => new Vector2d(-c.y, c.x))
            if (this.outOfBounds()) {
                this.relativeCoords = prevCoords
            }
        }

        draw() {
            this.coords.forEach(c => {
                if (c.x >= 0 && c.x < FIELD_WIDTH && c.y >= 0 && c.y < FIELD_HEIGHT) {
                    this.game.canvas[c.y][c.x] = this.value
                }
            })
        }

        touchesOtherPiece() {
            for (let pos of this.coords) {
                if (this.game.fieldOccupied(pos, this)) {
                    return true
                }
            }
            return false
        }

        outOfBounds() {
            if (this.touchesOtherPiece()) return true
            return this.coords.some(c => c.x < 0 || c.x >= FIELD_WIDTH || c.y >= FIELD_HEIGHT)
        }

        moveSide(amount) {
            this.pos = this.pos.add(new Vector2d(amount, 0))
            if (this.outOfBounds()) {
                this.pos = this.pos.add(new Vector2d(-amount, 0))
            }
        }

        update() {
            this.pos.y += 1
            if (this.outOfBounds()) {
                this.pos.y -= 1
                this.falling = false
            }
        }

    }

    class TetrisGame {

        firstDraw() {
            this.canvasOutputs = []
            this.nextPieceOutputs = []
            this.holdPieceOutputs = []
            this.scoreOutput = null
            terminal.printLine("+" + "-".repeat(FIELD_WIDTH * 2) + "+")
            for (let i = 0; i < FIELD_HEIGHT; i++) {
                let outputRow = []
                terminal.print("|")
                for (let j = 0; j < FIELD_WIDTH; j++) {
                    let element = terminal.print("  ", undefined, {forceElement: true})
                    outputRow.push(element)
                    element.style.transition = "none"
                }
                terminal.print("|")
                this.canvasOutputs.push(outputRow)

                const printPiecePart = output => {
                    terminal.print("   |")
                    let line = []
                    for (let i = 0; i < 3; i++) {
                        line.push(terminal.print("  ", undefined, {forceElement: true}))
                        line[i].style.transition = "none"
                    }
                    terminal.print("|")
                    output.push(line)
                }

                if (i == 0) terminal.print("   +-Next-+")
                if (i > 0 && i < 5) printPiecePart(this.nextPieceOutputs)
                if (i == 5) terminal.print("   +------+")

                if (i == 7) terminal.print("   +-Hold-+")
                if (i > 7 && i < 12) printPiecePart(this.holdPieceOutputs)
                if (i == 12) terminal.print("   +------+")

                if (i == 14) {
                    terminal.print("   Score: ")
                    this.scoreOutput = terminal.print("0")
                }

                terminal.addLineBreak()
            }
            terminal.printLine("+" + "-".repeat(FIELD_WIDTH * 2) + "+")
        }

        clearCanvas() {
            this.canvas = Array.from({length: FIELD_HEIGHT}, () => Array.from({length: FIELD_WIDTH}, () => 0))
        }

        drawPixel(pos, value) {
            if (pos.x < 0 || pos.x >= FIELD_WIDTH || pos.y < 0 || pos.y >= FIELD_HEIGHT)
                return

            let realPos = pos.mul(new Vector2d(1, 1))

            let color = new Color(0, 0, 0, 0)
            if (value != 0) {
                color = pieceColors[value - 1]
            }

            this.canvasOutputs[realPos.y][realPos.x].style.backgroundColor = color.toString()
        }

        constructor() {
            this.running = true
            this.intervalTime = 500

            this.canvasOutputs = null
            this.firstDraw()

            this.canvas = null
            this.clearCanvas()

            this.pieces = []
            this.pieceQueue = this.makeShuffledPieces()

            this.holdPieceIndex = null

            this.score = 0
        }

        makeShuffledPieces() {
            let tempPieces = Array.from({length: pieces.length}, (_, i) => i)
            tempPieces.sort(() => Math.random() - 0.5)
            return tempPieces
        }

        get currFallingPiece() {
            return this.pieces.find(p => p.falling)
        }

        anyPieceFalling() {
            return this.pieces.some(p => p.falling)
        }

        update() {
            for (let piece of this.pieces)
                piece.update()
            if (!this.anyPieceFalling()) {
                if (this.pieceQueue.length < 2) {
                    this.pieceQueue = this.makeShuffledPieces()
                }
                this.spawnPiece(this.pieceQueue.shift())
            }

            this.checkLines()
        }

        removeLine(lineIndex) {
            this.pieces.forEach(p => {
                for (let i = 0; i < p.relativeCoords.length; i++) {
                    let relativeCoord = p.relativeCoords[i]
                    let coord = relativeCoord.add(p.pos)
                    if (coord.y == lineIndex) {
                        p.relativeCoords.splice(i, 1)
                        i--
                    } else if (coord.y < lineIndex) {
                        p.relativeCoords[i] = relativeCoord.add(new Vector2d(0, 1))
                    }
                }
            })
        }

        checkLines() {
            for (let y = 0; y < FIELD_HEIGHT; y++) {
                let line = this.canvas[y]
                if (line.every(v => v != 0)) {
                    this.removeLine(y)
                    this.score += 1
                }
            }
        }

        fieldOccupied(pos, ignorePiece) {
            for (let piece of this.pieces) {
                if (piece.equals(ignorePiece))
                    continue
                if (piece.coords.some(c => c.equals(pos)))
                    return true
            }
            return false
        }

        spawnPiece(typeIndex) {
            let piece = new Piece(typeIndex, this)
            piece.pos = new Vector2d(Math.floor(FIELD_WIDTH / 2), 0)
            let rotations = Math.floor(Math.random() * 4)
            for (let i = 0; i < rotations; i++)
                piece.rotate()
            this.pieces.push(piece)
            if (piece.touchesOtherPiece())
                this.running = false
        }

        drawSidepanel(pieceIndex, outputArray) {
            if (pieceIndex === undefined || pieceIndex === null) return

            let piece = new Piece(pieceIndex, this)

            for (let i = 0; i < outputArray.length; i++) {
                for (let j = 0; j < outputArray[i].length; j++) {
                    outputArray[i][j].style.backgroundColor = "rgba(0, 0, 0, 0)"
                    let x = j - 1
                    let y = i - 2
                    if (piece.relativeCoords.some(c => c.x == x && c.y == y)) {
                        outputArray[i][j].style.backgroundColor = pieceColors[piece.pieceIndex]
                    }
                }
            }
        }

        hold() {
            if (this.holdPieceIndex === null) {
                this.holdPieceIndex = this.currFallingPiece.pieceIndex
                this.pieces.splice(this.pieces.indexOf(this.currFallingPiece), 1)
                return
            } else {
                let temp = this.currFallingPiece.pieceIndex
                this.pieces.splice(this.pieces.indexOf(this.currFallingPiece), 1)
                this.spawnPiece(this.holdPieceIndex)
                this.holdPieceIndex = temp
            }
        }

        draw() {
            this.clearCanvas()
            for (let piece of this.pieces)
                piece.draw(this)
            for (let i = 0; i < FIELD_HEIGHT; i++) {
                for (let j = 0; j < FIELD_WIDTH; j++) {
                    let value = this.canvas[i][j]
                    this.drawPixel(new Vector2d(j, i), value)
                }
            }

            this.drawSidepanel(this.pieceQueue[0], this.nextPieceOutputs)
            this.drawSidepanel(this.holdPieceIndex, this.holdPieceOutputs)

            this.scoreOutput.textContent = this.score
        }

    }

    let game = new TetrisGame()

    function onkeydown(keycode, e) {
        if (keycode == "ArrowLeft") {
            game.currFallingPiece.moveSide(-1)
            game.draw()
        } else if (keycode == "ArrowRight") {
            game.currFallingPiece.moveSide(1)
            game.draw()
        } else if (keycode == "ArrowDown") {
            game.update()
            game.draw()
            if (e)
                e.preventDefault()
        } else if (keycode == "ArrowUp") {
            game.currFallingPiece.rotate()
            game.draw()
            if (e)
                e.preventDefault()
        } else if (keycode == "h" || keycode == "HOLD") {
            game.hold()
            game.draw()
            if (e)
                e.preventDefault()
        }
    }

    let keyListener = addEventListener("keydown", (e) => {
        if (game.running == false)
            return

        if (e.key == "c" && e.ctrlKey) {
            removeEventListener("keydown", keyListener)
            game.running = false
        }

        if (game.anyPieceFalling() == false)
            return

        onkeydown(e.key, e)
    })

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout([
            [null, "↑", null],
            ["←", "↓", "→"],
            ["HOLD"],
            ["STRG+C"]
        ])

        terminal.mobileKeyboard.onkeydown = (e, keycode) => {
            onkeydown(keycode)
        }
    }

    terminal.scroll()
    while (game.running) {
        game.update()
        game.draw()
        await sleep(game.intervalTime)
    }

    terminal.printLine(`Game over! Your score was ${game.score}`)

    await HighscoreApi.registerProcess("tetris")
    await HighscoreApi.uploadScore(game.score)

}, {
    description: "play a classic game of tetris",
    isGame: true
})
// ------------------- tictactoe.js --------------------
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
// ------------------- time.js --------------------
terminal.addCommand("time", async function(args) {
    const output = terminal.print("", undefined, {forceElement: true})
    output.style.fontSize = args.size + "em"
    output.style.paddingTop = "0.5em"
    output.style.paddingBottom = "0.5em"
    output.style.display = "inline-block"
    
    let startTime = 0
    if (args.start) {
        startTime = Date.now()
    }

    function makeTimeString() {
        let ms = Date.now() - startTime

        if (!args.start) {
            let offset = new Date().getTimezoneOffset()
            // offset is given in -minutes
            ms -= offset * 60 * 1000
        }

        const milliseconds = ms % 1000
        const seconds = Math.floor(ms / 1000) % 60
        const minutes = Math.floor(ms / 1000 / 60) % 60
        const hours = Math.floor(ms / 1000 / 60 / 60) % 24

        const p = (num, len=2) => {
            return num.toString().padStart(len, "0")
        }

        return `${p(hours)}:${p(minutes)}:${p(seconds)}${args.m ? `:${p(milliseconds, 3)}` : ""}`
    }

    let running = true

    function update() {
        output.textContent = makeTimeString()
        if (running)
            terminal.window.requestAnimationFrame(update)
    }

    update()

    terminal.onInterrupt(() => {
        running = false
    })

    output.textContent = makeTimeString()

    while (running) {
        await terminal.sleep(100)
    }

}, {
    description: "Shows the current time.",
    args: {
        "?m=show-milli:b": "Show milliseconds.",
        "?f=size:n:0.1~99": "Font size in em.",
        "?s=start:b": "Start a stopwatch.",
    },
    defaultValues: {
        size: 3,
    }
})
// ------------------- timer.js --------------------
terminal.addCommand("timer", async function(rawArgs) {
    let words = rawArgs.split(" ").filter(w => w.length > 0)
    let ms = 0
    for (let word of words) {
        if (/^[0-9]+s$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 1000
        } else if (/^[0-9]+m$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 60 * 1000
        } else if (/^[0-9]+h$/.test(word)) {
            ms += parseInt(word.slice(0, -1)) * 60 * 60 * 1000
        } else {
            throw new Error(`Invalid time '${word}'`)
        }
    }

    if (ms == 0) {
        terminal.printLine("An example time could be: '1h 30m 20s'")
        throw new Error("Invalid time!")
    }

    const progressBarWidth = 30

    class Timer {

        firstPrint() {
            terminal.printLine("+" + "-".repeat(progressBarWidth) + "+")
            terminal.print("|")
            this.progressOutput = terminal.print("", undefined, {forceElement: true})
            terminal.printLine("|")
            terminal.printLine("+" + "-".repeat(progressBarWidth) + "+")
            this.timeLeftOutput = terminal.print("", undefined, {forceElement: true})
            terminal.addLineBreak()
        }

        constructor() {
            this.progressOutput = null
            this.timeLeftOutput = null

            this.startTime = Date.now()
            this.endTime = this.startTime + ms
            this.firstPrint()
            this.running = true
            this.interval = setInterval(this.update.bind(this), 100)
        }

        update() {
            if (!this.running) return

            let timeLeft = this.endTime - Date.now()
            if (timeLeft <= 0) {
                this.stop()
            } else {
                let seconds = Math.floor(timeLeft / 1000) % 60
                let minutes = Math.floor(timeLeft / (60 * 1000)) % 60
                let hours = Math.floor(timeLeft / (60 * 60 * 1000))
                this.timeLeftOutput.textContent = `Time left: ${hours}h ${minutes}m ${seconds}s`
                let progressCount = Math.floor((progressBarWidth * (ms - timeLeft)) / ms)
                let percent = Math.floor((100 * (ms - timeLeft)) / ms)
                let progress = stringPadMiddle(`${percent}%`, progressCount, "=")
                this.progressOutput.textContent = stringPadBack(progress, progressBarWidth, " ")
            }
        }

        async alarm() {
            let frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5]
            let duration = 100

            for (let i = 0; i < 2; i++) {
                for (let freq of frequencies) {
                    await playFrequency(freq, duration)
                }

                for (let freq of frequencies.reverse()) {
                    await playFrequency(freq, duration)
                }
            }
        }

        stop() {
            if (!this.running) return
            clearInterval(this.interval)
            this.running = false
            this.alarm()
            this.timeLeftOutput.textContent = "Time's up!"
            this.progressOutput.textContent = stringPadMiddle("100%", progressBarWidth, "=")
        }

    }

    let timer = new Timer()

    while (timer.running) await sleep(100)

}, {
    description: "set a timer",
    rawArgMode: true
})


// ------------------- todo.js --------------------
function fetchWithParam(url, params) {
    let query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join("&")
    return fetch(`${url}?${query}`)
}

class TodoApi {

    static GET_LIST_API = "https://www.noel-friedrich.de/todo/api/get-list.php"
    static ADD_ITEM_API = "https://www.noel-friedrich.de/todo/api/add-item.php"
    static EDIT_ITEM_API = "https://www.noel-friedrich.de/todo/api/edit-item.php"
    static DELETE_ITEM_API = "https://www.noel-friedrich.de/todo/api/delete-item.php"
    static CHECK_ITEM_API = "https://www.noel-friedrich.de/todo/api/check-item.php"

    static async getList(owner_name) {
        let response = await fetchWithParam(TodoApi.GET_LIST_API, {
            owner_name: owner_name
        })
        return await response.json()
    }
    
    static async addItem(owner_name, text_content, due_time="-") {
        return await fetchWithParam(TodoApi.ADD_ITEM_API, {
            owner_name: owner_name,
            text_content: text_content,
            due_time: due_time
        })
    }

    static async editItem(uid, text_content) {
        return await fetchWithParam(TodoApi.EDIT_ITEM_API, {
            uid: uid,
            text_content: text_content
        })
    }

    static async deleteItem(uid) {
        return await fetchWithParam(TodoApi.DELETE_ITEM_API, {uid: uid})
    }

    static async checkItem(item_uid, checked) {
        return await fetchWithParam(TodoApi.CHECK_ITEM_API, {
            item_uid: item_uid,
            check_val: checked ? 1 : 0
        })
    }

}

terminal.addCommand("todo", async function(rawArgs) {
    let parsedArgs = TerminalParser.tokenize(rawArgs)

    const commands = {
        "list": async function(name) {
            let data = await TodoApi.getList(name)
            let formattedData = []
            for (let rawItem of data) {
                let check = (rawItem.done == 1) ? "[x]" : "[ ]"
                let due = rawItem.due_time == "-" ? "" : ` (${rawItem.due_time})`
                let item = `${rawItem.text_content}${due}`
                let uid = `#${rawItem.uid}`
                formattedData.push({
                    check: check, item: item, uid: uid
                })
            }
            if (formattedData.length == 0) {
                terminal.printLine(`No items found`)
            }
            let maxItemLength = formattedData.reduce((max, item) => Math.max(max, item.item.length), 0)
            for (let item of formattedData) {
                terminal.print(item.check, Color.COLOR_1)
                terminal.print(stringPadBack(item.item, maxItemLength + 1), Color.WHITE)
                terminal.printLine(item.uid, Color.WHITE)
            }
        },
        
        "check": async function(uid) {
            await TodoApi.checkItem(uid, true)
        },

        "uncheck": async function(uid) {
            await TodoApi.checkItem(uid, false)
        },

        "add": async function(name, text, due_date="-") {
            await TodoApi.addItem(name, text, due_date)
        },

        "edit": async function(uid, text) {
            await TodoApi.editItem(uid, text)
        },

        "delete": async function(uid) {
            await TodoApi.deleteItem(uid)
        }
    }

    const command_args = {
        "list": ["name"],
        "check": ["uid"],
        "uncheck": ["uid"],
        "add": ["name", "text", "due_date"],
        "edit": ["uid", "text"],
        "delete": ["uid"]
    }

    function showAvailableCommand(command) {
        terminal.print(`> '`, Color.COLOR_2)
        terminal.print(`$ todo ${command} ${command_args[command].map(a => `<${a}>`).join(" ")}`, Color.WHITE)
        terminal.printLine(`'`, Color.COLOR_2)
    }

    function showAvailableCommands() {
        terminal.print(`'`, Color.COLOR_2)
        terminal.print(`$ todo `, Color.WHITE)
        terminal.print(`<command> [args...]`, Color.COLOR_1)
        terminal.printLine(`'`, Color.COLOR_2)
        for (let [command, _] of Object.entries(command_args)) {
            showAvailableCommand(command)
        }
    }

    if (parsedArgs.length == 0 || (parsedArgs.length == 1 && parsedArgs[0] == "help")) {
        terminal.printLine(`You must supply at least 1 argument:`)
        showAvailableCommands()
        return
    }

    let command = parsedArgs[0]
    let args = parsedArgs.slice(1)

    if (!(command in commands)) {
        terminal.printLine(`Unknown command! Available commands:`)
        showAvailableCommands()
        return
    }

    if (args.length != command_args[command].length) {
        terminal.printLine(`Invalid number of arguments!`)
        showAvailableCommand(command)
        return
    }

    await commands[command](...args)
}, {
    description: "manage a todo list",
    rawArgMode: true
})
// ------------------- touch.js --------------------
terminal.addCommand("touch", async function(args) {
    if (!terminal.isValidFileName(args.filename))
        throw new Error("Invalid filename")
    if (terminal.fileExists(args.filename))
        throw new Error("File already exists")
    if (args.filename.endsWith(".url"))
        var newFile = new ExecutableFile("")
    else
        var newFile = new TextFile("")
    terminal.currFolder.content[args.filename] = newFile
    await terminal.fileSystem.reload()
}, {
    description: "create a file in the current directory",
    args: {
        "filename": "the name of the file"
    }
})


// ------------------- turing.js --------------------
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
    
    exportLinear() {
		return [
			this.newContent,
			this.direction,
			this.newState
		]
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
    
    exportInstructionsLinear() {
		let result = {}
		for (let [key1, tempVal1] of Object.entries(this.instructions)) {
			let tempResult = {}
			for (let [key2, tempVal2] of Object.entries(tempVal1)) {
				tempResult[key2] = tempVal2.exportLinear()
			}
			result[key1] = tempResult
		}
		return JSON.stringify(result)
	}

    constructor(code, {
        startState="0",
        startTapeContent="",
        standardTapeContent="_",
        maxSteps=100000
    }={}) {
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
        this.draw()
    }
    
    compile(maxTapeSize=10000) {
		let code = ""
		let startIndex = ~~(maxTapeSize/2)
		const writeLine = l => code += l + "\n"
		writeLine(`onmessage = () => {`)
		writeLine(`  const states = ${this.exportInstructionsLinear()};`)
		writeLine(`  let index = ${startIndex};`)
		writeLine(`  let tape = Array.from(Array(${maxTapeSize})).fill("${this.standardTapeContent}");`)
		for (let i = 0; i < this.tape.length; i++) {
			let tapeContent = this.tape[i]
			writeLine(`  tape[${startIndex + i}] = "${tapeContent}";`)
		}
		writeLine(`  let state = ${this.state};`)
        writeLine(`  let i = 0;`)
        writeLine(`  let start = performance.now();`)
		writeLine(`  for (;; i++) {`)
		writeLine(`     const instructs = states[state];`)
		writeLine(`     if (!instructs) break;`)
		writeLine(`     let instruction = instructs[tape[index]] ?? instructs["*"];`)
		writeLine(`     if (!instruction) break;`)
		writeLine(`     if (instruction[0] != "*")`)
		writeLine(`       tape[index] = instruction[0];`)
		writeLine(`     index += instruction[1];`)
		writeLine(`     state = instruction[2];`)
		writeLine(`     if (i >= ${this.maxSteps}) break;`)
		writeLine(`  }`)
        writeLine(`  let ms = performance.now() - start;`)
		writeLine(`  const output = tape.filter(t => t != "${this.standardTapeContent}").join("");`)
		writeLine(`  postMessage([output, i, ms]);`)
		writeLine(`}`)
		return code
	}
	
	async executeCompiled(code) {
		const blob = new Blob([code], {type: 'application/javascript'})
		let worker = new Worker(URL.createObjectURL(blob))
		let running = true
		worker.onmessage = e => {
            let [output, steps, ms] = e.data
            terminal.printLine(`Finished ${steps} steps in ${ms.toFixed(2)}ms.`)
			terminal.printLine(output)
			worker.terminate()
			running = false
		}
		worker.postMessage("")
		let i = 0
		while (running) {
			i++
			if (i == 10) {
				terminal.printLine("This may take a bit...")
			}
			await sleep(100)
		}
	}

    draw() {
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
        maxSteps: args.maxSteps
    })
    
    if (machine.errors.length > 0) {
        machine.errors[0].print()
        return
    }

    terminal.machine = machine
    
    if (args.turbo) {
		let compiledJS = machine.compile()
		await machine.executeCompiled(compiledJS)
		return
	}

    machine.firstDraw()
	terminal.scroll()
    while (true) {
        await terminal.sleep(args.s)
        if (!machine.step()) {
            if (machine.errors.length > 0)
                machine.errors[0].print()
            break
        }
        machine.draw()
    }
    machine.draw()
    
}, {
    description: "run a turing machine file",
    args: {
        "file": "file to run",
        "?t=startTape": "starting tape content",
        "?s=sleep:i:0~10000": "sleep time between steps (in ms)",
        "?d=startingState": "starting state",
        "?m=maxSteps:i:0~9999999999": "maximum number of steps to run",
        "?turbo:b": "run as fast as possible",
    },
    standardVals: {
        startTape: "",
        s: 100,
        d: "0",
        m: 100000,
    }
})

// ------------------- turtlo.js --------------------
terminal.addCommand("turtlo", async function(args) {
    await terminal.modules.load("turtlo", terminal)
    terminal.modules.turtlo.spawn({size: args.size, silent: args.silent})
}, {
    description: "spawn turtlo",
    args: {
        "?size:i:1~3": "size of turtlo",
        "?silent:b": "don't print anything"
    },
    defaultValues: {
        size: 1
    }
})
// ------------------- type-test.js --------------------
// 1000 words randomly chosen from a list of 10000 most common english words
// source: https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt
const englishWords = [
    "spokesman", "slots", "man", "targets", "plymouth", "sec", "reflects", "constitutional", "hereby", "progressive", "rss", 
    "authors", "secrets", "basically", "wild", "beautiful", "theatre", "cry", "vhs", "fraction", "breakfast", "meal", "far", 
    "out", "glow", "literally", "specialist", "touch", "coastal", "ala", "ingredients", "medal", "adsl", "extract", "corresponding", 
    "twelve", "wizard", "micro", "cartoon", "steering", "moved", "inspection", "jul", "jpeg", "cet", "christopher", "index", 
    "value", "initially", "motivated", "threads", "friends", "worldwide", "frontier", "intense", "exp", "proprietary", "loaded", 
    "otherwise", "spider", "civilian", "detect", "tulsa", "closely", "trick", "expenditure", "responses", "deleted", "pubmed", 
    "listening", "thrown", "rosa", "relief", "magical", "thickness", "zone", "prot", "lectures", "prove", "published", "crap", 
    "allah", "dimensions", "panties", "perl", "ricky", "front", "tradition", "favourites", "naples", "sleep", "anime", "litigation", 
    "gdp", "introduces", "classical", "ntsc", "breeds", "city", "casey", "printable", "radar", "spend", "signed", "claimed", 
    "louisville", "anymore", "accident", "which", "crossword", "evening", "iran", "matters", "justice", "sarah", "textbook", 
    "silly", "follows", "iraqi", "butts", "discrete", "pod", "afraid", "error", "homeless", "tracker", "optimize", "infected", 
    "side", "adobe", "nice", "knock", "clinic", "diana", "reputation", "representation", "lyric", "compensation", "std", 
    "uploaded", "possess", "balls", "bon", "until", "info", "legs", "section", "lodging", "gallery", "allows", "attachments", 
    "mini", "mighty", "characterized", "mit", "restore", "swiss", "profiles", "herald", "henderson", "bedford", "peru", "jerry", 
    "movements", "condos", "asn", "annotation", "expand", "electron", "photoshop", "inquire", "anybody", "clip", "formed", 
    "processes", "casa", "cassette", "part", "inch", "difference", "dump", "carter", "knows", "undertake", "twisted", "were", 
    "rover", "versions", "farmers", "cartridges", "permit", "wolf", "decimal", "millions", "republic", "promotions", "photographers", 
    "unlock", "mono", "deck", "boots", "repair", "varieties", "sophisticated", "impacts", "liberal", "investment", "training", 
    "republicans", "fifth", "actor", "skating", "acts", "operated", "clear", "swaziland", "dylan", "nation", "aud", "bizrate", 
    "harm", "approaches", "martin", "confused", "pharmaceutical", "viking", "tunisia", "howto", "viagra", "conceptual", "downtown", 
    "geek", "fell", "observations", "managed", "select", "outer", "calculator", "barriers", "attributes", "rules", "spy", 
    "close", "foul", "wheels", "warrior", "bandwidth", "compressed", "bond", "creature", "minor", "mysql", "tuition", "invitations", 
    "elsewhere", "girls", "identical", "captured", "corporation", "ellis", "fifteen", "cds", "culture", "teeth", "frozen", 
    "rugs", "explained", "pop", "deutsch", "replace", "regulation", "against", "prominent", "higher", "arena", "commonly", 
    "int", "sucks", "equations", "enjoying", "marcus", "assembled", "denmark", "edinburgh", "purchasing", "printer", "puts", 
    "delivered", "oaks", "implement", "controller", "pets", "numerous", "celebs", "actors", "lottery", "biographies", "surprising", 
    "situated", "design", "penalties", "sheer", "insert", "craps", "report", "endorsement", "manage", "award", "medicines", 
    "degree", "farm", "skin", "tongue", "flight", "upload", "jessica", "portuguese", "activities", "bound", "mongolia", "internship", 
    "three", "boys", "spray", "tests", "ppc", "shades", "consequence", "institute", "wang", "poly", "pins", "notion", "ever", 
    "starting", "yea", "somehow", "visibility", "surplus", "seeing", "noble", "andrea", "applied", "mpg", "ear", "normal", 
    "victoria", "necessity", "never", "juvenile", "bhutan", "techniques", "temple", "qualification", "trial", "carolina", 
    "potential", "diagnosis", "butter", "ant", "belt", "titles", "consideration", "unexpected", "evanescence", "sunrise", 
    "gone", "opportunity", "resort", "occurrence", "dictionaries", "amp", "commissioners", "atlantic", "von", "scanner", 
    "worn", "hollywood", "corporations", "documentary", "shift", "ambien", "hobby", "organisations", "poet", "oliver", "weekly", 
    "dover", "eddie", "particular", "mark", "permitted", "wallpaper", "output", "wage", "donna", "hammer", "spirit", "university", 
    "licensed", "girl", "thumbzilla", "navy", "blogger", "poem", "descending", "powder", "cad", "website", "graphical", "root", 
    "needed", "printed", "recreational", "ordered", "mounting", "arcade", "dictionary", "lately", "computer", "responded", 
    "much", "saves", "street", "modified", "pretty", "denied", "happy", "pose", "mice", "desert", "package", "rewards", "than", 
    "pickup", "instantly", "relatives", "flooring", "better", "cycle", "indie", "leg", "health", "magnificent", "hacker", 
    "databases", "classics", "translator", "ian", "shine", "assignment", "verify", "chevrolet", "vendors", "applicants", 
    "legislation", "prozac", "beta", "blend", "soup", "perfect", "midwest", "matter", "kathy", "snake", "treo", "features", 
    "howard", "discounted", "probably", "patient", "polyphonic", "shoot", "ram", "thousands", "couples", "gabriel", "dense", 
    "plugins", "alumni", "terrorism", "parental", "deer", "build", "counted", "tokyo", "taylor", "promotion", "sensitive", 
    "improved", "ultimate", "alloy", "scroll", "iceland", "knife", "featuring", "nodes", "helmet", "maintained", "male", 
    "adults", "logical", "kenneth", "sticker", "band", "sciences", "mild", "holders", "stable", "singapore", "recipients", 
    "rolling", "ranked", "wheat", "main", "slovenia", "severe", "handles", "forecasts", "stephen", "fabric", "presence", 
    "mediawiki", "slope", "situations", "displays", "api", "sympathy", "manga", "straight", "obtaining", "preferred", "locking", 
    "performance", "guarantees", "approval", "davis", "activation", "calcium", "coal", "raises", "sql", "characteristics", 
    "behavioral", "sri", "reached", "takes", "reflect", "linear", "poverty", "canvas", "controversial", "drink", "cashiers", 
    "meals", "enables", "shortcuts", "budgets", "articles", "altered", "valve", "sex", "accessories", "advice", "countries", 
    "indicators", "unfortunately", "budapest", "vacancies", "argue", "den", "potter", "victor", "able", "dealtime", "idle", 
    "tax", "lucky", "reservations", "along", "spouse", "funding", "pre", "wound", "job", "exploring", "threatening", "ceo", 
    "scores", "stages", "combinations", "would", "dayton", "satisfied", "seemed", "gratuit", "miracle", "poor", "abortion", 
    "interaction", "developer", "original", "vbulletin", "trail", "wait", "lawyer", "pressure", "hint", "estimates", "arranged", 
    "bye", "sim", "therapy", "commercial", "ghost", "withdrawal", "finishing", "whereas", "vocal", "began", "shape", "language", 
    "forty", "told", "thinks", "rent", "patents", "chem", "asset", "officials", "drove", "deutsche", "central", "bargain", 
    "arbitration", "pull", "females", "ball", "chi", "compact", "path", "disorder", "revolution", "marie", "cemetery", "earliest", 
    "direction", "slide", "books", "consequently", "gourmet", "sports", "bite", "material", "nickname", "verzeichnis", "interim", 
    "burning", "caroline", "titten", "addition", "juice", "oscar", "measures", "pharmacology", "assumes", "professor", "adjustments", 
    "yeast", "monte", "magazines", "blessed", "partially", "whole", "reform", "distinction", "annex", "arm", "usage", "sen", 
    "buried", "stuffed", "continues", "game", "inf", "minimum", "inquiry", "visits", "kim", "campaigns", "album", "teen", 
    "ethical", "sic", "architecture", "judge", "nursery", "half", "textile", "mambo", "politicians", "offline", "you", "consistency", 
    "refused", "crimes", "cruz", "maintains", "prepare", "beatles", "manor", "things", "standard", "adaptation", "cons", 
    "market", "crops", "chuck", "configure", "scheme", "platforms", "obvious", "atm", "wants", "guides", "statewide", "goods", 
    "supported", "tennessee", "chaos", "zum", "rights", "hamburg", "bachelor", "infant", "take", "espn", "died", "decision", 
    "importantly", "defining", "wallpapers", "prep", "sept", "sapphire", "careful", "albany", "holly", "liberty", "appropriations", 
    "depends", "heavily", "shemales", "undergraduate", "relaxation", "injury", "placement", "stress", "day", "recipient", 
    "achieving", "header", "explanation", "figures", "grove", "amd", "currently", "grenada", "congo", "immigrants", "newark", 
    "strings", "protein", "xerox", "lung", "spending", "donation", "inter", "belly", "product", "tent", "instead", 
    "css", "fuzzy", "observed", "leasing", "several", "moldova", "remove", "complaint", "correct", "accountability", "bolt", 
    "second", "serial", "wrapped", "screw", "sake", "tasks", "recommend", "spring", "bad", "grants", "ken", "illustration", 
    "upgrades", "chronicles", "agencies", "missile", "limits", "varying", "laundry", "emission", "bow", "honey", "expenditures", 
    "library", "xxx", "merit", "selections", "wearing", "differently", "forests", "pounds", "restrict", "containing", "apnic", 
    "florence", "other", "ddr", "interracial", "initiated", "ins", "units", "attempt", "ran", "railroad", "appearance", "over", 
    "trials", "paint", "performs", "deborah", "tears", "merely", "none", "realtors", "ryan", "gpl", "def", "queens", "jewish", 
    "receive", "cables", "tuner", "intelligent", "louis", "beds", "restricted", "gangbang", "earth", "internet", "best", 
    "master", "screensavers", "continuity", "swift", "luis", "iso", "shall", "jane", "fool", "posts", "different", "teacher", 
    "manual", "scholarships", "mad", "clearing", "improvements", "lancaster", "federation", "nut", "ceiling", "furnishings", 
    "twice", "concepts", "francis", "give", "licenses", "down", "context", "scored", "deficit", "dos", "demands", "spam", 
    "tom", "suggest", "bind", "rich", "perspective", "thanksgiving", "dave", "metallica", "greece", "translation", "adventure", 
    "rail", "plaza", "stability", "chart", "paperback", "component", "abuse", "tel", "daniel", "backing", "feelings", "rid", 
    "skills", "reed", "filled", "voyeurweb", "proceeds", "ministries", "delivering", "departments", "deployment", "framing", 
    "pan", "contacting", "shakespeare", "retained", "remedy", "answer", "denial", "events", "opens", "integral", "tried", 
    "recorded", "fallen", "accurately", "coupons", "sending", "levy", "hot", "ppm", "commands", "hosts", "wireless", "above", 
    "thriller", "off", "forecast", "fundamental", "thanks", "harbor", "dark", "manner", "usb", "instance", "imagine", "bridge", 
    "tigers", "cigarettes", "deviant", "include", "fame", "qualifying", "distant", "minds", "trainer", "wonderful", "involving", 
    "visit", "chorus", "prediction", "associate", "threats", "contributor", "restaurant", "strategies", "postage", "sounds", 
    "watching", "die", "demonstrated", "florist", "transition", "greatest", "harper", "oem", "postal", "format", "playstation", 
    "blowing", "graphs"
]

terminal.addCommand("type-test", async function(args) {
    await terminal.modules.import("game", window)

    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ "
    
    function generateText(length) {
        let chosenWords = []
        let chosenWordChars = 0
        while (chosenWordChars < length) {
            let word = englishWords[Math.floor(Math.random() * englishWords.length)]
            if (chosenWords.includes(word)) {
                continue
            }
            chosenWords.push(word)
            chosenWordChars += word.length
        }

        return chosenWords.join(" ").slice(0, length).toUpperCase()
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

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout([
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
            ["Z", "X", "C", "V", "B", "N", "M"],
            ["Space"],
            ["STRG+C"]
        ])

        terminal.mobileKeyboard.onkeydown = (e, key) => {
            let upperKey = key.toUpperCase()
            if (upperKey == "SPACE") upperKey = " "
            if (chars.includes(upperKey)) {
                let success = upperKey == text[typeIndex]
                advanceCharIndex(success)
            }
        }
    }
    
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
// ------------------- uname.js --------------------
terminal.addCommand("uname", function() {
    terminal.printLine("NOELOS OS 1.0.5")
}, {
    description: "print the operating system name"
})


// ------------------- upload.js --------------------
terminal.addCommand("upload", async function() {
    await terminal.modules.load("upload", terminal)
    try {
        var [fileName, fileContent, isDataURL] = await terminal.modules.upload.file()
    } catch (e) {
        throw new Error("File Upload Failed")
    }
    let construct = TextFile
    if (isDataURL) {
        construct = DataURLFile
    }
    if (terminal.fileExists(fileName))
        throw new Error("file already exists in folder")
    const file = new (construct)(fileContent)

    const fileSize = file.computeSize()

    terminal.currFolder.content[fileName] = file
    terminal.printLine(`upload finished (${fileSize / 1000}kb)`)
    await terminal.fileSystem.reload()
}, {
    description: "upload a file from your computer"
})


// ------------------- vigenere.js --------------------
terminal.addCommand("vigenere", async function(args) {
    const getCharValue = char => char.toLowerCase().charCodeAt(0) - 97
    const getCharFromValue = value => String.fromCharCode(value + 97)
    
    if (!/^[a-zA-Z\s]+$/.test(args.message))
        throw new Error("message must only contain letters and spaces")
    else if (!/^[a-zA-Z]+$/.test(args.key))
        throw new Error("key must only contain letters")

    let output = ""

    Array.from(args.message).forEach((character, i) => {
        if (/[a-zA-Z]/.test(character)) {
            let charValue = getCharValue(character)
            let keyValue = getCharValue(args.key[i % args.key.length])
            let newValue = (charValue + keyValue) % 26
            if (args.d)
                newValue = (charValue - keyValue + 26) % 26
            output += getCharFromValue(newValue)
        } else {
            output += character
        }
    })

    terminal.printLine(output)

    if (args.c) {
        await terminal.copy(output, {printMessage: true})
    }
}, {
    description: "encrypt/decrypt a message using the vigenere cipher",
    args: {
        "message": "the message to encrypt/decrypt",
        "key": "the key to use",
        "?d=decrypt:b": "decrypt the message instead of encrypting it",
        "?c=copy:b": "copy the result to the clipboard"
    },
})


// ------------------- visits.js --------------------
terminal.addCommand("visits", async function(args) {
    let visits = await fetch(
        "api/get_visit_count.php"
    ).then(response => response.text())
    terminal.printLine(`This page has been visited ${visits} times since implementing the visit-count.`)
}, {
    "description": "Shows the number of page visits",
})
// ------------------- w.js --------------------
terminal.addCommand("w", function() {
    terminal.printLine("USER   TIME_ELAPSED")
    terminal.print("root   ", Color.COLOR_1)
    terminal.printLine(((Date.now() - terminal.startTime) / 1000) + "s")
}, {
    description: "print the current time elapsed"
})


// ------------------- wave.js --------------------
terminal.addCommand("wave", async function() {
    await terminal.modules.load("window", terminal)
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../wave/",
        name: "Wave Simulator"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })

    while (true) await sleep(100)
}, {
    description: "play with a wave"
})
// ------------------- wc.js --------------------
terminal.addCommand("wc", function(args) {
    let text = ""
    if (args.s) {
        text = args.s
        if (args.f) {
            terminal.printLine("Ignoring file argument")
        }
    } else if (args.f) {
        let file = terminal.getFile(args.f)
        if (file.type == FileType.FOLDER) {
            throw new Error("Cannot read file of type FOLDER")
        }
        text = file.content
    } else {
        throw new Error("Either String or File must be provided")
    }

    let fileInfos = {
        "lines": text.split("\n").length,
        "words": text.split(" ").length,
        "characters": text.length
    }
    for (let [infoName, infoContent] of Object.entries(fileInfos)) {
        terminal.print(infoContent + " ", Color.COLOR_1)
        terminal.printLine(infoName)
    }
}, {
    description: "display word and line count of file",
    args: {
        "?f=file": "file to open",
        "?s": "string to count instead of file"
    }
})


// ------------------- weather.js --------------------
terminal.addCommand("weather", async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude: lat, longitude: lon } = position.coords;

    terminal.printLine("Getting weather data for your location...");

    const response = await fetch(
      `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`
    );

    const {
      sources: [{ station_name }],
      weather: { temperature, icon },
    } = await response.json();

    const weatherIcons = {
      "clear-day": "☀️",
      "clear-night": "🌙",
      "partly-cloudy-day": "⛅",
      "partly-cloudy-night": "⛅",
      cloudy: "☁️",
      fog: "🌫️",
      wind: "🌬️",
      rain: "🌧️",
      sleet: "🌨️",
      snow: "❄️",
      hail: "🌨️",
      thunderstorm: "⛈️",
      null: "",
    };

    terminal.printLine(
      `Current weather near ${station_name}: ${temperature}°C, ${
        weatherIcons[icon]
      }`
    );
  } catch {
    terminal.printError("Failed to get weather data.");
  }
}, {
  description: "Get the current weather",
  author: "Colin Chadwick"
})
// ------------------- whatday.js --------------------
terminal.addCommand("whatday", function(args) {

    function dayToStr(n) {
        return [
            "first", "second", "third", "fourth",
            "fifth", "sixth", "seventh", "eigth",
            "ninth", "tenth", "eleventh", "twelfth",
            "thirteenth", "fourteenth", "fifteenth",
            "sixteenth", "seventeenth", "eighteenth",
            "nineteenth", "twentyth", "twentyfirst",
            "twentysecond", "twentythird", "twentyfourth",
            "twentyfifth", "twentysixth", "twentyseventh",
            "twentyeighth", "twentyninth", "thirtieth",
            "thirtyfirst"
        ][n - 1]
    }

    function yearToStr(n) {
        if (n == 0) return "zero"
        let out = ""
        if (n < 0) {
            out += "minus "
            n *= -1
        }
        function twoDigitNumStr(n) {
            const n1s = [
                "", "one", "two", "three", "four", "five",
                "six", "seven", "eight", "nine", "ten",
                "eleven", "twelve", "thirteen", "fourteen",
                "fifteen"
            ], n2s = [
                "", "", "twenty", "thirty", "fourty",
                "fifty", "sixty", "seventy", "eighty",
                "ninety"
            ]
            if (n1s[n]) return n1s[n]
            let n1 = n % 10
            let n2 = parseInt((n - n1) / 10)
            let out = ""
            out += n2s[n2]
            out += n1s[n1]
            if (n2 == 1) {
                out += "teen"
            }
            return out
        }
        if (String(n).length == 1) {
            return out + twoDigitNumStr(n)
        }
        if (String(n).length == 2) {
            return out + twoDigitNumStr(n)
        }
        if (String(n).length == 3) {
            let n1 = String(n)[0]
            let n2 = String(n).slice(1, 3)
            return out + twoDigitNumStr(n1) + "hundred" + twoDigitNumStr(n2)
        }
        if (String(n).length == 4) {
            let n1 = String(n).slice(0, 2)
            let n2 = String(n).slice(2, 4)
            return out + twoDigitNumStr(n1) + "-" + twoDigitNumStr(n2)
        } 
    }

    const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ], monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ]

    let dateStr = args["DD.MM.YYYY"]

    function dateEq(d1, d2) {
        return (d1.getFullYear() == d2.getFullYear()
        && d1.getMonth() == d2.getMonth()
        && d1.getDate() == d2.getDate())
    }

    function sayDay(date) {
        let day = dayToStr(date.getDate())
        let month = monthNames[date.getMonth()].toLowerCase()
        let year = yearToStr(date.getFullYear())
        let dayName = dayNames[date.getDay()].toLowerCase()
        if (dateEq(new Date(), date)) {
            terminal.printLine(`today is a ${dayName}`)
        } else {
            if (new Date() > date) {
                terminal.printLine(`the ${day} of ${month} of the year ${year} was a ${dayName}`)
            } else {
                terminal.printLine(`the ${day} of ${month} of the year ${year} will be a ${dayName}`)
            }
        }
    }

    if (dateStr.toLowerCase() == "t" || dateStr.toLowerCase() == "today") {
        sayDay(new Date())
        return
    } else if (/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,4}$/.test(dateStr)) {
        let [d, m, y] = dateStr.split(".").map(i => parseInt(i))
        let date = new Date()
        date.setFullYear(y, m - 1, d)
        if (date.getDate() != d || (date.getMonth() + 1) != m || date.getFullYear() != y) {
            throw new Error("Invalid day - doesn't exist.")
        }
        sayDay(date)
    } else {
        terminal.printLine("Date-Format: DD:MM:YYYY, e.g. 01.01.1970")
        throw new Error(`Invalid date: ${dateStr}`)
    }
    
}, {
    description: "get the weekday of a date",
    args: ["DD.MM.YYYY"]
})


// ------------------- whatis.js --------------------
terminal.addCommand("whatis", async function(args) {
    if (args.command == "*") {
        let maxFuncLength = terminal.visibleFunctions.reduce((p, c) => Math.max(p, c.name.length), 0)
        let functions = [...terminal.visibleFunctions].sort((a, b) => a.name.localeCompare(b.name))
        for (let func of functions) {
            let funcStr = stringPadBack(func.name, maxFuncLength)
            terminal.printCommand(funcStr, func.name, Color.WHITE, false)
            terminal.printLine(`  ${func.description}`)
        }
        return
    }

    if (args.command == "whatis")
        throw new Error("Recursion.")

    if (!terminal.commandExists(args.command))
        throw new Error(`command not found: ${args.command}`)

    let func = await terminal.loadCommand(args.command)
    terminal.printLine(`${func.name}: ${func.description}`)
}, {
    description: "display a short description of a command",
    args: ["command"]
})
// ------------------- whoami.js --------------------
terminal.addCommand("whoami", async function() {
    terminal.printLine("fetching data...")

    function capitalize(str) {
        return str[0].toUpperCase() + str.slice(1)
    }

    const infos = {
        Localtime: new Date().toLocaleString(),
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        Pageon: window.location.pathname,
        Referrer: document.referrer,
        PreviousSites: history.length,
        BrowserVersion1a: navigator.appVersion,
        BrowserVersion1b: navigator.userAgent,
        BrowserLanguage: navigator.language,
        BrowserOnline: navigator.onLine,
        BrowserPlatform: navigator.platform,
        JavaEnabled: navigator.javaEnabled(),
        DataCookiesEnabled: navigator.cookieEnabled,
        ScreenWidth: screen.width,
        ScreenHeight: screen.height,
        WindowWidth: innerWidth,
        WindowHeight: innerHeight,
        AvailWidth: screen.availWidth,
        AvailHeights: screen.availHeight,
        ScrColorDepth: screen.colorDepth,
        ScrPixelDepth: screen.pixelDepth,
    }

    try {
        let response = await (await fetch("https://api.db-ip.com/v2/free/self")).json()
        for (let [key, value] of Object.entries(response)) {
            infos[capitalize(key)] = value
        }
    } catch {}

    const longestInfoName = Math.max(...Object.keys(infos).map(k => k.length)) + 2
    for (let [infoName, infoContent] of Object.entries(infos)) {
        terminal.print(stringPadBack(infoName, longestInfoName), Color.COLOR_1)
        terminal.printLine(infoContent)
    }
}, {
    description: "get client info"
})
// ------------------- yes.js --------------------
terminal.addCommand("yes", async function(args) {
    let message = args.message
    while (true) {
        terminal.printLine(message)
        terminal.scroll("auto")
        await sleep(args.s ? 100 : 0)
    }
}, {
    description: "print a message repeatedly",
    args: {
        "?message": "the message to print",
        "?s:b": "slow mode"
    },
    standardVals: {
        message: "y"
    }
})


// ------------------- zip.js --------------------
terminal.addCommand("zip", async function() {
    await terminal.animatePrint("zip it lock it put it in your pocket")
    await terminal.animatePrint("(Sorry, this command is not yet implemented)")
    await terminal.animatePrint("It's very high on the priority list though!")
    await sleep(1000)
    await terminal.animatePrint("I promise!")
    await sleep(1000)
    await terminal.animatePrint("I'm working on it!")
    await sleep(1000)
    await terminal.animatePrint("I swear!")
    await sleep(1000)
    await terminal.animatePrint("I'm not lying!")
    await sleep(1000)
    await terminal.animatePrint("Maybe I'm lying...")
    await sleep(3000)
    await terminal.animatePrint("Zipping is hard!!")

    terminal.printEasterEgg("Zipper-Egg")

}, {
    description: "zip a file"
})


