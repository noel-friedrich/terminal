terminal.addCommand("sl", async function(args) {
    let FRAME = "", FRAMES = []
    FRAME  = "     ooOOOO\n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()-()() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "     oo OO OO\n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()-()()() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "     oo O O O O\n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()-()() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "      o o o  OO O O\n"
    FRAME += "    o       _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()()-() o   oo  oo"
    FRAMES.push(FRAME)

    FRAME =  "     ooOOOO  o  O \n"
    FRAME += "    oo      _____\n"
    FRAME += "   _I__n_n__||_|| ________\n"
    FRAME += " >(_________|_7_|-|_NOEL_|\n"
    FRAME += "  /o ()()-()() o   oo  oo"
    FRAMES.push(FRAME)
    
    await terminal.modules.load("window", terminal)

    const terminalWindow = terminal.modules.window.make({name: "Steam Locomotive", fullscreen: true})
    const CANVAS = terminalWindow.CANVAS
    const CONTEXT = terminalWindow.CONTEXT

    function drawText(x, y, text, color="#348d36") {
        CONTEXT.fillStyle = "black"
        CONTEXT.clearRect(x - 1, y - 1, CHARWIDTH + 1, 22)
        CONTEXT.fillStyle = color
        CONTEXT.fillText(text, x, y)
    }

    function CHARWIDTH() {
        return CONTEXT.measureText("A").width * 1.8
    }

    function drawTrain(x, frameIndex, y) {
        let frame = FRAMES[frameIndex]
        let currY = y ?? CANVAS.height / 2 - 50
        for (let line of frame.split("\n")) {
            drawText(x, currY, line, Color.WHITE)
            currY += 20
        }
    }

    function generateFlightPath({
        numWaves=10,
        numTries=10000,
    }={}) {
        const arr = f => Array.from({length: numWaves}, f)
        const makeRandomPath = () => {
            // f(x) = a * sin(b * x + c) + d
            let a = arr(() => Math.random() * 1)
            let b = arr(() => Math.random() * 5 + Math.PI * 2)
            let c = arr(() => Math.random() * Math.PI * 2)
            let d = arr(() => (Math.random() - 0.5) * 2 * 2)
            return x => {
                let sum = 0
                for (let i = 0; i < numWaves; i++)
                    sum += a[i] * Math.sin(b[i] * x + c[i]) + d[i]
                return sum
            }
        }

        const checkRandomPath = f => {
            let highestMidOffset = 0
            for (let x = 0; x < 1; x += 0.01) {
                let y = f(x)
                if (y > 1 || y < 0)
                    return false
                let midOffset = Math.abs(y - 0.5)
                highestMidOffset = Math.max(highestMidOffset, midOffset)
            }
            return highestMidOffset > 0.2
        }

        for (let i = 0; i < numTries; i++) {
            let f = makeRandomPath()
            if (checkRandomPath(f))
                return f
        }

        return null
    }

    let running = true

    const msPerFrame = 40
    const trainTime = Math.random() * 10000 + 10000
    const startTime = Date.now()
    let flightPath = null
    if (args.f) {
        flightPath = generateFlightPath()
        if (flightPath == null) {
            terminal.printEasterEgg("Navigator-Egg")
            throw new Error("Flight Navigation not found.")
        }
    } 
    function draw() {
        let frameIndex = Math.floor((Date.now() / msPerFrame) % FRAMES.length)
        CONTEXT.fillStyle = "#000000"
        CONTEXT.globalAlpha = 0.2
        CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height)
        CONTEXT.globalAlpha = 1 
        const deltaTime = (Date.now() - startTime) / trainTime
        const x = CANVAS.width - deltaTime * CANVAS.width
        
        if (args.f) {
            const y = flightPath(deltaTime) * CANVAS.height - 50
            drawTrain(x, frameIndex, y)
        } else {
            drawTrain(x, frameIndex)
        }

        if (x < -300) running = false

        if (running)
            terminal.window.requestAnimationFrame(draw)
    }

    draw()

    while (running) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    terminalWindow.close()
}, {
    description: "Steam Locomotive",
    args: {
        "?f=F:b": "Make it fly"
    }
})