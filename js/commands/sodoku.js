terminal.addCommand("sodoku", async function(args) {
    class SodokuMap {

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

        constructor(blockSize, mapBlockSize) {
            this.blockSize = blockSize
            this.mapBlockSize = mapBlockSize
            this.blockRows = []
            for (let i = 0; i < this.mapBlockSize; i++) {
                let row = []
                for (let j = 0; j < this.mapBlockSize; j++) {
                    row.push(this._makeBlockData())
                }
                this.blockRows.push(row)
            }
            this.highlightedIndex = null
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
            for (let i = 0; i < this.blockSize * this.mapBlockSize; i++) {
                let row = []
                for (let j = 0; j < this.blockSize * this.mapBlockSize; j++) {
                    row.push(this.getNumber(j, i))
                }
                rows.push(row)
            }
            return rows
        }

        getColumns() {
            let columns = []
            for (let i = 0; i < this.blockSize * this.mapBlockSize; i++) {
                let column = []
                for (let j = 0; j < this.blockSize * this.mapBlockSize; j++) {
                    column.push(this.getNumber(i, j))
                }
                columns.push(column)
            }
            return columns
        }

        getBlocks() {
            let blocks = []
            for (let i = 0; i < this.mapBlockSize; i++) {
                for (let j = 0; j < this.mapBlockSize; j++) {
                    let block = this.getBlock(j, i)
                    blocks.push(block)
                }
            }
            return blocks
        }

        toString() {
            let outputString = ""
            let lineString = "+"
            for (let i = 0; i < this.mapBlockSize; i++) {
                lineString += "-".repeat(this.blockSize * 4 - 1) + "+"
                if (i != this.mapBlockSize - 1) {
                    lineString += "+"
                }
            }
            let thickLineString = lineString.replaceAll("-", "=")
            let rows = this.getRows()
            for (let i = 0; i < rows.length; i++) {
                if (i != 0 && i % this.blockSize === 0) {
                    outputString += thickLineString + "\n| "
                } else {
                    outputString += lineString + "\n| "
                }
                let row = rows[i]
                for (let j = 0; j < row.length; j++) {
                    let number = row[j]
                    let index = i * row.length + j
                    let isHighlightedIndex = index == this.highlightedIndex
                    if (isHighlightedIndex) {
                        outputString += "_"
                    } else if (number === undefined) {
                        outputString += " "
                    } else {
                        outputString += number
                    }
                    if (j % this.blockSize === this.blockSize - 1 && j != row.length - 1) {
                        outputString += " || " 
                    } else {
                        outputString += " | "
                    }
                }
                outputString += "\n"
            }
            outputString += lineString + "\n"
            return outputString
        }

        xyFromIndex(index) {
            let x = index % (this.blockSize * this.mapBlockSize)
            let y = Math.floor(index / (this.blockSize * this.mapBlockSize))
            return [x, y]
        }

        get maxIndex() {
            return (this.blockSize * this.mapBlockSize) ** 2
        }

        printToElement() {
            return terminal.printLine(this.toString(), undefined, {forceElement: true})
        }

        async fillFromInput() {
            await sleep(100)

            let currIndex = 0

            let listener = terminal.window.addEventListener("keydown", async event => {
                if (currIndex >= this.maxIndex) {
                    terminal.window.removeEventListener("keydown", listener)
                    return
                }
                
                let [x, y] = this.xyFromIndex(currIndex)

                if (event.key == "Backspace") {
                    if (currIndex > 0)
                        currIndex--
                    [x, y] = this.xyFromIndex(currIndex)
                    this.setNumber(x, y, undefined)
                    this.highlightedIndex = currIndex
                    event.preventDefault()
                    return
                } else if (/^[0-9]$/.test(event.key)) {
                    this.setNumber(x, y, parseInt(event.key))
                    event.preventDefault()
                } else if (event.key == "Enter" || event.key == " ") {
                    currIndex++
                    this.highlightedIndex = currIndex
                    event.preventDefault()
                    return
                } else {
                    return
                }

                currIndex++
                this.highlightedIndex = currIndex
            })

            let element = this.printToElement()

            terminal.addLineBreak()
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
            return this.blockSize * this.mapBlockSize
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
                if (i % this.mapBlockSize == this.mapBlockSize - 1 && i != blocks.length - 1) {
                    fenString += "|"
                } else if (i != blocks.length - 1) {
                    fenString += "/"
                }
            }
            return fenString
        }

        copy() {
            let newBoard = new Board(this.blockSize, this.mapBlockSize)
            newBoard.loadFEN(this.toFEN())
            return newBoard
        }

        includesConflict() {
            let options = Array.from(Array(9), (_, i) => i + 1)
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

        async solveLive(outputElement) {
            // solve using wavefunction collapse technique
            const getPossibleData = () => {
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

            const wavefunctionCollapse = async (sleepTime=100) => {
                const iterate = () => {
                    let possibleOptions = getPossibleData()
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
                    outputElement.textContent = this.toString()
                }
                return iterationResult
            }

            let originalFEN = this.toFEN()
            let waitTimes = [30, 20, 10]
            for (let i = 0; true; i++) {
                let result = await wavefunctionCollapse(waitTimes[i] ?? 0)
                if (result == "finished")
                    break

                this.loadFEN(originalFEN)
                if (i % 100 == 0)
                    await sleep(0)
            }
        }

    }

    let map = new SodokuMap(3, 3)
    let outputElement = null

    if (args.fen) {
        try {
            map.loadFEN(args.fen)
        } catch (e) {
            throw new Error("Invalid FEN string!")
        }
        outputElement = map.printToElement()
    } else {
        outputElement = await map.fillFromInput()
    }

    let conflict = map.includesConflict()
    if (conflict) {
        throw new Error("Conflict at (" + conflict.map(x => x + 1).join(", ") + "): Impossible Board!")
    }

    await map.solveLive(outputElement)
    terminal.printSuccess("Solved Sudoku puzzle successfully!")

}, {
    description: "Solve or generate a sodoku puzzle",
    args: {
        "?fen:s": "a FEN string to load",
    }
})