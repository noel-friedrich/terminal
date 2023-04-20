const legalLinkContainer = terminal.document.querySelector(".legal-links")
const legalLinkAnchors = legalLinkContainer.querySelectorAll("a")

const panelContainer = terminal.document.createElement("div")
panelContainer.classList.add("side-panel-container")

const closeButton = terminal.document.createElement("button")
closeButton.classList.add("side-panel-close")
closeButton.textContent = ">"

panelContainer.appendChild(closeButton)
terminal.document.body.appendChild(panelContainer)

let currPanelVisible = false

function getAllPanelButtons() {
    return panelContainer.querySelectorAll(".side-panel-button")
}

const putLegalLinksInOrder = (noAnimate=false) => {
    if (currPanelVisible) {
        legalLinkContainer.animate([
            { transform: "translateX(-50px)" },
            { transform: "translateX(-400px)" }
        ], {
            duration: noAnimate ? 0 : 300,
            easing: "ease-in-out",
            fill: "forwards"
        })
    } else {
        legalLinkContainer.animate([
            { transform: "translateX(-400px)" },
            { transform: "translateX(-50px)" }
        ], {
            duration: noAnimate ? 0 : 300,
            easing: "ease-out",
            fill: "forwards"
        })
    }
}

function togglePanel() {
    if (currPanelVisible) {
        panelContainer.animate([
            { transform: "translateX(0)" },
            { transform: "translateX(350px)" }
        ], {
            duration: 200,
            easing: "ease-in-out",
            fill: "forwards"
        })

        closeButton.animate([
            { transform: "rotate(0deg)" },
            { transform: "rotate(180deg)" },
        ], {
            duration: 300,
            easing: "ease-out",
            fill: "forwards"
        })

        getAllPanelButtons().forEach(button => {
            button.animate([
                { transform: "translateX(0)" },
                { transform: "translateX(50px)" }
            ], {
                duration: 300,
                easing: "ease-in-out",
                fill: "forwards"
            })
        })
    } else {
        panelContainer.animate([
            { transform: "translateX(350px)" },
            { transform: "translateX(0)" }
        ], {
            duration: 300,
            easing: "ease-out",
            fill: "forwards"
        })

        closeButton.animate([
            { transform: "rotate(180deg)" },
            { transform: "rotate(0deg)" },
        ], {
            duration: 300,
            easing: "ease-out",
            fill: "forwards"
        })

        getAllPanelButtons().forEach(button => {
            button.animate([
                { transform: "translateX(50px)" },
                { transform: "translateX(0)" }
            ], {
                duration: 300,
                easing: "ease-in-out",
                fill: "forwards"
            })
        })
    }
    currPanelVisible = !currPanelVisible
    terminal.data.sidepanel = currPanelVisible
    putLegalLinksInOrder()
}

function addButtons(buttonList) {
    for (let button of buttonList) {
        const buttonElement = terminal.document.createElement("button")
        buttonElement.classList.add("side-panel-button")
        buttonElement.textContent = button.text
        buttonElement.addEventListener("click", terminal.makeInputFunc(button.command))
        panelContainer.appendChild(buttonElement)
    }
}

addButtons([
    { text: "About Me", command: "cat root/about.txt" },
    { text: "Open Help Menu", command: "help" },
    { text: "List All Commands", command: "lscmds" },
    { text: "Play Minigolf", command: "minigolf" },
    { text: "List  All Games", command: "games" },
    { text: "Open A Calendar", command: `cal ${new Date().getFullYear()}` },
    { text: "Open A Clock", command: "clock" },
    { text: "Open A Calculator", command: "bc" },
    { text: "Hacker Mode", command: "cmatrix" },
    { text: "Easter Eggs", command: "easter-eggs" },
    { text: "Play Lunar Lander", command: "lunar-lander" },
    { text: "Play Asteroids", command: "asteroids" },
    { text: "Play A Sodoku ", command: "sodoku play" },
])

if (terminal.data.sidepanel) {
    togglePanel()
}

putLegalLinksInOrder(true)

closeButton.addEventListener("click", togglePanel)