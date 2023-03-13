terminal.addCommand("snake", async function(args) {
    await terminal.modules.import("game", window)

    const width = 30
    const height = 20
    const speed = 150 / args.s
    const startLength = 10

    const EMPTY = 0
    const SNAKE = 1
    const FOOD = 2
    const WALLY = 3
    const WALLX = 4
    const WALLC1 = 5
    const WALLC2 = 6
    let snake = [[width / 2, height / 2]]
    let direction = [1, 0]
    let snakeAlive = true

    let cells = null
    let foodPos = null
    function updateCells() {
        cells = Array.from({length: height}, () => Array.from({length: width}, () => EMPTY))
        for (let i = 0; i < width; i++) {
            cells[0][i] = WALLX
            cells[height - 1][i] = WALLX
        }
        for (let i = 0; i < height; i++) {
            cells[i][0] = WALLY
            cells[i][width - 1] = WALLY
        }
        cells[0][0] = WALLC1
        cells[0][width - 1] = WALLC2
        cells[height - 1][0] = WALLC1
        cells[height - 1][width - 1] = WALLC2
        for (let [x, y] of snake) {
            cells[y][x] = SNAKE
        }
        if (foodPos != null)
            cells[foodPos[1]][foodPos[0]] = FOOD
        return cells
    }
    updateCells()

    function makeNewFood() {
        let x = Math.floor(Math.random() * width)
        let y = Math.floor(Math.random() * height)
        if (cells[y][x] == EMPTY) {
            return [x, y]
        } else {
            return makeNewFood()
        }
    }
    foodPos = makeNewFood()

    function enlargenSnake() {
        snake.push([...snake[snake.length - 1]])
        foodPos = makeNewFood()
    }

    for (let i = 0; i < startLength; i++) {
        enlargenSnake()
    }

    function updateSnake() {
        if (moves.length > 0) {
            let newDirection = moves.shift()
            if (newDirection[0] != -direction[0] || newDirection[1] != -direction[1]) {
                direction = newDirection
            }
        }
        let newHead = [snake[0][0] + direction[0], snake[0][1] + direction[1]]
        for (let i = snake.length - 1; i >= 0; i--) {
            if (i == 0) {
                snake[i] = newHead
            } else {
                snake[i] = [...snake[i - 1]]
            }
            if (snake[i][0] >= width - 1) snake[i][0] = 1
            if (snake[i][0] <= 0) snake[i][0] = width - 2
            if (snake[i][1] >= height - 1) snake[i][1] = 1
            if (snake[i][1] <= 0) snake[i][1] = height - 2
            if (snake[i][0] == foodPos[0] && snake[i][1] == foodPos[1]) {
                enlargenSnake()
            }
        }
        for (let i = 1; i < snake.length; i++) {
            if (snake[i][0] == snake[0][0] && snake[i][1] == snake[0][1]) {
                snakeAlive = false
            }
        }
    }

    function printCells() {
        let elements = []
        for (let y = 0; y < height; y++) {
            let line = []
            for (let x = 0; x < width; x++) {
                line.push(terminal.print(" ", undefined, {forceElement: true}))
            }
            elements.push(line)
            terminal.addLineBreak()
        }
        return elements
    }

    let elements = printCells()

    let moves = []

    function draw() {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let cell = cells[y][x]
                if (cell == EMPTY) {
                    elements[y][x].innerText = ". "
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == SNAKE) {
                    elements[y][x].innerText = "# "
                    elements[y][x].style.color = "var(--accent-color-1)"
                } else if (cell == FOOD) {
                    elements[y][x].innerText = "# "
                    elements[y][x].style.color = "var(--accent-color-2)"
                } else if (cell == WALLY) {
                    elements[y][x].innerText = "| "
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == WALLX) {
                    elements[y][x].innerText = "--"
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == WALLC1) {
                    elements[y][x].innerText = "+-"
                    elements[y][x].style.color = "var(--foreground)"
                } else if (cell == WALLC2) {
                    elements[y][x].innerText = "+ "
                    elements[y][x].style.color = "var(--foreground)"
                }
            }
        }
    }

    function turnSnakeRed() {
        for (let i = 0; i < snake.length; i++) {
            elements[snake[i][1]][snake[i][0]].style.color = "var(--error-color)"
        }
    }

    terminal.printLine("Use the arrow keys to move the snake.")
    terminal.scroll()

    function onkeydown(keycode) {
        if (keycode == "ArrowUp") {
            moves.push([0, -1])
            return true
        } else if (keycode == "ArrowDown") {
            moves.push([0, 1])
            return true
        } else if (keycode == "ArrowLeft") {
            moves.push([-1, 0])
            return true
        } else if (keycode == "ArrowRight") {
            moves.push([1, 0])
            return true
        }
    }

    let listener = addEventListener("keydown", function(event) {
        if (event.repeat) return
        if (snakeAlive == false) return
        if (onkeydown(event.key)) {
            event.preventDefault()
        }
    })

    if (terminal.mobileKeyboard) {
        terminal.mobileKeyboard.updateLayout(
            terminal.mobileKeyboard.Layout.ARROWS
        )

        terminal.mobileKeyboard.onkeydown = function(e, keycode) {
            if (snakeAlive == false) return
            onkeydown(keycode)
        }
    }

    while (snakeAlive) {
        updateCells()
        updateSnake()
        draw()
        await sleep(speed)
    }

    updateCells()
    draw()
	let score = snake.length - startLength
    terminal.printLine(`You lost! Your score was ${score}.`)
    turnSnakeRed()

    removeEventListener("keydown", listener)

    await HighscoreApi.registerProcess("snake")
    await HighscoreApi.uploadScore(score)

}, {
    description: "play a game of snake",
    args: {"?s:n:1~10": "speed level of snake moving"},
    standardVals: {
        s: 2
    },
    isGame: true
})