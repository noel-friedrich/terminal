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