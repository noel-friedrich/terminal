terminal.addCommand("simulate", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    const simulationName = {
        "two-masses-spring": "2 Mass 1 Spring Simulation"
    }[args.simulation]

    let terminalWindow = terminal.modules.window.make({
        name: simulationName ?? "Simulation", fullscreen: args.fullscreen})
    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    const simulation = {
        "two-masses-spring": () => {
            let springLength = 200
            const r1 = new Vector2d(springLength / -2, 0)
            const r2 = r1.scale(-1)
            const R = () => r1.scale(m1).add(r2.scale(m2)).scale(1 / (m1 + m2))
            let m1 = 1
            let m2 = 1

            const maxPathLength = 500
            const p1Path = [r1.copy()]
            const p2Path = [r2.copy()]
            const RPath = [R()]

            const viewCentre = new Vector2d(0, 0)

            let friction = 0.001

            let k = 0.001 // spring stiffness

            const v1 = new Vector2d(0, 0)
            const v2 = new Vector2d(0, 0)

            const a1 = new Vector2d(0, 0)
            const a2 = new Vector2d(0, 0)

            terminal.window.r1 = r1
            terminal.window.r2 = r2
            terminal.window.v1 = v1
            terminal.window.v2 = v2
            terminal.window.a1 = a1
            terminal.window.a2 = a2

            function screenPos(pos) {
                const middle = new Vector2d(canvas.width / 2, canvas.height / 2)
                return pos.add(middle).add(viewCentre)
            }

            function drawPath(path, color) {
                if (path.length < 2) {
                    return
                }

                context.beginPath()

                for (let i = 0; i < path.length; i++) {
                    const pos = screenPos(path[i])
                    if (i == 0) {
                        context.moveTo(pos.x, pos.y)
                    } else {
                        context.lineTo(pos.x, pos.y)
                    }
                }

                context.strokeStyle = color
                context.lineWidth = 1
                context.stroke()
            }

            function drawBackground(gridSize=50) {
                context.fillStyle = "white"
                context.fillRect(0, 0, canvas.width, canvas.height)

                const startX = viewCentre.x % gridSize
                const startY = viewCentre.y % gridSize

                function drawGridLine(x1, y1, x2, y2) {
                    context.moveTo(x1, y1)
                    context.lineTo(x2, y2)
                    context.strokeStyle = "#eee"
                    context.lineWidth = 1
                    context.stroke()
                }

                for (let x = startX; x < canvas.width; x += gridSize) {
                    drawGridLine(x, 0, x, canvas.height)
                }

                for (let y = startY; y < canvas.height; y += gridSize) {
                    drawGridLine(0, y, canvas.width, y)
                }
            }

            function mousePos(clickEvent) {
                const middle = new Vector2d(canvas.width / 2, canvas.height / 2)
                const rect = canvas.getBoundingClientRect()
                return new Vector2d(
                    clickEvent.clientX - rect.left,
                    clickEvent.clientY - rect.top
                ).sub(viewCentre).sub(middle)
            }

            let cameraFollowing = true

            addEventListener("keydown", event => {
                if (event.key == " ") {
                    cameraFollowing = !cameraFollowing
                }

                if (event.key == "f") {
                    const frictionValues = [0, 0.0001, 0.001, 0.01, 0.1, 0.5]
                    const newIndex = (frictionValues.indexOf(friction) ?? 0) + 1
                    friction = frictionValues[newIndex % frictionValues.length]
                }

                if (event.key == "m") {
                    const massRatioValues = [1, 2, 5, 10]
                    const newIndex = (massRatioValues.indexOf(m1) ?? 0) + 1
                    m1 = massRatioValues[newIndex % massRatioValues.length]
                }

                if (event.key == "l") {
                    const springLengths = [50, 100, 200, 300, 500]
                    const newIndex = (springLengths.indexOf(springLength) ?? 0) + 1
                    springLength = springLengths[newIndex % springLengths.length]
                }

                if (event.key == "k") {
                    const ks = [0.1, 0.01, 0.001, 0.0001, 0.00001]
                    const newIndex = (ks.indexOf(k) ?? 0) + 1
                    k = ks[newIndex % ks.length]
                }
            })

            let focusedBallPos = null
            let currMousePos = null

            canvas.onmousedown = event => {
                const mouse = mousePos(event)
                if (mouse.distance(r1) < mouse.distance(r2) && mouse.distance(r1) < 200) {
                    focusedBallPos = r1
                } else if (mouse.distance(r2) < mouse.distance(r1) && mouse.distance(r2) < 200) {
                    focusedBallPos = r2
                }
            }

            canvas.onmousemove = event => {
                const mouse = mousePos(event)
                currMousePos = mouse
            }

            canvas.onmouseup = event => {
                if (focusedBallPos && currMousePos) {
                    if (focusedBallPos == r1) {
                        v1.set(currMousePos.sub(r1).scale(0.05))
                    } else {
                        v2.set(currMousePos.sub(r2).scale(0.05))
                    }
                }

                focusedBallPos = null
            }

            function drawArrow(headPos, tailPos, color) {
                const delta = headPos.sub(tailPos)

                context.save()
                context.translate(screenPos(tailPos).x, screenPos(tailPos).y)
                context.rotate(delta.angle)
                context.scale(delta.length, delta.length)

                const lineWidth = Math.min(Math.max(3, delta.length * 0.05), 10)
                context.lineWidth = lineWidth / delta.length

                function drawLine(x1, y1, x2, y2) {
                    context.beginPath()
                    context.moveTo(x1, y1)
                    context.lineTo(x2, y2)
                    context.stroke()
                }
                
                context.strokeStyle = color
                drawLine(1, 0, 0, 0)
                drawLine(0, 0, 0.2, -0.2)
                drawLine(0, 0, 0.2, 0.2)

                context.restore()
            }

            function drawInstructions() {
                const lines = [
                    "drag a mass to kick it",
                    "f     : change friction",
                    "m     : change mass ratio",
                    "l     : change spring length",
                    "k     : change spring constant",
                    "space : (un)follow mass",
                    "",
                    `friction=${friction}`,
                    `mass_ratio=${m1}`,
                    `spring_length=${springLength / 10}`,
                    `spring_const=${k}`
                ]

                context.font = "20px monospace"
                context.fillStyle = "black"
                context.textBaseline = "top"
                for (let i = 0; i < lines.length; i++) {
                    context.fillText(lines[i], 10, i * 30 + 10)
                }
            }

            function addToPath(path, v) {
                path.unshift(v.copy())
                if (path.length > maxPathLength) {
                    path.pop()
                }
            }

            function update() {
                const displacement = r1.distance(r2) - springLength
                const f1 = -k * displacement
                const f2 = -k * displacement

                a1.set(r1.sub(r2).normalized.scale(f1 / m1))
                a2.set(r2.sub(r1).normalized.scale(f2 / m2))

                v1.iadd(a1)
                v2.iadd(a2)
                r1.iadd(v1)
                r2.iadd(v2)

                v1.iscale(1 - friction)
                v2.iscale(1 - friction)

                addToPath(p1Path, r1)
                addToPath(p2Path, r2)
                addToPath(RPath, R())

                // update view centre
                if (cameraFollowing) {
                    const idealPos = R().scale(-1)
                    viewCentre.iadd(idealPos.sub(viewCentre).scale(0.05))
                }
            }

            function drawBall(pos, color, radius) {
                context.beginPath()
                context.arc(pos.x, pos.y, radius, 0, Math.PI * 2)

                context.fillStyle = color
                context.fill()

                context.strokeStyle = "black"
                context.lineWidth = 1
                context.stroke()
            }

            function drawSpring(p1, p2, color, steps=20) {
                const pos = t => p1.add(p2.sub(p1).scale(t))

                context.beginPath()
                context.moveTo(p1.x, p1.y)

                const normal = p2.sub(p1).rotate(Math.PI / 2).normalized
                
                for (let i = 0; i < steps; i++) {
                    const direction = i % 2 == 0 ? 1 : -1
                    const p = pos((i + 1) / (steps + 1)).add(normal.scale(10 * direction))
                    context.lineTo(p.x, p.y)
                }

                context.lineTo(p2.x, p2.y)
                context.lineWidth = 1
                context.lineCap = "round"
                context.strokeStyle = color
                context.stroke()
            }

            function render() {
                canvas.width = canvas.clientWidth
                canvas.height = canvas.clientHeight
                context.clearRect(0, 0, canvas.width, canvas.height)
                drawBackground()

                drawInstructions()

                drawPath(p1Path, "blue")
                drawPath(p2Path, "red")
                drawPath(RPath, "violet")

                drawSpring(screenPos(r1), screenPos(r2), "black", Math.floor(springLength / 10))
                drawBall(screenPos(r1), "#a5a1ff", 20 * Math.sqrt(m1)) // light blue
                drawBall(screenPos(r2), "#ffa1a1", 20) // light red
                drawBall(screenPos(R()), "#eea3ff", 5) // light violet

                if (focusedBallPos && currMousePos) {
                    if (focusedBallPos == r1) {
                        drawArrow(focusedBallPos, currMousePos, "blue")
                    } else {
                        drawArrow(focusedBallPos, currMousePos, "red")
                    }
                }
            }

            return {render, update, fps: 60}
        }
    }[args.simulation]()

    let simulationRunning = true

    terminal.onInterrupt(() => {
        terminalWindow.close()
    })

    while (simulationRunning) {
        simulation.update()
        simulation.render()
        await sleep(1000 / (simulation.fps ?? 60))
    }

    terminalWindow.close()

}, {
    description: "run an implemented simulation",
    args: {
        "s=simulation:e:two-masses-spring": "simulation to run",
        "?f=fullscreen:b": "run application in fullscreen"
    }
})