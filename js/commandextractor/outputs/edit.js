terminal.addCommand("edit", async function(args) {
    let file = terminal.getFile(args.file)
    let fileLines = file.content.split("\n")

    function createInput(width) {
        let inputElement = document.createElement("input")
        terminal.parentNode.appendChild(inputElement)
        inputElement.style.width = width
        return inputElement
    }

    return new Promise(resolve => {
        let windowWidth = args.w
        let windowHeight = args.h
        let lineSeperator = `+--${stringMul("-", windowWidth)}--+`
        let preElement = terminal.printLine(lineSeperator)
        let charWidth = preElement.getBoundingClientRect().width / lineSeperator.length
        let inputs = Array()
        let lines = Array.from(Array(Math.max(windowHeight, fileLines.length)))
            .map((_, i) => (fileLines[i]) ? fileLines[i] : "")
        let numElements = Array()
        for (let i = 0; i < windowHeight; i++) {
            let num = terminal.printf`${{[Color.COLOR_1]: stringPad(`${i}`, 3)}} `[1]
            numElements.push(num)
            inputs.push(createInput(`${charWidth * windowWidth}px`))
            terminal.printLine(" |")
        }
        terminal.printLine("+" + stringPadMiddle(" strg-s to save, esc to exit ", windowWidth + 4, "-") + "+")

        function save() {
            let content = lines.reduce((a, l) => a + l + "\n", "")
            file.content = content.trim()
            resolve()
        }

        function loadLines(startIndex) {
            for (let i = startIndex; i < startIndex + windowHeight; i++) {
                if (!lines[i]) lines.push("")
                inputs[i - startIndex].value = lines[i]
                numElements[i - startIndex].textContent = stringPad(`${i}`, 3)
            }
        }

        let currScrollIndex = 0
        loadLines(currScrollIndex)

        setTimeout(() => inputs[0].focus(), 300)
        inputs[inputs.length - 1].scrollIntoView({behavior: "smooth"})

        for (let input of inputs) {
            let i = inputs.indexOf(input)
            let lineIndex = currScrollIndex + i
            input.onkeydown = function(event) {
                if (event.key == "Backspace") {
                    if (input.value.length == 0 && inputs[i - 1]) {
                        inputs[i - 1].focus()
                        lines.splice(lineIndex, 1)
                        loadLines(currScrollIndex)
                        event.preventDefault()
                    }
                } else if (event.key == "Tab") {
                    input.value += "    "
                    event.preventDefault()
                } else if (event.key == "ArrowUp") {
                    if (inputs[i - 1]) {
                        inputs[i - 1].focus()
                        inputs[i - 1].selectionStart = inputs[i - 1].selectionEnd = 10000
                    } else if (currScrollIndex > 0) {
                        currScrollIndex--
                        loadLines(currScrollIndex)
                    }
                    event.preventDefault()
                } else if (event.key == "Enter") {
                    lines.splice(lineIndex + 1, 0, "")
                    let leadingSpaces = input.value.match(/^ */)[0].length
                    lines[lineIndex] = input.value
                    if (inputs[i + 1]) {
                        inputs[i + 1].focus()
                        if (inputs[i + 1].value.length == 0) {
                            lines[lineIndex + 1] = stringMul(" ", leadingSpaces)
                        }
                        inputs[i + 1].selectionStart = inputs[i + 1].selectionEnd = 10000
                    } else {
                        currScrollIndex++
                    }
                    loadLines(currScrollIndex)
                    event.preventDefault()
                } else if (event.key == "ArrowDown") {
                    if (inputs[i + 1]) {
                        inputs[i + 1].focus()
                        inputs[i + 1].selectionStart = inputs[i + 1].selectionEnd = 10000
                    } else {
                        currScrollIndex++
                        loadLines(currScrollIndex)
                    }
                    event.preventDefault()
                }
                if (event.ctrlKey && event.key.toLowerCase() == "s") {
                    save()
                    event.preventDefault()
                }
                if (event.key == "Escape" || (event.ctrlKey && event.key == "c")) {
                    resolve()
                }
                lines[i + currScrollIndex] = input.value
            }
        }
    })
}, {
    description: "edit a file of the current directory",
    args: {
        "file": "the file to open",
        "?w:n:10~100": "the width of the window",
        "?h:n:10~100": "the height of the window"
    },
    standardVals: {
        "w": 64,
        "h": 16
    }
})

