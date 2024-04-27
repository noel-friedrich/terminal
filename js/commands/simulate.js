"use strict"

terminal.addCommand("simulate", async function(args) {
    await terminal.modules.import("game", window)
    await terminal.modules.load("window", terminal)

    const simulationName = {
        "two-masses-spring": "2 Mass 1 Spring Simulation",
        "planets-gravity": "Planets Gravity Simulation"
    }[args.simulation]

    let terminalWindow = terminal.modules.window.make({
        name: simulationName ?? "Simulation", fullscreen: args.fullscreen})
    const canvas = terminalWindow.CANVAS
    const context = terminalWindow.CONTEXT

    class PointMass {

        constructor(mass, pos, {
            vel = new Vector2d(0, 0),
            acc = new Vector2d(0, 0),
            color = "#a5a1ff",
            drawPath = false,
            pathColor = "blue",
            maxPathLength = 1000,
        }={}) {
            this.mass = mass
            this.pos = pos
            this.vel = vel
            this.acc = acc

            this.color = color
            this.drawPath = drawPath
            this.pathColor = pathColor
            this.maxPathLength = maxPathLength

            this.path = []
        }

        get radius() {
            return 20 * Math.sqrt(getValue(this.mass))
        }

    }

    class Spring {

        constructor(m1, m2, k, length) {
            this.m1 = m1
            this.m2 = m2
            this.k = k
            this.length = length
        }

    }

    class SimulationParameter {

        constructor(id, key, action, value, options) {
            this.id = id
            this.key = key
            this.action = action
            this.value = value
            this.options = options
        }

        change() {
            const index = this.options.indexOf(this.value) ?? 0
            this.value = this.options[(index + 1) % this.options.length]
        }

    }

    class SimulationSetup {

        constructor() {
            this.masses = []
            this.springs = []
            this.parameters = []
            this.updateRules = []
            this.initRules = []

            this.friction = 0
            this.drawCOM = false
            this.COMColor = "#ed9bff"
            this.drawCOMPath = true
            this.COMMaxPathLength = 1000
            this.COMPathColor = "violet"
            this.COMRadius = 20
        }
        
        addInitRule(rule) {
            this.initRules.push(rule)
        }

        addUpdateRule(rule) {
            this.updateRules.push(rule)
            return this
        }

        enableCOM({
            color="#ed9bff",
            drawPath=true,
            radius=20,
            maxPathLength=1000,
            pathColor="violet"
        }={}) {
            this.drawCOM = true
            this.drawCOMPath = drawPath
            this.maxPathLength = maxPathLength
            this.pathColor = pathColor
            this.COMRadius = radius
            this.COMColor = color
            return this
        }

        setFriction(friction) {
            this.friction = friction
            return this
        }

        addSpring(spring) {
            this.springs.push(spring)
            return this
        }

        addMass(mass) {
            this.masses.push(mass)
            return this
        }

        addParameter(param) {
            this.parameters.push(param)
            return this
        }

    }

    function getValue(paramOrNumber) {
        if (paramOrNumber instanceof SimulationParameter) {
            return paramOrNumber.value
        } else {
            return paramOrNumber
        }
    }

    function make2dSimulation(setup) {
        const viewCentre = new Vector2d(0, 0)
        const viewCentreTarget = new Vector2d(0, 0)
        const COMPath = []

        const R = () => {
            const pos = new Vector2d(0, 0)
            let massSum = 0
            for (const obj of setup.masses) {
                pos.iadd(obj.pos.scale(getValue(obj.mass)))
                massSum += getValue(obj.mass)
            }

            return pos.scale(1 / massSum)
        }

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
            return Vector2d.fromEvent(clickEvent, canvas).sub(viewCentre).sub(middle)
        }

        let cameraFollowing = true

        addEventListener("keydown", event => {
            if (event.key == " ") {
                cameraFollowing = !cameraFollowing
                viewCentreTarget.set(viewCentre)
            }

            const cameraSpeed = 100
            if (event.key == "ArrowUp") {
                viewCentreTarget.iadd(new Vector2d(0, 1).scale(cameraSpeed))
            } else if (event.key == "ArrowDown") {
                viewCentreTarget.iadd(new Vector2d(0, 1).scale(-cameraSpeed))
            } else if (event.key == "ArrowLeft") {
                viewCentreTarget.iadd(new Vector2d(1, 0).scale(cameraSpeed))
            } else if (event.key == "ArrowRight") {
                viewCentreTarget.iadd(new Vector2d(1, 0).scale(-cameraSpeed))
            }

            for (let param of setup.parameters) {
                if (event.key == param.key) {
                    param.change()
                }
            }
        })

        let focusedObj = null
        let currMousePos = null

        canvas.onmousedown = event => {
            const mouse = mousePos(event)

            let closestObj = null
            let minDistance = Infinity

            for (let obj of setup.masses) {
                const dist = mouse.distance(obj.pos)
                if (minDistance > dist) {
                    closestObj = obj
                    minDistance = dist
                }
            }

            if (minDistance < 200 && closestObj) {
                focusedObj = closestObj
            }
        }

        canvas.onmousemove = event => {
            const mouse = mousePos(event)
            currMousePos = mouse
        }

        canvas.onmouseup = event => {
            if (focusedObj && currMousePos) {
                focusedObj.vel.iadd(currMousePos.sub(focusedObj.pos).scale(0.03))
            }

            focusedObj = null
            currMousePos = null
        }

        canvas.ontouchstart = event => canvas.onmousedown(event)
        canvas.ontouchmove = event => canvas.onmousemove(event)
        canvas.ontouchend = event => canvas.onmouseup(event)

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
            
            context.lineCap = "round"
            context.strokeStyle = color
            drawLine(1, 0, 0, 0)
            drawLine(0, 0, 0.2, -0.2)
            drawLine(0, 0, 0.2, 0.2)

            context.restore()
        }

        function drawInstructions() {
            const lines = [
                "space : toggle camera",
                "drag a mass to kick it",
                "",
                `camera=${cameraFollowing ? "follow" : "manual"}`
            ]

            for (const param of setup.parameters) {
                lines.unshift(`${param.key.padEnd(5)} : ${param.action}`)
                lines.push(`${param.id}=${param.value}`)
            }

            if (!cameraFollowing) {
                lines.unshift("arrow : move camera")
            }

            context.font = "15px monospace"
            context.fillStyle = "black"
            context.textBaseline = "top"
            for (let i = 0; i < lines.length; i++) {
                context.fillText(lines[i], 10, i * 20 + 10)
            }
        }

        function addToPath(path, v, maxPathLength) {
            path.unshift(v.copy())
            if (path.length > maxPathLength) {
                path.pop()
            }
        }

        function update(dt) {
            for (const spring of setup.springs) {
                const [m1, m2] = [spring.m1, spring.m2]
                const displacement = m1.pos.distance(m2.pos) - getValue(spring.length)
                const forceLength = -getValue(spring.k) * displacement
                m1.vel.iadd(m1.pos.sub(m2.pos).normalized.scale(forceLength / getValue(m1.mass)))
                m2.vel.iadd(m2.pos.sub(m1.pos).normalized.scale(forceLength / getValue(m2.mass)))
            }

            for (const rule of setup.updateRules) {
                rule(dt)
            }

            for (const obj of setup.masses) {
                obj.vel.iadd(obj.acc.scale(dt / 16))
                obj.pos.iadd(obj.vel.scale(dt / 16))
                obj.vel.iscale(1 - getValue(setup.friction))

                if (obj.drawPath) {
                    addToPath(obj.path, obj.pos, obj.maxPathLength)
                }
            }

            if (setup.drawCOM) {
                addToPath(COMPath, R(), setup.COMMaxPathLength)
            }

            if (cameraFollowing) {
                viewCentreTarget.set(R().scale(-1))
            }

            viewCentre.iadd(viewCentreTarget.sub(viewCentre).scale(0.05))
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
            context.lineCap = "round"
            context.lineWidth = 1
            context.strokeStyle = color
            context.stroke()
        }

        function render() {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
            context.clearRect(0, 0, canvas.width, canvas.height)
            drawBackground()

            drawInstructions()

            for (const obj of setup.masses.filter(m => m.drawPath)) {
                drawPath(obj.path, obj.pathColor)
            }

            if (setup.drawCOMPath) {
                drawPath(COMPath, setup.COMPathColor)
            }

            for (const spring of setup.springs) {
                drawSpring(
                    screenPos(spring.m1.pos),
                    screenPos(spring.m2.pos),
                    "black", Math.floor(getValue(spring.length) / 20))
            }

            for (const obj of setup.masses) {
                drawBall(screenPos(obj.pos), obj.color, obj.radius)
            }

            if (setup.drawCOM) {
                drawBall(screenPos(R()), setup.COMColor, setup.COMRadius)
            }

            if (focusedObj && currMousePos) {
                drawArrow(focusedObj.pos, currMousePos, focusedObj.pathColor)
            }
        }

        for (const rule of setup.initRules) {
            rule()
        }

        return {render, update}
    }

    const simulation = {
        "2-masses-1-spring": () => {
            const setup = new SimulationSetup()

            const frictionParam = new SimulationParameter(
                "friction", "f", "change friction",
                0.001, [0, 0.0001, 0.001, 0.01, 0.1])
            const massParam = new SimulationParameter(
                "mass_ratio", "m", "change mass ratio",
                1, [1, 2, 5, 10])
            const springLengthParam = new SimulationParameter(
                "spring_length", "l", "change spring length",
                200, [50, 100, 200, 300, 500])
            const springConstantParam = new SimulationParameter(
                "spring_const", "k", "change spring constant",
                0.001, [0.1, 0.01, 0.001, 0.0001, 0.00001])

            const m1 = new PointMass(massParam, new Vector2d(-100, 0),
                {color: "#94afff", drawPath: true, pathColor: "blue"})
            const m2 = new PointMass(1, new Vector2d(100, 0),
                {color: "#ff9494", drawPath: true, pathColor: "red"})

            setup.addParameter(frictionParam).addParameter(massParam)
                .addParameter(springConstantParam).addParameter(springLengthParam)

            setup.addMass(m1).addMass(m2)
            setup.addSpring(new Spring(m1, m2, springConstantParam, springLengthParam))

            setup.setFriction(frictionParam)
            setup.enableCOM({
                color: "#ed9bff",
                radius: 5,
                pathColor: "violet"
            })

            return make2dSimulation(setup)
        },

        "3-masses-3-springs": () => {
            const setup = new SimulationSetup()

            const frictionParam = new SimulationParameter(
                "friction", "f", "change friction",
                0.001, [0, 0.0001, 0.001, 0.01, 0.1])
            const springLengthParam = new SimulationParameter(
                "spring_length", "l", "change spring length",
                300, [100, 200, 300, 400, 500])
            const springConstantParam = new SimulationParameter(
                "spring_const", "k", "change spring constant",
                0.005, [0.1, 0.01, 0.005, 0.001, 0.0001, 0.00001])

            const m1Pos = new Vector2d(0, springLengthParam.value / 2 / Math.cos(Math.PI / 6))

            const m1 = new PointMass(1, m1Pos,
                {color: "#94afff", drawPath: true, pathColor: "blue"})
            const m2 = new PointMass(1, m1Pos.rotate(Math.PI * 2 / 3),
                {color: "#ff9494", drawPath: true, pathColor: "red"})
            const m3 = new PointMass(1, m1Pos.rotate(Math.PI * -2 / 3),
                {color: "#a1ff9a", drawPath: true, pathColor: "#00ff00"})

            console.log(m1.pos.distance(m2.pos))

            setup.addParameter(frictionParam)
                .addParameter(springConstantParam)
                .addParameter(springLengthParam)

            setup.addMass(m1).addMass(m2).addMass(m3)
            setup.addSpring(new Spring(m1, m2, springConstantParam, springLengthParam))
            setup.addSpring(new Spring(m2, m3, springConstantParam, springLengthParam))
            setup.addSpring(new Spring(m1, m3, springConstantParam, springLengthParam))

            setup.setFriction(frictionParam)
            setup.enableCOM({radius: 5})

            return make2dSimulation(setup)
        },

        "planets-gravity": () => {
            const setup = new SimulationSetup()

            const frictionParam = new SimulationParameter(
                "friction", "f", "change friction",
                0, [0, 0.0001, 0.001, 0.01, 0.1])
            const massParam = new SimulationParameter(
                "mass_ratio", "m", "change mass ratio",
                1, [1, 2, 5, 10, 30])
            const gravityParam = new SimulationParameter(
                "gravity_const", "g", "change gravity const",
                1000, [100, 300, 500, 750, 1000, 1500])

            const m1 = new PointMass(massParam, new Vector2d(-300, 0),
                {color: "#94afff", drawPath: true, pathColor: "blue",
                 vel: new Vector2d(0, 0.5)})
            const m2 = new PointMass(1, new Vector2d(300, 0),
                {color: "#ff9494", drawPath: true, pathColor: "red",
                 vel: new Vector2d(0, -0.5)})

            setup.setFriction(frictionParam)
            setup.addMass(m1).addMass(m2)
            setup.addParameter(gravityParam).addParameter(massParam).addParameter(frictionParam)

            setup.addUpdateRule(dt => {
                for (const obj of setup.masses) {
                    for (const other of setup.masses) {
                        if (obj == other) {
                            continue
                        }

                        const delta = other.pos.sub(obj.pos)
                        const dir = delta.normalized

                        // newtons universal law of gravity:
                        const gravityStrength = Math.min(getValue(gravityParam) * getValue(other.mass) / (delta.length ** 2), 2)
                        obj.vel.iadd(dir.scale(gravityStrength).scale(dt / 16))
                    }
                }
            })

            return make2dSimulation(setup)
        },

        "1d-3-masses-2-springs": () => {
            const setup = new SimulationSetup()

            const frictionParam = new SimulationParameter(
                "friction", "f", "change friction",
                0.001, [0, 0.0001, 0.001, 0.01, 0.1])
            const springLengthParam = new SimulationParameter(
                "spring_length", "l", "change spring length",
                200, [50, 100, 200, 300, 500])
            const springConstantParam = new SimulationParameter(
                "spring_const", "k", "change spring constant",
                0.005, [0.1, 0.01, 0.005, 0.001, 0.0001, 0.00001])

            const m1 = new PointMass(1, new Vector2d(-200, 0),
                {color: "#94afff", drawPath: true, pathColor: "blue"})
            const m2 = new PointMass(1, new Vector2d(0, 0),
                {color: "#ff9494", drawPath: true, pathColor: "red"})
            const m3 = new PointMass(1, new Vector2d(200, 0),
                {color: "#a1ff9a", drawPath: true, pathColor: "#00ff00"})

            setup.addParameter(frictionParam)
                .addParameter(springConstantParam)
                .addParameter(springLengthParam)

            setup.addMass(m1).addMass(m2).addMass(m3)
            setup.addSpring(new Spring(m1, m2, springConstantParam, springLengthParam))
            setup.addSpring(new Spring(m2, m3, springConstantParam, springLengthParam))

            const startTime = performance.now()
            setup.addUpdateRule(dt => {
                for (const obj of setup.masses) {
                    obj.pos.y = (performance.now() - startTime) * 0.03
                    obj.vel.y = 0
                    obj.acc.y = 0
                }
            })

            setup.setFriction(frictionParam)
            setup.enableCOM({radius: 5})

            return make2dSimulation(setup)
        }
    }[args.simulation]()

    let simulationRunning = true

    terminal.onInterrupt(() => {
        terminalWindow.close()
        simulationRunning = false
    })

    let lastLoopTime = null

    function loop() {
        if (!simulationRunning) {
            return
        }

        const now = performance.now()
        const deltaTime = lastLoopTime ? (now - lastLoopTime) : (1000 / 60)

        simulation.update(deltaTime)
        simulation.render()

        terminal.window.requestAnimationFrame(loop)
    }

    loop()
    while (simulationRunning) {
        await sleep(1000)
    }

    terminalWindow.close()

}, {
    description: "run an implemented simulation",
    args: {
        "s=simulation:e:2-masses-1-spring|3-masses-3-springs|planets-gravity|1d-3-masses-2-springs": "simulation to run",
        "?f=fullscreen:b": "run application in fullscreen"
    }
})