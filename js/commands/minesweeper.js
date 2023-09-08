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