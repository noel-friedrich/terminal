terminal.addCommand("water", async function(args) {
    const ithBitNums = Array.from({length: 32}).map((_, i) => (1 << i))

    class SmallWaterGrid {

        constructor(n, rows) {
            if (n > 32) {
                throw new Error("Maximum Size is 32")
            }

            this.n = n
            this.rows = rows ?? new Uint32Array(n)
        }

        copy() {
            return new SmallWaterGrid(this.n, this.rows.slice())
        }

        fillWithWater(x, y) {
            this.rows[y] |= ithBitNums[x]
        }

        static random(n, p=0.2) {
            const grid = new SmallWaterGrid(n)
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    if (Math.random() < p) {
                        grid.fillWithWater(x, y)
                    }
                }
            }
            return grid
        }

        isFilled(x, y) {
            return (this.rows[y] & ithBitNums[x]) !== 0
        }

        toString() {
            const topBottomLine = "+" + "-".repeat(this.n * 2 + 1) + "+"
            let outString = topBottomLine + "\n"
            for (let y = 0; y < this.n; y++) {
                outString += "|"
                for (let x = 0; x < this.n; x++) {
                    if (this.isFilled(x, y)) {
                        outString += " W"
                    } else {
                        outString += " ."
                    }
                }
                outString += " |\n"
            }
            return outString + topBottomLine
        }

        _iterationStep() {
            const rowCopy = this.rows.slice()
            let madeChange = false

            for (let y = 0; y < this.n; y++) {
                for (let x = 0; x < this.n; x++) {
                    if (rowCopy[y] & ithBitNums[x]) {
                        continue
                    }

                    let sum = 0
                    sum += (x > 0 && (rowCopy[y] & ithBitNums[x - 1]) !== 0)
                    sum += (x < this.n - 1 && (rowCopy[y] & ithBitNums[x + 1]) !== 0)
                    sum += (y > 0 && (rowCopy[y - 1] & ithBitNums[x]) !== 0)
                    sum += (y < this.n - 1 && (rowCopy[y + 1] & ithBitNums[x]) !== 0)

                    if (sum >= 2) {
                        this.rows[y] |= ithBitNums[x]
                        madeChange = true
                    }
                }
            }

            return madeChange
        }

        computeLength(makeCopy=true) {
            const grid = makeCopy ? this.copy() : this
            for (let n = 1;; n++) {
                if (!grid._iterationStep()) {
                    return n
                }
            }
        }

    }

    async function showAnimation(grid, intervalMs=200) {
        const gridCopy = grid.copy()
        const element = terminal.print("", undefined, {forceElement: true})
        element.textContent = grid.toString()
        while (gridCopy._iterationStep()) {
            element.textContent = gridCopy.toString()
            await sleep(intervalMs)
        }
    }

    async function computeMaximumLength(n, {printProgress=true, progressUpdateInterval=10_000}={}) {
        const maxNumInRow = 2 ** n
        const rows = new Uint8Array(n)
        let maxLength = 1
        const totalNum = 2 ** (n * n)
        let bestGrid = null
        const progressOutput = printProgress ? terminal.print("", undefined, {forceElement: true}) : null
        if (printProgress) {
            terminal.addLineBreak()
        }

        let i = 0
        let carry = false
        let count = 0
        while (i < n) {
            if (!carry) {
                const grid = new SmallWaterGrid(n, rows)
                const length = grid.computeLength(true)
                if (length > maxLength) {
                    maxLength = length
                    bestGrid = new SmallWaterGrid(n, rows.slice())
                }

                if (printProgress) {
                    count++
                    const percent = Math.round(count / totalNum * 10_000) / 100
                    if (count % progressUpdateInterval === 0) {
                        progressOutput.textContent = `${percent}% done`
                        await sleep(0)
                    }
                }
            }

            rows[i]++
            carry = false
            if (rows[i] >= maxNumInRow) {
                rows[i] = 0
                i++
                carry = true
            } else {
                i = 0
            }

            if (printProgress) {
                progressOutput.textContent = "Finished."
            }
        }

        return {maxLength, bestGrid}
    }

    const {maxLength, bestGrid} = await computeMaximumLength(6)
    terminal.printLine(maxLength)
    terminal.printLine(bestGrid.toString())
}, {
    description: "compute solutions to the longest water problem",
    isSecret: true
})