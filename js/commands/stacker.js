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