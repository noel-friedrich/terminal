const cssCode = {
    ".editor-parent": {
        "width": "100%",
        "resize": "both",
        "display": "grid",
        "grid-template-rows": "auto 1fr",
        "grid-template-columns": "1fr",
    },

    ".editor-header-title": {
        "width": "fit-content",
        "color": "var(--background)",
        "background": "var(--foreground)",
    },

    ".editor-body": {
        "display": "grid",
        "grid-template-rows": "1fr",
        "grid-template-columns": "auto 1fr",
    },

    ".editor-sidebar": {
        "color": "var(--background)",
        "background": "var(--foreground)",
        "padding-right": "0.1em",
        "padding-left": "0.1em",
    },

    ".editor-content": {
        "outline": "none",
        "padding-right": "0.5em",
        "padding-left": "0.5em",
    },

    ".editor-content > div:focus-visible": {
        "outline": "none",
        "background": "#1d1d1d",
    },
}

function createEditorHTML() {
    let parent = createElement("div", {className: "editor-parent"})
    let header = createElement("div", {className: "editor-header"}, parent)
    let headerTitle = createElement("div", {className: "editor-header-title"}, header)
    let body = createElement("div", {className: "editor-body"}, parent)
    let sidebar = createElement("div", {className: "editor-sidebar"}, body)
    let contentScroll = createElement("div", {className: "editor-content-scroll"}, body)
    let content = createElement("div", {
        className: "editor-content",
        contentEditable: true,
    }, contentScroll)

    return {
        parent, header, headerTitle, body, sidebar, content, contentScroll
    }
}

function implementCSS(code) {
    let style = document.createElement("style")
    for (const [selector, properties] of Object.entries(code)) {
        let css = selector + " {"
        for (const [property, value] of Object.entries(properties))
            css += property + ": " + value + ";"
        css += "}"
        style.innerHTML += css
    }
    terminal.document.head.appendChild(style)
}

let tempFileContent = null
let tempFileName = null
let elements = null
let lineCount = null
let prevLineCount = null
let currentlyEditing = false

function updateLineNums() {
    lineCount = elements.content.childNodes.length

    if (lineCount == 0) {
        elements.sidebar.textContent = "1"
        prevLineCount = lineCount
    } else if (prevLineCount !== lineCount) {
        elements.sidebar.textContent = ""
        for (let i = 0; i < lineCount; i++) {
            let line = createElement("div", {className: "editor-line-num"}, elements.sidebar)
            line.textContent = i + 1
        }
        prevLineCount = lineCount
    }
}

function createElement(tag, props, parent=null) {
    const element = document.createElement(tag)
    for (const [key, value] of Object.entries(props))
        element[key] = value
    if (parent)
        parent.appendChild(element)
    return element
}

function getText() {
    let text = ""
    for (let line of elements.content.querySelectorAll("div")) {
        text += line.textContent + "\n"
    }
    return text.slice(0, -1)
}

function loadContent() {
    let lastElement = null
    for (let line of tempFileContent.split("\n")) {
        let lineElement = createElement("div", {}, elements.content)
        lineElement.textContent = line
        if (lineElement.textContent.trim() == "")
            lineElement.appendChild(document.createElement("br"))
        lastElement = lineElement
    }
    if (lastElement)
        setTimeout(() => lastElement.focus(), 100)
    lineCount = tempFileContent.split("\n").length
    updateLineNums()
}

terminal.addCommand("edit", async function(args) {
    if (terminal.inTestMode) return

    tempFileContent = ""
    tempFileName = "Untitled File"
    currentlyEditing = true
    prevLineCount = null
    elements = createEditorHTML()
    
    if (args.file) {
        let file = terminal.getFile(args.file)
        if (file.type == FileType.FOLDER)
            throw new Error("cannot edit a folder")
        tempFileContent = file.content
        tempFileName = file.path
    }

    implementCSS(cssCode)
    terminal.parentNode.appendChild(elements.parent)

    elements.headerTitle.textContent = tempFileName
    elements.content.addEventListener("input", updateLineNums)
    loadContent()

    terminal.document.addEventListener("keydown", event => {
        // save
        if (event.ctrlKey && event.key == "s") {
            currentlyEditing = false
            event.preventDefault()
        }
    })

    while (currentlyEditing) {
        await sleep(100)
    }

    while (tempFileName == "" || tempFileName == "Untitled File") {
        tempFileName = await terminal.prompt("file name: ")
        while (!terminal.isValidFileName(tempFileName)) {
            terminal.printError("invalid file name")
            tempFileName = await terminal.prompt("file name: ")
        }
    }

    if (terminal.fileExists(tempFileName)) {
        let file = terminal.getFile(tempFileName)
        if (file.type == FileType.FOLDER)
            throw new Error("cannot edit a folder")
        file.content = getText()
    } else {
        terminal.createFile(tempFileName, TextFile, getText())
    }
}, {
    description: "edit a file of the current directory",
    args: {
        "?file": "the file to open",
    }
})

