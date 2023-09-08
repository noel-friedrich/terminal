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