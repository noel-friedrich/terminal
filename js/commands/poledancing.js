terminal.addCommand("poledancing", async function(args) {
    await terminal.modules.import("game", window)

    let gameRunning = true

    class Player {

        constructor(initialPos, lookAngle) {
            this.pos = initialPos.copy()
            this.lookAngle = lookAngle

            this.hookIndeces = []
        }

        get currHookIndex() {
            if (this.hookIndeces.length > 0) {
                return this.hookIndeces[this.hookIndeces.length - 1]
            } else {
                return null
            }
        }

        getCurrHookPos() {
            const index = this.currHookIndex
            if (index === null) {
                return new Vector2d(0, 0)
            } else {
                return polePositions[Math.abs(index) - 1]
            }
        }

        get hookLinePoints() {
            return [new Vector2d(0, 0)].concat(this.hookIndeces.map(i => polePositions[Math.abs(i) - 1])).concat([this.pos])
        }

        simplifyHookPath() {
            let deleteFlags = this.hookIndeces.map(_ => false)
            
            outerLoop:
            while (true) {
                this.hookIndeces = this.hookIndeces.filter((_, i) => !deleteFlags[i])
                deleteFlags = this.hookIndeces.map(_ => false)
                
                for (let i = 0; i < this.hookIndeces.length - 1; i++) {
                    const consecutiveSum = this.hookIndeces[i] + this.hookIndeces[i + 1]
                    if (consecutiveSum === 0) {
                        deleteFlags[i] = true
                        deleteFlags[i + 1] = true
                        continue outerLoop
                    }
                }
                break
            }
        }

        processNewPosition(newPosition) {
            const prevPosition = player.pos.copy()

            for (let poleIndex = 0; poleIndex < polePositions.length; poleIndex++) {
                const polePos = polePositions[poleIndex]
                let pivotIndex = this.hookIndeces.length - 1

                // Repeated wraps share a pole; find the incoming nonzero segment.
                while (pivotIndex >= 0 && Math.abs(this.hookIndeces[pivotIndex]) === poleIndex + 1) {
                    pivotIndex--
                }

                const currHookPos = pivotIndex < 0
                    ? new Vector2d(0, 0)
                    : polePositions[Math.abs(this.hookIndeces[pivotIndex]) - 1]

                const direction = polePos.sub(currHookPos)
                const prevSide = direction.cross(prevPosition.sub(currHookPos))
                const newSide = direction.cross(newPosition.sub(currHookPos))
                
                const crossedPositive = prevSide > 0 && newSide <= 0
                const crossedNegative = prevSide <= 0 && newSide > 0
                
                if (crossedPositive || crossedNegative) {
                    const t = prevSide / (prevSide - newSide)
                    const crossing = prevPosition.lerp(newPosition, t)
                
                    if (crossing.sub(polePos).dot(direction) > 0) {
                        this.hookIndeces.push(
                            crossedPositive ? poleIndex + 1 : -(poleIndex + 1)
                        )
                    }
                }
            }
            
            this.pos = newPosition
            this.simplifyHookPath()
        }
        
    }

    const player = new Player(new Vector2d(0, 0), 0)

    const polePositions = [
        Vector2d.fromAngle(0 / 3 * Math.PI).scale(0.4),
        Vector2d.fromAngle(2 / 3 * Math.PI).scale(0.6),
        Vector2d.fromAngle(4 / 3 * Math.PI).scale(0.8),
    ]

    function initDisplay(size) {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let widthPx = Math.floor(terminal.charWidth * size.x)
        let heightPx = Math.floor(terminal.charWidth * size.y)
        canvas.width = widthPx
        canvas.height = heightPx
        canvas.style.width = widthPx + "px"
        canvas.style.height = heightPx + "px"
        terminal.parentNode.appendChild(canvas)
        return [context, canvas]
    }

    const canvasSizeChars = 40
    terminal.addLineBreak()
    const [context, canvas] = initDisplay(new Vector2d(canvasSizeChars, canvasSizeChars))
    
    const playerSpeed = 0.01
    const playerTurnSpeed = 0.1

    const foregroundColor = terminal.data.foreground.toString()
    const backgroundColor = terminal.data.background.toString()
    const ropeColor = terminal.data.accentColor1.toString()
    const canvasSize = canvas.width

    terminal.window.player = player
    
    function circlePosToCanvasPos(pos) {
        return pos.add(new Vector2d(1, 1)).scale(0.5).scale(canvasSize)
    }

    function redraw() {
        // draw circle
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.beginPath()
        context.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI)
        context.strokeStyle = foregroundColor
        context.lineWidth = 2
        context.stroke()

        // draw player
        const playerCanvasPos = circlePosToCanvasPos(player.pos)
        context.beginPath()
        context.arc(playerCanvasPos.x, playerCanvasPos.y, canvasSize * 0.01, 0, 2 * Math.PI)
        context.fillStyle = foregroundColor
        context.fill()

        // draw poles
        for (const polePos of polePositions) {
            const poleCanvasPos = circlePosToCanvasPos(polePos)
            context.beginPath()
            context.arc(poleCanvasPos.x, poleCanvasPos.y, canvasSize * 0.01, 0, 2 * Math.PI)
            context.fillStyle = foregroundColor
            context.fill()
        }

        // draw player look dir
        context.beginPath()
        context.moveTo(playerCanvasPos.x, playerCanvasPos.y)
        const posInFront = player.pos.add(Vector2d.fromAngle(player.lookAngle).scale(0.1))
        const posInFrontL = posInFront.add(Vector2d.fromAngle(player.lookAngle + Math.PI * 3 / 4).scale(0.03))
        const posInFrontR = posInFront.add(Vector2d.fromAngle(player.lookAngle - Math.PI * 3 / 4).scale(0.03))
        const posInFrontCanvas = circlePosToCanvasPos(posInFront)
        const posInFrontLCanvas = circlePosToCanvasPos(posInFrontL)
        const posInFrontRCanvas = circlePosToCanvasPos(posInFrontR)
        context.lineTo(posInFrontCanvas.x, posInFrontCanvas.y)
        context.lineTo(posInFrontLCanvas.x, posInFrontLCanvas.y)
        context.lineTo(posInFrontCanvas.x, posInFrontCanvas.y)
        context.lineTo(posInFrontRCanvas.x, posInFrontRCanvas.y)
        context.stroke()

        // draw player hook line
        context.beginPath()
        let isFirstHookPoint = true
        for (const hookPos of player.hookLinePoints) {
            const canvasPos = circlePosToCanvasPos(hookPos)
            if (isFirstHookPoint) {
                context.moveTo(canvasPos.x, canvasPos.y)
            } else {
                context.lineTo(canvasPos.x, canvasPos.y)
            }

            isFirstHookPoint = false
        }
        context.strokeStyle = ropeColor
        context.stroke()
    }

    function processInput() {
        const newPlayerPos = player.pos.copy()
        if (keyDown.UP) {
            newPlayerPos.iadd(Vector2d.fromAngle(player.lookAngle).scale(playerSpeed))
        }
        
        if (keyDown.DOWN) {
            newPlayerPos.iadd(Vector2d.fromAngle(player.lookAngle).scale(-playerSpeed))
        }

        player.processNewPosition(newPlayerPos)

        if (keyDown.LEFT) {
            player.lookAngle -= playerTurnSpeed
        }
        
        if (keyDown.RIGHT) {
            player.lookAngle += playerTurnSpeed
        }

        if (player.pos.length > 1) {
            player.pos.iscale(1 / player.pos.length)
        }
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

    const FPS = 60

    terminal.scroll()
    while (gameRunning) {
        let startTime = performance.now()
        processInput()
        redraw()
        let deltaMs = performance.now() - startTime
        await sleep(1000 / FPS - deltaMs)
    }
}, {
    description: "simulate a pole dancing situation",
    category: "maths"
})
