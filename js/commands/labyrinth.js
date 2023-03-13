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