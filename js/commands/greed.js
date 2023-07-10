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
