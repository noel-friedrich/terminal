class Vector3d {
	
	constructor(x, y, z) {
		this.x = x
		this.y = y
		this.z = z
	}
	
	get length() {
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z)
	}

    get normalized() {
        return this.div(this.length)
    }

    copy() {
        return new Vector3d(this.x, this.y, this.z)
    }
	
	add(other) {
		return new Vector3d(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z
		)
	}

    distanceTo(other) {
        return this.sub(other).length
    }
	
	mul(scalar) {
		return new Vector3d(
			this.x * scalar,
			this.y * scalar,
			this.z * scalar
		)
	}
	
	sub(other) {
		return this.add(other.mul(-1))
	}
	
	div(scalar) {
		return this.mul(1 / scalar)
	}
	
	cross(other) {
		return new Vector3d(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x
		)
	}
	
	dot(other) {
		return (
			this.x * other.x +
			this.y * other.y +
			this.z * other.z
		)
	}
	
	get angleX() {
		return Math.atan2(this.z, this.y)
	}
	
	rotateX(angle) {
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        return new Vector3d(
            this.x,
            this.y * cos - this.z * sin,
            this.y * sin + this.z * cos
        )
	}

    setAngleX(angle) {
        return this.rotateX(angle - this.angleX)
    }

    get angleY() {
        return Math.atan2(this.z, this.x)
    }

    rotateY(angle) {
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        return new Vector3d(
            this.x * cos - this.z * sin,
            this.y,
            this.x * sin + this.z * cos
        )
    }

    setAngleY(angle) {
        return this.rotateY(angle - this.angleY)
    }

    get angleZ() {
        return Math.atan2(this.y, this.x)
    }

    rotateZ(angle) {
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        return new Vector3d(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
            this.z
        )
    }

    setAngleZ(angle) {
        return this.rotateZ(angle - this.angleZ)
    }

    rotateUp(angle) {
        let temp = this.angleZ
        return this.setAngleZ(0).rotateY(angle).setAngleZ(temp)
    }

    apply(func) {
        return new Vector3d(
            func(this.x),
            func(this.y),
            func(this.z)
        )
    }

    round() {
        return this.apply(Math.round)
    }

    floor() {
        return this.apply(Math.floor)
    }

}

terminal.modules.Vector3d = Vector3d

terminal.addCommand("blocks", async function(args) {
	await terminal.modules.import("game", window)
	
	function initField(size, {defaultVal=0}={}) {
		let field = []
		for (let x = 0; x < size.x; x++) {
			let row0 = []
			for (let y = 0; y < size.y; y++) {
				let row1 = []
				for (let z = 0; z < size.z; z++) {
					row1.push(defaultVal)
				}
				row0.push(row1)
			}
			field.push(row0)
		}
		return field
	}
	
	const fieldSize = new Vector3d(args.roomX, args.roomY, args.roomZ)
	const field = initField(fieldSize)
    const maxFieldDistance = fieldSize.length

    function colorFromVals(raycastResult, distance) {
        let hue = raycastResult * 360
        let lightness = 80 - distance / cameraViewDistance * 80
        let saturation = lightness
        return Color.fromHSL(hue / 360, saturation / 100, lightness / 100)
    }
	
	function isOutOfBounds(pos) {
		if (
			(pos.x < 0)
			|| (pos.y < 0)
			|| (pos.z < 0)
			|| (pos.x + 1 > fieldSize.x)
			|| (pos.y + 1 > fieldSize.y)
			|| (pos.z + 1 > fieldSize.z)
		) return true
		return false
	}
	
	function buildCube(pos, size, {f=field, val=1}={}) {
		for (let x = 0; x < size.x; x++) {
			for (let y = 0; y < size.y; y++) {
				for (let z = 0; z < size.z; z++) {
					field[x+pos.x][y+pos.y][z+pos.z] = val
				}
			}
		}
	}

    function buildRandomWalls({f=field, val=p=>1}={}) {
        for (let x = 0; x < fieldSize.x; x++) {
            for (let y = 0; y < fieldSize.y; y++) {
                for (let z = 0; z < fieldSize.z; z++) {
                    if (
                           x == 0 || x == fieldSize.x - 1
                        || y == 0 || y == fieldSize.y - 1
                        || z == 0 || z == fieldSize.z - 1
                    ) {
                        f[x][y][z] = val(new Vector3d(x, y, z))
                    }
                }
            }
        }
    }

    buildRandomWalls({val: pos => {
        return Math.random()
    }})

	const resolution = new Vector2d(args.resolution, Math.floor(args.resolution * (9 / 16)))
	
	let cameraPos = new Vector3d(4.14, 3.73, 4.12)
	let fovXDeg = args.fov / 180 * Math.PI;
	let fovYDeg = fovXDeg * (resolution.y / resolution.x);

    let cameraDir = new Vector3d(0.95, 0.28, 0.09).normalized
    let cameraSpeed = 0.1

    const cameraViewDistance = args.viewDistance
	
	function initDisplay(size, {defaultVal=" "}={}) {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        canvas.style.width = terminal.charWidth * 80 + "px"
        let heightPx = Math.floor(terminal.charWidth * 80 * (size.y / size.x))
        canvas.style.height = heightPx + "px"
        terminal.parentNode.appendChild(canvas)
        canvas.width = size.x
        canvas.height = size.y
        canvas.style.imageRendering = "pixelated"
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        terminal.addLineBreak()
        return [context.getImageData(0, 0, size.x, size.y), context, canvas]
	}

	const [canvasPixelData, context2d, canvas] = initDisplay(resolution)
	
    function raycast(pos, dir, {stepScalar=0.1, maxDist=maxFieldDistance, f=field}={}) {
        const originalPos = pos.copy()
        let normalisedDir = dir.normalized
        let usingNormalisedDir = true
        let floored = pos.floor()
        let coveredDistance = 0
        while (!isOutOfBounds(floored)) {
            floored = pos.floor()
            let block = f[floored.x][floored.y][floored.z]
            if (block != 0) {
                if (usingNormalisedDir) {
                    pos = pos.sub(normalisedDir)
                    coveredDistance -= 1
                    usingNormalisedDir = false
                } else {
                    let distance = pos.distanceTo(originalPos)
                    return [block, distance]
                }
            }
            if (coveredDistance > maxDist)
                return [0, maxDist]
            if (usingNormalisedDir) {
                pos = pos.add(normalisedDir)
                coveredDistance += 1
            } else {
                pos = pos.add(normalisedDir.mul(stepScalar))
                coveredDistance += stepScalar
            }
        }
        return [0, Infinity]
    }

    function init2dArray(size, {defaultVal=0}={}) {
        let arr = []
        for (let y = 0; y < size.y; y++) {
            let row = []
            for (let x = 0; x < size.x; x++) {
                row.push(defaultVal)
            }
            arr.push(row)
        }
        return arr
    }

    function render() {
        let displayColors = init2dArray(resolution, {defaultVal: Color.BLACK})
        function renderData() {
            for (let y = 0; y < resolution.y; y++) {
                for (let x = 0; x < resolution.x; x++) {
                    let color = displayColors[y][x]
                    let index = (y * resolution.x + x) * 4
                    canvasPixelData.data[index] = color.r
                    canvasPixelData.data[index + 1] = color.g
                    canvasPixelData.data[index + 2] = color.b
                    canvasPixelData.data[index + 3] = 255
                }
            }
            context2d.putImageData(canvasPixelData, 0, 0)
        }
        for (let y = 0; y < resolution.y; y++) {
            for (let x = 0; x < resolution.x; x++) {
                let xAngleOffset = (x / resolution.x - 0.5) * fovXDeg
                let yAngleOffset = (y / resolution.y - 0.5) * fovYDeg
                let rayDir = cameraDir
                    .rotateZ(xAngleOffset)
                    .rotateUp(yAngleOffset)
                let [raycastResult, distance] = raycast(cameraPos, rayDir, {maxDist: cameraViewDistance})
                let color = colorFromVals(raycastResult, distance)
                displayColors[y][x] = color
            }
        }
        renderData()
    }

    function checkBlockCollison({f=field}={}) {
        let floored = cameraPos.floor()
        if (isOutOfBounds(floored)) return false
        return f[floored.x][floored.y][floored.z] != 0
    }

    let gameRunning = true

    function endGame() {
        gameRunning = false
        canvas.remove()
    }

    terminal.onInterrupt(endGame)

    let rotateSpeed = Math.PI / 128

    const movement = {
        forward: () => cameraPos = cameraPos.add(cameraDir.mul(cameraSpeed)),
        backward: () => cameraPos = cameraPos.sub(cameraDir.mul(cameraSpeed)),
        left: () => cameraPos = cameraPos.add(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed)),
        right: () => cameraPos = cameraPos.sub(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed)),
        up: () => cameraPos = cameraPos.sub(new Vector3d(0, 0, 1).mul(cameraSpeed)),
        down: () => cameraPos = cameraPos.add(new Vector3d(0, 0, 1).mul(cameraSpeed)),
        turnup: () => cameraDir = cameraDir.rotateUp(-rotateSpeed),
        turndown: () => cameraDir = cameraDir.rotateUp(rotateSpeed),
        turnleft: () => cameraDir = cameraDir.rotateZ(-rotateSpeed),
        turnright: () => cameraDir = cameraDir.rotateZ(rotateSpeed),
    }

    const antiKeyMappings = {
        FORWARD: "BACKWARD",
        BACKWARD: "FORWARD",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
        UP: "DOWN",
        DOWN: "UP",
        TURN_LEFT: "TURN_RIGHT",
        TURN_RIGHT: "TURN_LEFT",
        TURN_UP: "TURN_DOWN",
        TURN_DOWN: "TURN_UP"
    }

    let keyDown = {
        FORWARD: false,
        BACKWARD: false,
        LEFT: false,
        RIGHT: false,
        UP: false,
        DOWN: false,
        TURN_LEFT: false,
        TURN_RIGHT: false,
        TURN_UP: false,
        TURN_DOWN: false
    }

    const keyMappings = {
        w: "FORWARD",
        s: "BACKWARD",
        a: "LEFT",
        d: "RIGHT",
        ArrowUp: "TURN_UP",
        ArrowDown: "TURN_DOWN",
        ArrowLeft: "TURN_LEFT",
        ArrowRight: "TURN_RIGHT",
        " ": "UP",
        Shift: "DOWN"
    }

    let upListener = addEventListener("keyup", function(event) {
        if (!gameRunning) return

        let keyCode = event.key
        if (keyCode in keyMappings) {
            keyDown[keyMappings[keyCode]] = false
            event.preventDefault()
        }
    })

    let downListener = addEventListener("keydown", function(event) {
        if (!gameRunning || event.repeat) return

        let keyCode = event.key
        if (keyCode in keyMappings) {
            keyDown[keyMappings[keyCode]] = true
            if (keyCode in antiKeyMappings) {
                keyDown[antiKeyMappings[keyCode]] = false
            }
            event.preventDefault()
        }
    })

    function processInput() {
        let prevPos = cameraPos.copy()

        if (keyDown.FORWARD) movement.forward()
        if (keyDown.BACKWARD) movement.backward()
        if (keyDown.LEFT) movement.left()
        if (keyDown.RIGHT) movement.right()
        if (keyDown.UP) movement.up()
        if (keyDown.DOWN) movement.down()
        if (keyDown.TURN_LEFT) movement.turnleft()
        if (keyDown.TURN_RIGHT) movement.turnright()
        if (keyDown.TURN_UP) movement.turnup()
        if (keyDown.TURN_DOWN) movement.turndown()

        if (checkBlockCollison()) {
            cameraPos = prevPos
        }
    }

    terminal.printLine("Use WASD to move, arrow keys to rotate, shift and space to move up and down")

    terminal.scroll()

    function loop() {
        processInput()
        render()

        terminal.window.requestAnimationFrame(loop)
    }

    loop()

    while (gameRunning) {
        await sleep(100)
    }

}, {
	description: "3d raycasting test",
    args: {
        "?fov:i:1~720": "Field of view in degrees",
        "?res=resolution:i:1~1000": "Resolution (width) in Pixels",
        "?x=roomX:i:5~100": "Room size in x direction",
        "?y=roomY:i:5~100": "Room size in y direction",
        "?z=roomZ:i:5~100": "Room size in z direction",
        "?v=viewDistance:i:1~9999": "View distance in blocks"
    },
    defaultValues: {
        fov: 90,
        resolution: 90,
        roomX: 30,
        roomY: 10,
        roomZ: 10,
        viewDistance: 13
    }
})