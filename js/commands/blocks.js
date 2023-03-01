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

    floor() {
        return new Vector3d(
            Math.floor(this.x),
            Math.floor(this.y),
            Math.floor(this.z)
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

}

terminal.modules.Vector3d = Vector3d

terminal.addCommand("blocks", async function(args) {
	await terminal.modules.import("game", window)

    const blockHueMap = {
        0: 0,
    }
	
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

    buildRandomWalls({val: pos => Math.random()})

	const resolution = new Vector2d(args.resolution, Math.floor(args.resolution / 3))
	
	let cameraPos = new Vector3d(4.14, 3.73, 4.12)
	let fovXDeg = args.fov / 180 * Math.PI;
	let fovYDeg = fovXDeg * (resolution.y * 2 / resolution.x);

    let cameraDir = new Vector3d(0.95, 0.28, 0.09).normalized
    let cameraSpeed = 0.1
	
	function initDisplay(size, {defaultVal=" "}={}) {
		let display = []
		for (let y = 0; y < size.y; y++) {
			let displayRow = []
			for (let x = 0; x < size.x; x++) {
				let element = terminal.print(defaultVal, undefined, {forceElement: true})
                element.style.transition = "none"
                displayRow.push(element)
			}
			display.push(displayRow)
			terminal.addLineBreak()
		}
		return display
	}
	let display = initDisplay(resolution)
	
    function raycast(pos, dir, {stepScalar=0.2, maxDist=maxFieldDistance, f=field}={}) {
        const originalPos = pos.copy()
        dir = dir.normalized.mul(stepScalar)
        let floored = pos.floor()
        while (!isOutOfBounds(floored)) {
            floored = pos.floor()
            let block = f[floored.x][floored.y][floored.z]
            if (block != 0) {
                let distance = pos.distanceTo(originalPos)
                return [block, distance]
            }
            if (maxDist != maxFieldDistance) {
                if (pos.distanceTo(originalPos) > maxDist)
                    return [0, maxDist]
            }
            pos = pos.add(dir)
        }
        return [0, Infinity]
    }

    function render() {
        let displayVals = display.map(row => row.map(() => 0))
        let displayColors = display.map(row => row.map(() => Color.fromHex("#000000")))
        function updateTextContents() {
            for (let y = 0; y < resolution.y; y++) {
                for (let x = 0; x < resolution.x; x++) {
                    let value = displayVals[y][x] ? "#" : " "
                    display[y][x].textContent = value
                    display[y][x].style.color = displayColors[y][x]
                }
            }
        }
        for (let y = 0; y < resolution.y; y++) {
            for (let x = 0; x < resolution.x; x++) {
                let xAngleOffset = (x / resolution.x - 0.5) * fovXDeg
                let yAngleOffset = (y / resolution.y - 0.5) * fovYDeg
                let rayDir = cameraDir
                    .rotateZ(xAngleOffset)
                    .rotateUp(yAngleOffset)
                let [raycastResult, distance] = raycast(cameraPos, rayDir, {maxDist: 12})
                displayVals[y][x] = raycastResult
                let distanceFactor = distance * 6
                let hue = raycastResult * 360
                let color = `hsl(${hue}deg, 100%, ${80 - distanceFactor}%)`
                displayColors[y][x] = color
            }
        }
        updateTextContents()
    }

    function checkBlockCollison({f=field}={}) {
        let floored = cameraPos.floor()
        if (isOutOfBounds(floored)) return false
        return f[floored.x][floored.y][floored.z] != 0
    }

    let gameRunning = true

    terminal.onInterrupt(() => {
        gameRunning = false
    })

    let rotateSpeed = Math.PI / 32

    let downListener = addEventListener("keydown", function(event) {
        if (!gameRunning) return

        let key = event.key.toLocaleLowerCase()

        let prevPos = cameraPos.copy()

        let keyEvents = {
            w: () => {
                cameraPos = cameraPos.add(cameraDir.mul(cameraSpeed))
            },
            s: () => {
                cameraPos = cameraPos.sub(cameraDir.mul(cameraSpeed))
            },
            a: () => {
                cameraPos = cameraPos.add(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed))
            },
            d: () => {
                cameraPos = cameraPos.sub(cameraDir.cross(new Vector3d(0, 0, 1)).mul(cameraSpeed))
            },
            arrowright: () => {
                cameraDir = cameraDir.rotateZ(rotateSpeed)
            },
            arrowleft: () => {
                cameraDir = cameraDir.rotateZ(-rotateSpeed)
            },
            arrowdown: () => {
                cameraDir = cameraDir.rotateUp(rotateSpeed)
            },
            arrowup: () => {
                cameraDir = cameraDir.rotateUp(-rotateSpeed)
            },
            shift: () => {
                cameraPos = cameraPos.add(new Vector3d(0, 0, 1).mul(cameraSpeed))
            },
            " ": () => {
                cameraPos = cameraPos.sub(new Vector3d(0, 0, 1).mul(cameraSpeed))
            }
        }

        if (key in keyEvents) {
            keyEvents[key]()
            if (checkBlockCollison())
                cameraPos = prevPos
            event.preventDefault()
            render()
        }

        terminal.window.cameraDir = cameraDir
        terminal.window.cameraPos = cameraPos
    })

    terminal.printLine("Use WASD to move, arrow keys to rotate, shift and space to move up and down")

    render()

    terminal.scroll()

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
        "?z=roomZ:i:5~100": "Room size in z direction"
    },
    defaultValues: {
        fov: 90,
        resolution: 90,
        roomX: 30,
        roomY: 10,
        roomZ: 10
    }
})