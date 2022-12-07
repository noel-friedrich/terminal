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

    static async registerProcess(game) {
        try {
            await terminal.acceptPrompt("[highscores] Do you want to upload your score?", false)
        } catch {
            terminal.printLine("[highscores] Score not uploaded")
            this.tempGame = null
            return
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
            password = await terminal.prompt("Password: ", true)
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

HighscoreApi.loadUsernameFromLocalStorage()

terminal.modules.game = {
    Vector2d,
    angleDifference,
    HighscoreApi,
    addEventListener: terminal.window.addEventListener,
    removeEventListener: terminal.window.removeEventListener,
    requestAnimationFrame: terminal.window.requestAnimationFrame,
    setInterval: terminal.window.setInterval,
    clearInterval: terminal.window.clearInterval,
    setTimeout: terminal.window.setTimeout,
    clearTimeout: terminal.window.clearTimeout,
}