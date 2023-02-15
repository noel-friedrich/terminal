terminal.addCommand("shoot", async function(args) {
	const world1 = `
+--------------------------------------------------------------------+
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                             |                                      |
|                  +----------+             +------------+           |
|                                                                    |
|                                                                    |
|                                                                    |
|                                                                    |
|         +-------------------+             +            +-----------|
|                                           |                        |
|                                           |                        |
|                                           |                        |
|                                           |                        |
+--------------------------------------------------------------------+`

    await terminal.modules.import("game", window)
		
	let fieldSize = null
	
	const N = " "
	const P1 = "A"
	const P2 = "Y"

	const isWall = textContent => [
		"|", "+", "-"
	].includes(textContent)
	
	let field = []
	
	let gravity = new Vector2d(0, 0.03)
	let jumpVel = new Vector2d(0, -0.5)
	
	const TOTAL_JUMPS = 1

	terminal.printLine("            CONTROLS                              OBJECTIVE          ")
	terminal.printLine("+------------------------------+      +------------------------------+")
	terminal.printLine("| Player | Action | Key        |      | Shoot the other player       |")
	terminal.printLine("|--------+--------+------------|      | without getting shot first.  |")
	terminal.printLine("| A      | Move   | A/D        |      | Escape the Bullet Hell by    |")
	terminal.printLine("| A      | Jump   | W 	       |      | using the environment to     |")
	terminal.printLine("| A      | Shoot  | Space      |      | jump around (there is also   |")
	terminal.printLine("| Y      | Move   | Left/Right |      | a double jump!).             |")
	terminal.printLine("| Y      | Jump   | Up 	       |      |                              |")
	terminal.printLine("| Y      | Shoot  | Enter      |      |           HAVE FUN!          |")
	terminal.printLine("+------------------------------+      +------------------------------+")
	terminal.printLine("")
	
	function printField(world=world1) {
		let worldData = world.split("\n").map(row => row.split(""))
		worldData.shift()

		fieldSize = new Vector2d(worldData[0].length, worldData.length)

		for (let i = 0; i < fieldSize.y; i++) {
			let row = []
			for (let j = 0; j < fieldSize.x; j++) {
				let data = worldData[i][j]
				let fill = data
				
				let element = terminal.print(fill, undefined, {forceElement: true})
				row.push(element)
			}
			terminal.addLineBreak()
			field.push(row)
		}
	}
	
	printField()
	
	let projectiles = []
	let keysDown = {}
	
	class Player {

		constructor(name, pos, char) {
			this.name = name
			this.pos = pos
			this.char = char
			this.vel = new Vector2d(0, 0)
			this.prevPos = null
			
			this.inputVel = new Vector2d(0, 0)
			this.inputJump = false
			this.inputShoot = false
			
			this.goingLeft = false
			
			this.jumpsLeft = 0
			this.speed = 0.5

			this.dead = false
		}

		hurt() {
			if (this.dead) return
			this.dead = true
			gameRunning = false
			terminal.printLine(`${this.name} was shot!`)
		}
		
		projectileDirection() {
			if (!this.goingLeft) return new Vector2d(0.5, 0)
			else return new Vector2d(-0.5, 0)
		}
		
		projectileChar() {
			if (this.char == P1) return "."
			if (this.char == P2) return "-"
		}
		
		shoot() {
			let projectile = new Projectile(this.pos.copy(), this.projectileDirection(), this.projectileChar())
			projectile.update()
			projectile.update()
			projectiles.push(projectile)
		}
		
		draw() {
			if (this.prevPos) {
				let prevX = Math.floor(this.prevPos.x)
				let prevY = Math.floor(this.prevPos.y)
				let prevElement = field[prevY][prevX]
				prevElement.textContent = N
			}
			
			let xPos = Math.floor(this.pos.x)
			let yPos = Math.floor(this.pos.y)
			let element = field[yPos][xPos]
			if (!element) {
				throw new Error(`Player ${this.name} out of bounds`)
			}
			
			element.textContent = this.char
		}
		
		getElement(dir) {
			let xPos = Math.floor(this.pos.x)
			let yPos = Math.floor(this.pos.y)
			try {
				return field[yPos + dir.y][xPos + dir.x]
			} catch {
				return null
			}
		}
		
		update() {
			this.prevPos = this.pos.copy()
			
			let underElement = this.getElement(new Vector2d(0, 1))
			let isOnGround = underElement.textContent == "-" || underElement.textContent == "+"
			
			if (!isOnGround) {
				this.vel.x += gravity.x
				this.vel.y += gravity.y
			}
			
			this.pos.x += this.inputVel.x * this.speed
			this.pos.y += this.inputVel.y * this.speed
			
			if (this.inputJump) {
				if (isOnGround) {
					this.jumpsLeft = TOTAL_JUMPS
					this.vel.y = jumpVel.y
					this.pos.y -= 1
				} else if (this.jumpsLeft > 0) {
					this.jumpsLeft--
					this.vel.y = jumpVel.y
				}
				this.inputJump = false
			}
			
			if (this.inputVel.x < 0) {
				this.goingLeft = true
			} else if (this.inputVel.x > 0) {
				this.goingLeft = false
			}
			
			if (this.inputShoot) {
				this.shoot()
				this.inputShoot = false
			}
			
			this.pos.x += this.vel.x
			this.pos.y += this.vel.y

			let newElement = this.getElement(new Vector2d(0, 0))
			if (!newElement || (newElement.textContent != N && newElement.textContent != this.char)) {
				this.pos.y = this.prevPos.y
				this.pos.x = this.prevPos.x
				this.vel.y = 0
			}
		}
		
	}
	
	let player1 = new Player("A", new Vector2d(2, 2), P1)
	let player2 = new Player("Y", new Vector2d(fieldSize.x - 3, 2), P2)

	class Projectile {
	
		constructor(pos, vel, char) {
			this.pos = pos
			this.vel = vel
			this.prevPos = null
			this.char = char
			
			this.deleteReady = false
		}
		
		draw() {
			if (this.prevPos) {
				let prevX = Math.floor(this.prevPos.x)
				let prevY = Math.floor(this.prevPos.y)
				let prevElement = field[prevY][prevX]
				prevElement.textContent = N
			}

			let element = this.getCurrElement()
			
			if (this.deleteReady && element) {
				element.textContent = N
			} else if (element) {
				element.textContent = this.char
			}
		}

		getCurrElement() {
			let xPos = Math.floor(this.pos.x)
			let yPos = Math.floor(this.pos.y)
			try {
				return field[yPos][xPos]
			} catch (e) {
				return null
			}
		}
		
		update() {
			this.prevPos = this.pos.copy()
			this.pos.x += this.vel.x
			this.pos.y += this.vel.y
			let element = this.getCurrElement()
			if (!element || isWall(element.textContent)) {
				this.deleteReady = true
				this.pos = this.prevPos
				return null
			}

			if (element.textContent == player1.char) {
				return player1
			} else if (element.textContent == player2.char) {
				return player2
			}

			return null
		}
		
	}

	function updatePlayerInputs() {
		if (keysDown["p1-up"]) {
			player1.inputJump = true
			keysDown["p1-up"] = false
		}

		if (keysDown["p2-up"]) {
			player2.inputJump = true
			keysDown["p2-up"] = false
		}

		if (keysDown["p1-left"]) player1.inputVel.x = -1
		else if (keysDown["p1-right"]) player1.inputVel.x = 1
		else player1.inputVel.x = 0

		if (keysDown["p2-left"]) player2.inputVel.x = -1
		else if (keysDown["p2-right"]) player2.inputVel.x = 1
		else player2.inputVel.x = 0

		if (keysDown["p1-shoot"]) {
			player1.inputShoot = true
			keysDown["p1-shoot"] = false
		}

		if (keysDown["p2-shoot"]) {
			player2.inputShoot = true
			keysDown["p2-shoot"] = false
		}
	}
	
	let gameRunning = true

	function keyToCode(key) {
		switch (key) {
			case "w": return "p1-up"
			case "a": return "p1-left"
			case "s": return "p1-down"
			case "d": return "p1-right"
			case " ": return "p1-shoot"
			case "arrowup": return "p2-up"
			case "arrowleft": return "p2-left"
			case "arrowdown": return "p2-down"
			case "arrowright": return "p2-right"
			case "enter": return "p2-shoot"
		}
	}
	
	addEventListener("keydown", event => {
		if (event.repeat || !gameRunning) return
		let key = event.key.toLowerCase()
		let code = keyToCode(key)
		if (code) {
			keysDown[code] = true
			event.preventDefault()
		}
	})
	
	addEventListener("keyup", event => {
		if (event.repeat || !gameRunning) return
		let key = event.key.toLowerCase()
		let code = keyToCode(key)
		if (code) {
			keysDown[code] = false
			event.preventDefault()
		}
	})
	
	const gameUpdate = () => {
		if (!gameRunning) return
		
		projectiles = projectiles.filter(p => !p.deleteReady)
		
		for (let p of projectiles) {
			let hitPlayer = p.update()
			p.draw()

			if (hitPlayer) {
				hitPlayer.hurt()
			}
		}
		
		updatePlayerInputs()

		player1.update()
		player1.draw()
		
		player2.update()
		player2.draw()
	}

	let intervalFunc = setInterval(gameUpdate, 1000 / 60)

	terminal.scroll()

	terminal.onInterrupt(() => {
		gameRunning = false
		clearInterval(intervalFunc)
	})
	
	while (gameRunning) {
		await sleep(100)
	}

	clearInterval(intervalFunc)
	
}, {
	description: "Play a game of Shoot against another player locally",
	isGame: true
})
