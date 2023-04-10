terminal.addCommand("cmatrix", async function(args) {
    function makeCMatrix(makeWindow) {
        const terminalWindow = makeWindow({name: "CMatrix", fullscreen: !args.nf})
        const CANVAS = terminalWindow.CANVAS
        const CONTEXT = terminalWindow.CONTEXT
    
        let CHARWIDTH = CONTEXT.measureText("A").width * 1.8
    
        function drawChar(x, y, char, color="lime") {
            CONTEXT.fillStyle = "black"
            CONTEXT.clearRect(x - 1, y - 1, CHARWIDTH + 1, 22)
            CONTEXT.fillStyle = color
            CONTEXT.fillText(char, x, y)
        }
    
        function randomChar() {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\"'!@#$%^&*()_+-=[]{}|;:<>?,./\\"
            return chars.charAt(Math.floor(Math.random() * chars.length))
        }
    
        let snakePos = []
        let snakeTypes = []
    
        function updateSnakes() {
            for (let i = 0; i < snakePos.length; i++) {
                if (!snakePos[i]) continue
                let c = snakeTypes[i] ? " " : randomChar()
                if (!snakeTypes[i])
                    drawChar(snakePos[i][0], snakePos[i][1] + 25, c, "white")
                drawChar(snakePos[i][0], snakePos[i][1], c)
                snakePos[i][1] += 20
                if (snakePos[i][1] > CANVAS.height) {
                    snakePos.splice(i, 1)
                    snakeTypes.splice(i, 1)
                    i--
                }
            }
        }
    
        function addSnake() {
            let maxX = parseInt(CANVAS.width / CHARWIDTH)
            let x = Math.floor(Math.random() * maxX) * CHARWIDTH
            snakePos.push([x, 0])
            snakeTypes.push(Math.random() < 0.5)
        }
        
        let intervalFunc = setInterval(function() {
            updateSnakes()
            let rndm = Math.random() * 10
            for (let i = 0; i < rndm; i++) {
                addSnake()
            }
        }, 30)
    
        return [terminalWindow, intervalFunc]
    }

    await terminal.modules.load("window", terminal)
    let [terminalWindow, intervalFunc] = makeCMatrix(terminal.modules.window.make)
    let stopped = false
    terminal.onInterrupt(() => {
        clearInterval(intervalFunc)
        terminalWindow.close()
        stopped = true
    })
    while (!stopped)
        await sleep(100)
}, {
    description: "show the matrix",
    args: {
        "?nf=not-fullscreen:b": "make the window fullscreen"
    }
})

