terminal.turtlo = {}

function removeExistingTurtlos() {
    let count = 0
    for (let element of terminal.document.querySelectorAll(".turtlo")) {
        if (!element.classList.contains("gone")) {
            element.classList.add("gone")
            count++
        }
    }
    return count
}

const TURTLO_CONTAINER = terminal.document.querySelector("#turtlo-container")

const TURTLO_STATE = {
    IDLE: "idle",
    WALKING: "walking"
}

function resetTurtlo() {
    terminal.turtlo = {
        x: -500,
        y: -500,
        goalX: terminal.window.innerWidth / 2,
        goalY: terminal.window.innerHeight / 2,
        rot: 0,
        moving: false,
        intervalFunc: null,
        imageElement: terminal.document.createElement("img"),
        startTime: Date.now(),
        state: TURTLO_STATE.WALKING,
        shellDuration: 0,
        lastShellTime: Date.now(),
        inShell: () => ((terminal.turtlo.lastShellTime + terminal.turtlo.shellDuration) > Date.now()),
        toungeDuration: 0,
        lastToungeTime: Date.now(),
        hasToungeOut: () => ((terminal.turtlo.lastToungeTime + terminal.turtlo.toungeDuration) > Date.now()),
        spinDuration: 3000,
        lastSpinTime: Date.now(),
        inSpin: () => ((terminal.turtlo.lastSpinTime + terminal.turtlo.spinDuration) > Date.now()),
        prevRot: 120,
        hugeSpinDuration: 0,
        lastHugeSpinTime: Date.now(),
        radiusFactor: 0.9,
        inHugeSpin: () => ((terminal.turtlo.lastHugeSpinTime + terminal.turtlo.hugeSpinDuration) > Date.now()),
        starTurtlos: [],
        hasStars: () => (terminal.turtlo.starTurtlos.length > 0),
        mouseStartX: 0,
        mouseStartY: 0,
    }
}

terminal.window.addEventListener("mousemove", function(event) {
    terminal.turtlo.goalX = event.clientX
    terminal.turtlo.goalY = event.clientY
    if (terminal.turtlo.imageElement) {
        terminal.turtlo.goalX -= terminal.turtlo.imageElement.clientWidth / 2
        terminal.turtlo.goalY -= terminal.turtlo.imageElement.clientHeight - 10
    }
})

function drawTurtlo() {
    let x = terminal.turtlo.x
    let y = terminal.turtlo.y

    let timeElapsed = (Date.now() - terminal.turtlo.startTime) % 1000
    if (terminal.turtlo.inHugeSpin()) {
        let walkingImages = ["walking-0", "walking-1", "walking-2", "walking-1"]
        let imageIndex = Math.floor(timeElapsed / 1001 * walkingImages.length)
        let currImage = walkingImages[imageIndex]
        terminal.turtlo.imageElement.src = "res/img/turtlo/" + currImage + ".png"
        let spinTimeElapsed = Date.now() - terminal.turtlo.lastHugeSpinTime
        let timeFactor = spinTimeElapsed / (terminal.turtlo.hugeSpinDuration * terminal.turtlo.spinAmountFactor)
        //terminal.turtlo.rot = timeFactor * 360 + terminal.turtlo.prevRot
        let windowRadius = Math.min(terminal.window.innerHeight, terminal.window.innerWidth) / 2 * terminal.turtlo.radiusFactor
        let [midX, midY] = [terminal.window.innerWidth / 2, terminal.window.innerHeight / 2]
        terminal.turtlo.goalX = Math.cos(timeFactor * Math.PI * 2 + terminal.turtlo.radiusStart) * windowRadius + midX
        terminal.turtlo.goalY = Math.sin(timeFactor * Math.PI * 2 + terminal.turtlo.radiusStart) * windowRadius + midY
    } else if (terminal.turtlo.inSpin()) {
        terminal.turtlo.imageElement.src = "res/img/turtlo/walking-0.png"
        let timeElapsed = Date.now() - terminal.turtlo.lastSpinTime
        terminal.turtlo.rot = ((timeElapsed / terminal.turtlo.spinDuration) * 360 + terminal.turtlo.prevRot)
    } else if (terminal.turtlo.inShell()) {
        terminal.turtlo.imageElement.src = "res/img/turtlo/hidden.png"
    } else if (terminal.turtlo.hasToungeOut()) {
        terminal.turtlo.imageElement.src = "res/img/turtlo/tounge.png"
    } else if (terminal.turtlo.state == TURTLO_STATE.WALKING) {
        let walkingImages = ["walking-0", "walking-1", "walking-2", "walking-1"]
        let imageIndex = Math.floor(timeElapsed / 1001 * walkingImages.length)
        let currImage = walkingImages[imageIndex]
        terminal.turtlo.imageElement.src = "res/img/turtlo/" + currImage + ".png"
    } else if (terminal.turtlo.state == TURTLO_STATE.IDLE) {
        terminal.turtlo.imageElement.src = "res/img/turtlo/walking-0.png"
    }

    if (terminal.turtlo.hasStars()) {
        for (let star of terminal.turtlo.starTurtlos) {
            star.x += star.directionX
            star.y += star.directionY
            star.element.style.top = star.y + "px"
            star.element.style.left = star.x + "px"
            let starAge = Date.now() - star.startOfLife
            let rotation = starAge / star.rotationTime * 360
            star.element.style.transform = `rotate(${rotation}deg)`
            star.element.style.opacity = Math.max(1, starAge / 1000)
        }

        function removeStar(star) {
            star.element.remove()
        }

        terminal.turtlo.starTurtlos = terminal.turtlo.starTurtlos.filter(star => {
            let starSize = star.element.clientWidth * 2
            if (star.x + starSize < 0 || star.x - starSize > terminal.window.innerWidth
                || star.y + starSize < 0 || star.y - starSize > terminal.window.innerHeight) {
                removeStar(star)
                return false
            }
            return true
        })
    }

    terminal.turtlo.imageElement.style.top = y + "px"
    terminal.turtlo.imageElement.style.left = x + "px"
    terminal.turtlo.imageElement.style.transform = `rotate(${terminal.turtlo.rot}deg)`
}

function randomTurtloActivity() {
    let activities = {
        goIntoShell() {
            terminal.turtlo.lastShellTime = Date.now()
            terminal.turtlo.shellDuration = 5000 + 8000 * Math.random()
        },
        stickToungeOut() {
            terminal.turtlo.lastToungeTime = Date.now()
            terminal.turtlo.toungeDuration = 1000 + 1000 * Math.random()
        },
        moveToRandomSpot() {
            terminal.turtlo.goalX = Math.random() * terminal.window.innerWidth
            terminal.turtlo.goalY = Math.random() * terminal.window.innerHeight
        },
        spinAround() {
            terminal.turtlo.lastSpinTime = Date.now()
            terminal.turtlo.spinDuration = 300 + Math.random() * 2000
            terminal.turtlo.prevRot = terminal.turtlo.rot
        },
        spinWalkAround() {
            terminal.turtlo.lastHugeSpinTime = Date.now()
            terminal.turtlo.hugeSpinDuration = 5000 + Math.random() * 5000
            terminal.turtlo.spinAmountFactor = Math.random()
            terminal.turtlo.prevRot = terminal.turtlo.rot
            terminal.turtlo.radiusFactor = (0.4 + Math.random() * 0.5)
            terminal.turtlo.radiusStart = Math.random() * Math.PI * 2
        },
        walkout() {
            let prevX = terminal.turtlo.x
            let prevY = terminal.turtlo.y
            terminal.turtlo.goalX += (Math.random() - 0.5) * 2 * 300
            terminal.turtlo.goalX = -terminal.turtlo.imageElement.clientWidth * 2 - 100
            setTimeout(function() {
                if (terminal.turtlo.x > 0) return
                terminal.turtlo.x = terminal.window.innerWidth + 100
                terminal.turtlo.goalX = prevX
                terminal.turtlo.goalY = prevY
            }, Math.random() * 1000 + 2000)
        },
        starCopy() {
            let starTurtlos = []
            const numCopies = Math.floor(Math.random() * 10) + 10
            let speed = Math.random() * 5 + 5
            for (let i = 0; i < numCopies; i++) {
                let element = document.createElement("img")
                element.src = terminal.turtlo.imageElement.src
                let directionAngle = (i / numCopies) * Math.PI * 2
                element.style.transform = `rotate(${directionAngle * 180 / Math.PI}deg)`
                element.style.opacity = 0
                let speedFactor = Math.random() + 0.5
                let directionX = Math.cos(directionAngle) * speed * speedFactor
                let directionY = Math.sin(directionAngle) * speed * speedFactor
                starTurtlos.push({
                    element,
                    x: terminal.turtlo.x,
                    y: terminal.turtlo.y,
                    directionX,
                    directionY,
                    speed,
                    rotationTime: Math.random() * 1000 + 500,
                    startOfLife: Date.now(),
                })
                element.classList.add("turtlo")
                TURTLO_CONTAINER.appendChild(element)
            }
            terminal.turtlo.starTurtlos = terminal.turtlo.starTurtlos.concat(starTurtlos)
        }
    }
    
    let activityChances = [
        [activities.goIntoShell,      2],
        [activities.stickToungeOut,   6],
        [activities.spinAround,       4],
        [activities.spinWalkAround,   4],
        [activities.moveToRandomSpot, 4],
        [activities.walkout,          2],
        [activities.starCopy,         1],
    ]

    let totalChance = activityChances.map(e => e[1]).reduce((a, e) => a + e, 0)
    let randomValue = Math.random() * totalChance
    let cumulativeChance = 0
    for (let [activity, chance] of activityChances) {
        cumulativeChance += chance
        if (cumulativeChance > randomValue) {
            activity()
            break
        }
    }
}

function moveTurtlo() {
    if (!terminal.turtlo.inShell()) {
        let xDiff = terminal.turtlo.goalX - terminal.turtlo.x
        let yDiff = terminal.turtlo.goalY - terminal.turtlo.y
        terminal.turtlo.x += xDiff * 0.05
        terminal.turtlo.y += yDiff * 0.05

        while (terminal.turtlo.rot < 0)
            terminal.turtlo.rot += 360
        while (terminal.turtlo.rot > 360)
            terminal.turtlo.rot -= 360

        let rotation = (Math.atan2(yDiff, xDiff) + Math.PI / 2) * 180 / Math.PI
        let rotDiff = (terminal.turtlo.rot - rotation)
        if (rotDiff > 180)
            rotDiff -= 360
        if (rotDiff < -180)
            rotDiff += 360
        terminal.turtlo.rot -= rotDiff * 0.5

        let length = Math.sqrt(xDiff ** 2 + yDiff ** 2)
        terminal.turtlo.state = (length > 25) ? TURTLO_STATE.WALKING : TURTLO_STATE.IDLE
    }

    if (terminal.turtlo.state == TURTLO_STATE.IDLE) {
        let chance = Math.random() < 0.01
        if (!chance)
            return
        if (terminal.turtlo.hasToungeOut() || terminal.turtlo.inShell() || terminal.turtlo.inSpin() || terminal.turtlo.inHugeSpin())
            return
        randomTurtloActivity()
    }
}

function updateTurtlo() {
    drawTurtlo()
    moveTurtlo()
}

function startTurtlo(cssClass=null, silent=false) {
    if (!silent) {
        terminal.print("to remove turtlo, use ")
        terminal.printCommand("kill turtlo", "kill turtlo", Color.COLOR_1)
    }
    removeExistingTurtlos()
    if (terminal.turtlo.intervalFunc)
        clearInterval(terminal.turtlo.intervalFunc)
    resetTurtlo()
    terminal.turtlo.imageElement.classList.add("turtlo")
    if (cssClass) terminal.turtlo.imageElement.classList.add(cssClass)
    drawTurtlo()
    TURTLO_CONTAINER.appendChild(terminal.turtlo.imageElement)
    terminal.turtlo.intervalFunc = setInterval(updateTurtlo, 50)
}

terminal.modules.turtlo = {

    spawn({size=1, silent=false}={}) {
        switch(size) {
            case 1:
                startTurtlo(null, silent)
                break
            case 2:
                startTurtlo("huge", silent)
                break
            case 3:
                startTurtlo("hugehuge", silent)
                break
            default:
                throw new Error("invalid size for turtlo")
        }
        terminal.log("spawned turtlo")
    },

    kill() {
        if (terminal.turtlo.intervalFunc)
            clearInterval(terminal.turtlo.intervalFunc)
        if (removeExistingTurtlos() != 0) {
            terminal.log("killed turtlo")
            return true
        } else {
            return false
        }
    }

}