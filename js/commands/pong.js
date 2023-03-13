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