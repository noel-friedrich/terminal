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