terminal.addCommand("edit", async function(args) {
    function makeTextarea(textContent) {
        const textarea = document.createElement("textarea")
        textarea.value = textContent
        
        textarea.style.position = "relative"
        textarea.style.background = "var(--background)"
        textarea.style.color = "var(--foreground)"
        textarea.style.marginTop = `calc(var(--font-size) * 0.8)`
        textarea.style.padding = `calc(var(--font-size) * 0.8)`
        textarea.style.border = "1px solid var(--foreground)"
        textarea.style.borderRadius = `calc(var(--font-size) * 0.5)`

        textarea.style.width = `calc(var(--font-size) * 35)`
        textarea.style.minWidth = `calc(var(--font-size) * 15)`
        textarea.style.maxWidth = `calc(var(--font-size) * 100)`

        textarea.rows = 20

        return textarea
    }

    function makeButton(text) {
        const button = terminal.createTerminalButton({text})

        button.style.marginTop = `calc(var(--font-size) * -0.5)`
        button.style.marginRight = `calc(var(--font-size) * 0.2)`
        button.style.padding = `calc(var(--font-size) * 0.5)`
        button.style.border = "1px solid var(--foreground)"
        button.style.borderRadius = `0 0 calc(var(--font-size) * 0.5) calc(var(--font-size) * 0.5)`
        button.style.width = "5em"

        return button
    }

    const file = terminal.getFile(args.file)

    if (file.isDirectory) {
        throw new Error("Cannot edit directory data")
    }

    const textarea = makeTextarea(file.content)
    const saveButton = makeButton("Save")
    const cancelButton = makeButton("Cancel")
    const br = document.createElement("br")
    let editingActive = true

    terminal.parentNode.appendChild(textarea)
    terminal.parentNode.appendChild(br)
    terminal.parentNode.appendChild(saveButton)
    terminal.parentNode.appendChild(cancelButton)
    terminal.scroll()
    textarea.focus()

    function removeElements() {
        textarea.remove()
        saveButton.remove()
        cancelButton.remove()
        br.remove()
    }

    function cancel() {
        if (!editingActive) {
            return
        }

        editingActive = false
        removeElements()
        terminal.printLine("[Pressed Cancel]")
    }

    function save() {
        if (!editingActive) {
            return
        }

        file.content = textarea.value
        editingActive = false
        removeElements()
        terminal.printSuccess(`Changes saved at ${file.path}`)
    }

    saveButton.onclick = save
    cancelButton.onclick = cancel

    textarea.onkeydown = function(event) {
        if (!editingActive) {
            return
        }

        if (event.key == "Tab") {
            event.preventDefault()
            let start = this.selectionStart
            let end = this.selectionEnd
        
            this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
        
            this.selectionStart = this.selectionEnd = start + 1;
        }

        if (event.key == "s" && event.ctrlKey) {
            event.preventDefault()
            save()
        }
    }

    terminal.onInterrupt(() => {
        removeElements()
    })

    while (editingActive) {
        await sleep(1000)
    }
}, {
    description: "edit a file",
    args: {
        "file:f": "file to edit",
    }
})