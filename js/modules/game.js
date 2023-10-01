function angleDifference(a, b) {
    var diff = a - b
    while (diff < -Math.PI/2) diff += Math.PI
    while (diff > Math.PI/2) diff -= Math.PI
    return diff
}

class Vector2d {

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    copy() {
        return new Vector2d(this.x, this.y)
    }

    add(v) {
        return new Vector2d(this.x + v.x, this.y + v.y)
    }

    iadd(v) {
        this.x += v.x
        this.y += v.y
    }

    sub(v) {
        return new Vector2d(this.x - v.x, this.y - v.y)
    }

    isub(v) {
        this.x -= v.x
        this.y -= v.y
    }

    mul(v) {
        return new Vector2d(this.x * v.x, this.y * v.y)
    }

    imul(v) {
        this.x *= v.x
        this.y *= v.y
    }

    div(v) {
        return new Vector2d(this.x / v.x, this.y / v.y)
    }

    idiv(v) {
        this.x /= v.x
        this.y /= v.y
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    get normalized() {
        let m = this.length
        return new Vector2d(this.x / m, this.y / m)
    }
    
    scale(x) {
        return new Vector2d(this.x * x, this.y * x)
    }

    lerp(v, t) {
        let delta = v.sub(this)
        return this.add(delta.scale(t))
    }

    dot(v) {
        return this.x * v.x + this.y * v.y
    }

    iscale(x) {
        this.x *= x
        this.y *= x
    }

    distance(v) {
        return this.sub(v).length
    }

    cross(v) {
        return this.x * v.y - this.y * v.x
    }

    static fromAngle(angle) {
        return new Vector2d(Math.cos(angle), Math.sin(angle))
    }

    static fromPolar(mag, angle) {
        return new Vector2d(mag * Math.cos(angle), mag * Math.sin(angle))
    }

    static fromArray(arr) {
        return new Vector2d(arr[0], arr[1])
    }

    set(x, y) {
        this.x = x
        this.y = y
    }

    addX(x) {
        return new Vector2d(this.x + x, this.y)
    }

    addY(y) {
        return new Vector2d(this.x, this.y + y)
    }

    rotate(angle) {
        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
        let y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
        return new Vector2d(x, y)
    }

    irotate(angle) {
        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
        let y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
        this.x = x
        this.y = y
    }

    static random() {
        let direction = Math.random() * Math.PI * 2
        return Vector2d.fromAngle(direction)
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    angleDifference(v) {
        return angleDifference(this.angle, v.angle)
    }

    angleTo(v) {
        return Math.atan2(v.y - this.y, v.x - this.x)
    }

    equals(v) {
        return this.x == v.x && this.y == v.y
    }

    map(f) {
        return new Vector2d(f(this.x), f(this.y))
    }

    product() {
        return this.x * this.y
    }

    get array() {
        return [this.x, this.y]
    }

    get min() {
        return Math.min(...this.array)
    }

    get max() {
        return Math.max(...this.array)
    }

    toArray() {
        return [this.x, this.y]
    }

}

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

    get array() {
        return [this.x, this.y, this.z]
    }

    get min() {
        return Math.min(...this.array)
    }

    get max() {
        return Math.max(...this.array)
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

    lerp(other, t) {
        return this.add(other.sub(this).mul(t))
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

    setAngleUp(angle) {
        let temp = this.angleZ
        return this.setAngleZ(0).setAngleY(angle).setAngleZ(temp)
    }

    get angleUp() {
        return this.setAngleZ(0).angleY
    }

    rotateRight(angle) {
        return this.rotateZ(angle)
        let temp = this.angleUpS
        return this.setAngleUp(0).rotateZ(angle).setAngleUp(temp)
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

class HighscoreApi {

    static baseUrl = "./api/"
    static tempName = null
    static tempGame = null
    static tempPassword = null
	static username = null

    static async req(url, data) {
        url = this.baseUrl + url + ".php?"
        for (let key in data)
            url += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]) + "&"
        let response = await fetch(url.slice(0, -1))
        return await response.text()
    }

    static async getHighscores(game) {
        let data = await this.req("get_highscores", {game})
        return JSON.parse(data)
    }

    static async addHighscore(game, name, score) {
        await this.req("upload_highscore", {game, name, score})
    }

    static async removeHighscore(password, uid) {
        await this.req("remove_highscore", {password, uid})
    }
    
    static async getUsername() {
    	if (this.username) {
    		this.tempName = this.username
    		return
    	}
    
    	this.tempName = await terminal.prompt("[highscores] Your name: ")
        while (!/^[a-zA-Z0-9_\-]{1,20}$/.test(this.tempName)) {
            terminal.printError("Name must be 1-20 characters long and only contain letters, numbers, dashes and underscores")
            this.tempName = await terminal.prompt("[highscores] Your name: ")
        }

        terminal.print("Tip: You can set your username permanently using ")
        terminal.printCommand(`name set ${this.tempName}`)
    }

    static async registerProcess(game, {
        ask=true
    }={}) {
        if (ask) {
            try {
                await terminal.acceptPrompt("[highscores] Do you want to upload your score?", false)
            } catch {
                terminal.printLine("[highscores] Score not uploaded")
                this.tempGame = null
                return
            }
        }

        this.tempGame = game
        await this.getUsername()
    }

    static async getRank(game, score, scores) {
        let highscores = scores ?? await this.getHighscores(game)
        let rank = 1
        let lastScore = null
        for (let highscore of highscores) {
            if (lastScore != null && lastScore == highscore.score) {
                continue
            }
            if (highscore.score > score) rank++
            lastScore = highscore.score
        }
        return rank
    }

    static async uploadScore(score) {
        if (this.tempGame == null) return
        await this.addHighscore(this.tempGame, this.tempName, score)

        let rank = await this.getRank(this.tempGame, score)

        if (rank == 1) {
            terminal.printSuccess("You got the new highscore! Congratulations!")
        } else if (rank == 2) {
            terminal.printSuccess("You got the second best score! Congratulations!")
        } else if (rank == 3) {
            terminal.printSuccess("You got the third best score! Congratulations!")
        } else {
            terminal.printSuccess("You got rank " + rank)
        }

        terminal.print("You can view the highscores using ")
        terminal.printCommand("highscores " + this.tempGame)

        this.tempGame = null
    }

    static async getHighscore(game) {
        let highscores = await this.getHighscores(game)
        if (highscores.length == 0) return null
        return highscores[0]
    }

    static async loginAdmin(silent=false) {
        if (this.tempPassword != null) return

        let password = null

        if (localStorage.getItem("highscore_password") != null) {
            password = localStorage.getItem("highscore_password")
        } else {
            password = await terminal.prompt("Password: ", {password: true})
        }

        let data = await this.req("admin", {confirm: true, password})
        if (data === "Confirmed") {
            if (!silent) {
                terminal.printSuccess("Logged in as admin")
            }
            this.tempPassword = password
            localStorage.setItem("highscore_password", password)
        } else {
            localStorage.removeItem("highscore_password")
            throw new Error("Incorrect password")
        }
    }

    static async removeHighscoreProcess() {
        await this.loginAdmin()
    }
    
    static async setUsername(newUsername) {
    	this.username = newUsername
    	localStorage.setItem("highscore_username", newUsername)
    }
    
    static async resetUsername() {
        this.username = null
    	localStorage.removeItem("highscore_username")
    }
    
    static async loadUsernameFromLocalStorage() {
    	this.username = localStorage.getItem("highscore_username") || null
    }

}

class CanvasDrawer {

    static async promptOptions(context, {
        options=[
            "Respawn",
            "Upload Score",
            "Exit"
        ],
        infoLines=[]
    }={}) {
        let promptActive = true

        let canvas = context.canvas

        let extraLines = [
            "Use arrow keys to select an option",
            "Press enter to select an option"
        ].concat(infoLines).concat([""])

        const drawBackground = () => {
            context.fillStyle = "black"
            context.fillRect(0, 0, canvas.width, canvas.height)
        }

        let optionsIndex = 0

        const drawOptions = () => {
            let textSize = 20
            let textMargin = 10
            let textHeight = textSize + textMargin
            context.font = textSize + "px monospace"
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillStyle = "white"

            let lines = extraLines.concat(options)
            lines[optionsIndex + extraLines.length] = `> ${lines[optionsIndex + extraLines.length]} <`

            let yOffset = canvas.height / 2 - textHeight * (lines.length - 1) / 2
            for (let i = 0; i < lines.length; i++) {
                context.fillText(
                    lines[i],
                    canvas.width / 2,
                    yOffset + textHeight * i
                )
            }
        }

        const draw = () => {
            drawBackground()
            drawOptions()
        }

        terminal.onInterrupt(() => promptActive = false)

        terminal.window.addEventListener("keydown", e => {
            if (!promptActive) return

            if (e.key == "ArrowUp" || e.key == "ArrowLeft") {
                optionsIndex--
                e.preventDefault()
                if (optionsIndex < 0) optionsIndex = options.length - 1
            } else if (e.key == "ArrowDown" || e.key == "ArrowRight") {
                optionsIndex++
                e.preventDefault()
                if (optionsIndex >= options.length) optionsIndex = 0
            }

            if (e.key == "Enter") {
                promptActive = false
                e.preventDefault()
            }

            draw()
        })

        draw()

        while (promptActive) {
            await terminal.sleep(100)
            draw()
        }

        return optionsIndex
    }

}

HighscoreApi.loadUsernameFromLocalStorage()

function printSquareCanvas({widthChars=60}={}) {
    let canvas = terminal.document.createElement("canvas")
    let sizePx = terminal.charWidth * widthChars
    canvas.width = sizePx
    canvas.height = sizePx
    terminal.parentNode.appendChild(canvas)
    return canvas
}

terminal.modules.game = {
    Vector2d,
    Vector3d,
    angleDifference,
    HighscoreApi,
    CanvasDrawer,
    addEventListener: terminal.window.addEventListener,
    removeEventListener: terminal.window.removeEventListener,
    requestAnimationFrame: terminal.window.requestAnimationFrame,
    setInterval: terminal.window.setInterval,
    clearInterval: terminal.window.clearInterval,
    setTimeout: terminal.window.setTimeout,
    clearTimeout: terminal.window.clearTimeout,
    printSquareCanvas: printSquareCanvas
}