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
	let fovXDeg = args.fov / 180 * Math.PI
	let fovYDeg = fovXDeg * (resolution.y / resolution.x)
    
    let leftMostAngle = -fovXDeg / 2
    let rightMostAngle = fovXDeg / 2
    let topMostAngle = -fovYDeg / 2
    let bottomMostAngle = fovYDeg / 2

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
        let normalisedDir = dir
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

        let projectionPlaneTopLeft = cameraPos.add(cameraDir.rotateRight(leftMostAngle).rotateUp(topMostAngle))

        let leftRef = cameraDir.add(cameraDir.rotateRight(leftMostAngle))
        let rightRef = cameraDir.add(cameraDir.rotateRight(rightMostAngle))

        let topRef = cameraDir.add(cameraDir.rotateUp(topMostAngle))
        let bottomRef = cameraDir.add(cameraDir.rotateUp(bottomMostAngle))

        let xDiff = rightRef.sub(leftRef)
        let yDiff = bottomRef.sub(topRef)

        terminal.window.xDiff = xDiff.length
        terminal.window.yDiff = yDiff.length
        
        for (let y = 0; y < resolution.y; y++) {
            for (let x = 0; x < resolution.x; x++) {
                let xRatio = x / resolution.x
                let yRatio = y / resolution.y

                let projectionPlaneDestination = projectionPlaneTopLeft.add(
                    xDiff.mul(xRatio)).add(yDiff.mul(yRatio))
                let rayDir = projectionPlaneDestination.sub(cameraPos).normalized

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
        FORWARD: () => cameraPos = cameraPos.add(cameraDir.mul(cameraSpeed)),
        BACKWARD: () => cameraPos = cameraPos.sub(cameraDir.mul(cameraSpeed)),
        LEFT: () => cameraPos = cameraPos.add(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed)),
        RIGHT: () => cameraPos = cameraPos.sub(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed)),
        UP: () => cameraPos = cameraPos.sub(new Vector3d(0, 0, 1).mul(cameraSpeed)),
        DOWN: () => cameraPos = cameraPos.add(new Vector3d(0, 0, 1).mul(cameraSpeed)),
        TURN_UP: () => cameraDir = cameraDir.rotateUp(-rotateSpeed),
        TURN_DOWN: () => cameraDir = cameraDir.rotateUp(rotateSpeed),
        TURN_LEFT: () => cameraDir = cameraDir.rotateZ(-rotateSpeed),
        TURN_RIGHT: () => cameraDir = cameraDir.rotateZ(rotateSpeed),
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
        if (gameRunning && event.repeat) event.preventDefault()
        if (!gameRunning || event.repeat) return

        let keyCode = event.key
        if (keyCode in keyMappings) {
            let keyMapping = keyMappings[keyCode]
            keyDown[keyMapping] = true
            if (keyMapping in antiKeyMappings) {
                keyDown[antiKeyMappings[keyMapping]] = false
            }
            event.preventDefault()
        }
    })

    function processInput() {
        let prevPos = cameraPos.copy()

        for (let key in keyDown) {
            if (keyDown[key]) {
                movement[key]()
            }
        }

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