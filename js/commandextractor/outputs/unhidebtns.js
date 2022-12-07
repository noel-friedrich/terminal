terminal.addCommand("unhidebtns", function() {
    document.documentElement.style.setProperty("--terminal-btn-display", "block")
    localStorage.setItem("hideBtns", "false")
}, {
    description: "unhides the buttons in the terminal"
})

function hideBtns() {
    if (localStorage.getItem("hideBtns") == "true" || isMobile) {
        document.documentElement.style.setProperty("--terminal-btn-display", "none")
    }
}

hideBtns()

function fileTooLargeWarning() {
    terminal.print("Warning", Color.RED)
    terminal.printLine(": File is too large to be saved locally.")
    terminal.printLine("         Thus, it will disappear when reloading.")
}

