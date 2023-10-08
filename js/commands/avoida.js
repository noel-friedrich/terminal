terminal.addCommand("avoida", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    let terminalWindow = terminal.modules.window.make({
        name: "Avoida Game", fullscreen: true, removeBar: true
    })

    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT
    const xResolution = 200
    const objectScaleFactor = 1
    let displayAngle = 0.1

    let bitmap = Array.from({length: 1000}, 
        () => Array.from({length: 21}, () => Math.random() < 0.2 ? true : false))

    class Player {
        constructor() {
            this.pos = new Vector2d(bitmap[0].length / 2, 0)
            this.originalAngle = Math.PI / 2
            this.angle = this.originalAngle
            this.sideMovement = 0
            this.fov = Math.PI / 1.5
            this.viewDistance = 10
        }

        move(distance) {
            this.pos.y += distance
            this.pos.x += this.sideMovement

            let x = Math.floor(this.pos.x)
            let y = Math.floor(this.pos.y)
            let row = bitmap[y]
            if (row) {
                let value = row[x]
                if (value === true) {
                    bitmap[y][x] = false
                }
            }

            this.pos.x = Math.max(0, Math.min(bitmap[0].length - 1, this.pos.x))
        }
    }

    let player = new Player()
    const middleX = Math.floor(player.pos.x)
    let currX = middleX
    for (let i = 0; i < bitmap.length; i++) {
        bitmap[i][currX] = false
        if (currX < bitmap[0].length - 1) {
            bitmap[i][currX + 1] = false
        }

        let middleDirection = (middleX - currX) > 0 ? 1 : -1
        if (Math.random() < 0.8) {
            currX += middleDirection
        } else {
            currX -= middleDirection
        }

        currX = Math.min(bitmap[0].length - 1, Math.max(0, currX))
    }

    function render() {
        player.fov = (canvas.width / canvas.height) * (Math.PI / 3.5)

        function raycast(start, angle, {
            maxDistance = 10,
            precision = 0.01
        }={}) {
            const delta = Vector2d.fromAngle(angle).scale(precision)
            let currPos = start.copy()
            while (currPos.distance(start) < maxDistance) {
                currPos.iadd(delta)
                const row = bitmap[Math.floor(currPos.y)]
                if (row === undefined) {
                    return Infinity
                }
                const value = row[Math.floor(currPos.x)]
                if (value) {
                    return currPos.distance(start)
                } else if (value === undefined) {
                    return Infinity
                }
            }
            return Infinity
        }

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = "white"

        const yResolution = Math.round((canvas.height / canvas.width) * xResolution)
        const startAngle = player.angle - player.fov / 2
        let heights = []
        for (let x = 0; x < xResolution; x++) {
            let angle = startAngle + player.fov * (x / (xResolution - 1))
            let result = raycast(player.pos, angle, {maxDistance: player.viewDistance})
            let height = Math.min(yResolution - 1, Math.round(yResolution / (result * objectScaleFactor)))
            heights.push(height)
        }

        const xStep = canvas.width / xResolution
        const yStep = canvas.height / yResolution

        context.save()
        context.translate(canvas.width / 2, canvas.height / 2)
        context.rotate(displayAngle)

        for (let x = 0; x < xResolution; x++) {
            const height = heights[x]
            let offset = Math.round((yResolution - height) / 2)
            const lum = Math.round(height / yResolution * 255)
            context.fillStyle = `rgb(${lum}, ${lum}, ${lum})`
            context.fillRect(xStep * x - canvas.width / 2, yStep * offset - canvas.height / 2, xStep + 1, height * yStep)
        }

        context.restore()
    }

    let gameRunning = true
    
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
            removeEventListener("keydown", downListener)
            removeEventListener("keyup", upListener)
        }

        if (parseKeyCode(event.key, false)) event.preventDefault()
    })

    let touchStartX = undefined
    addEventListener("touchstart", event => {
        touchStartX = event.touches[0].screenX
    })

    addEventListener("touchend", event => {
        touchStartX = undefined
        keyDown.LEFT = false
        keyDown.RIGHT = false
    })

    addEventListener("touchmove", event => {
        let delta = event.touches[0].screenX - touchStartX
        if (delta > 100) {
            keyDown.RIGHT = true
            keyDown.LEFT = false
        } else if (delta < -100) {
            keyDown.LEFT = true
            keyDown.RIGHT = false
        } else {
            keyDown.LEFT = false
            keyDown.RIGHT = false
        }
    })

    function processInput() {
        if (keyDown.LEFT) {
            player.sideMovement += 0.03
        } else if (keyDown.RIGHT) {
            player.sideMovement -= 0.03
        } else {
            player.sideMovement -= player.sideMovement * 0.5
        }

        player.sideMovement = Math.min(player.sideMovement, 0.1)
        player.sideMovement = Math.max(player.sideMovement, -0.1)

        player.desiredAngle = player.originalAngle - player.sideMovement * 3
        player.angle += (player.desiredAngle - player.angle) * 0.1
        displayAngle = player.sideMovement * 1
    }

    terminal.onInterrupt(() => {
        gameRunning = false
        terminalWindow.close()
    })

    while (gameRunning) {
        player.move(0.2)
        render()
        processInput()
        await sleep(40)
    }
}, {
    description: "play a game of avoida",
    isGame: true,
})