class KeyboardLayout {

    static get DEFAULT() {
        return [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
            ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
            ["⇑", "z", "x", "c", "v", "b", "n", "m", "<"],
            ["Tab", "Space", "Enter"]
        ]
    }

    static get DEFAULT_UPPERCASE() {
        return [
            ["!", "\"", "-", ".", "%", "&", "/", "(", ")", "="],
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
            ["⇓", "Z", "X", "C", "V", "B", "N", "M", "<"],
            ["Tab", "Space", "Enter"]
        ]
    }

    static get NUMBERS() {
        return [
            ["1", "2", "3", "4", "5"],
            ["6", "7", "8", "9", "0"]
        ]
    }

    static get ARROWS() {
        return [
            [null, "↑", null],
            ["←", "↓", "→"],
            ["STRG+C"]
        ]
    }

    static get GAME() {
        return [
            [null, "↑", null, null, "W", null],
            ["←", "↓", "→", "A", "S", "D"],
        ]
    }

    static get CMD_RUNNING() {
        return [
            ["STRG+C"]
        ]
    }

}

class MobileKeyboard {

    Layout = KeyboardLayout

    createContainer() {
        let container = document.createElement("div")
        container.id = "custom-keyboard"
        container.style.position = "fixed"
        container.style.bottom = "0"
        container.style.left = "0"
        container.style.width = "100%"
        container.style.height = "auto"
        container.style.display = "none"
        container.style.zIndex = "1000"
        container.style.color = "white"
        container.style.padding = "1rem"
        container.style.boxSizing = "border-box"
        container.style.display = "none"
        return container
    }

    createToggleButton() {
        let button = document.createElement("button")
        button.classList.add("top-button")
        button.style.position = "absolute"
        button.style.top = "0"
        button.style.right = "0"
        button.style.zIndex = "1001"
        button.style.margin = "10px"

        button.textContent = "⌨"

        terminal.document.body.appendChild(button)

        button.addEventListener("click", () => {
            if (this.isHidden) {
                this.show()
            } else {
                this.hide()
            }
        })

        return button
    }

    get isHidden() {
        return this.container.style.display == "none"
    }

    get clientHeight() {
        return this.container.clientHeight
    }

    get clientWidth() {
        return this.container.clientWidth
    }

    constructor(layout) {
        this.container = this.createContainer()
        this.toggleButton = this.createToggleButton()
        this.layout = layout || KeyboardLayout.DEFAULT
        this.buttons = []
        this.parseLayout(this.layout)
        terminal.document.body.appendChild(this.container)
    }

    updateLayout(layout, keepCallback=false) {
        this.layout = layout
        this.parseLayout(layout)

        if (keepCallback && this.oninput) {
            this.oninput = this.oninput
        }
    }

    clearLayout() {
        this.container.innerHTML = ""
        this.buttons = []
    }

    makeButton(text) {
        let button = document.createElement("button")
        button.classList.add("keyboard-button")
        button.dataset.keyCode = this.getKeyCode(text)

        if (text === null) {
            button.style.visibility = "hidden"
        } else if (text === "STRG+C" || text.toLowerCase() === "cancel") {
            button.onclick = () => {
                terminal.interrupt()
            }
        }

        button.addEventListener("contextmenu", e => {
            e.preventDefault()
        })

        button.textContent = text
        this.buttons.push(button)
        return button
    }

    addEventListeners(event, callback) {
        this.buttons.map(button => button.addEventListener(event, e => {
            callback(e, button.dataset.keyCode)
        }))
    }

    get oninput() {
        return this._oninput
    }

    getKeyValue(key) {
        if (key == "Enter") return "\n"
        if (key == "Space") return " "
        if (key == "Delete") return "\b"
        if (key == "Tab") return "\t"
        return key
    }

    isFunctionKey(key) {
        return key == "Enter" || key == "Delete" || key == "Tab" || key == "Backspace" || key == "<"
         || key == "ArrowUp" || key == "ArrowDown" || key == "ArrowLeft" || key == "ArrowRight"
    }

    getKeyCode(key) {
        if (key == "↑") key = "ArrowUp"
        if (key == "↓") key = "ArrowDown"
        if (key == "←") key = "ArrowLeft"
        if (key == "→") key = "ArrowRight"
        if (key == "<") key = "Backspace"
        if (key == "Delete") key = "Backspace"
        return key
    }

    set oninput(callback) {
        this._oninput = callback
        this.addEventListeners("click", event => {
            let key = event.target.textContent
            event.key = this.getKeyCode(key)
            event.keyValue = this.getKeyValue(key)
            event.isFunctionKey = this.isFunctionKey(key)
        
            if (event.key == "⇑") {
                this.updateLayout(KeyboardLayout.DEFAULT_UPPERCASE, true)
            } else if (event.key == "⇓") {
                this.updateLayout(KeyboardLayout.DEFAULT, true)
            } else {
                callback(event)
            }
        })
    }

    get onkeyup() {
        return this._onkeyup
    }

    set onkeyup(callback) {
        this._onkeyup = callback
        this.addEventListeners("touchend", callback)
    }

    get onkeydown() {
        return this._onkeydown
    }

    set onkeydown(callback) {
        this._onkeydown = callback
        this.addEventListeners("touchstart", callback)
    }

    parseLayout(layout) {
        this.clearLayout()
        this.container.style.gridTemplateRows = `repeat(${layout.length}, 1fr)`
        layout.map(row => {
            let rowElement = document.createElement("div")
            rowElement.style.display = "grid"
            rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`
            rowElement.style.borderRadius = "0.5em"
            rowElement.style.color = "white"
            rowElement.style.fontFamily = "monospace"
            rowElement.style.outline = "none"
            rowElement.style.cursor = "pointer"
            rowElement.style.userSelect = "none"
            rowElement.style.paddingTop = "0"
            rowElement.style.paddingBottom = "0"
            rowElement.style.webkitTapHighlightColor = "transparent"

            rowElement.buttons = row.map(text => {
                let button = this.makeButton(text)
                return button
            })
            
            return rowElement
        }).forEach(row => {
            row.buttons.forEach(button => {
                row.appendChild(button)
            })
            this.container.appendChild(row)
        })
    }

    show() {
        this.container.style.display = "block"
        terminal.parentNode.style.paddingBottom = this.clientHeight + 30 + "px"  
        terminal.scroll("smooth", false)
        return this
    }

    hide() {
        this.container.style.display = "none"
        return this
    }

}

terminal.mobileKeyboard = new MobileKeyboard()

terminal.window.addEventListener("keydown", event => {
    let key = event.key
    if (key == " ") key = "Space"
    for (let button of terminal.mobileKeyboard.buttons) {
        if (button.dataset.keyCode === key) {
            button.click()
            event.preventDefault()
        }
    }
})