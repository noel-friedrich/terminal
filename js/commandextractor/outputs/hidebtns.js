terminal.addCommand("hidebtns", function() {
    document.documentElement.style.setProperty("--terminal-btn-display", "none")
    localStorage.setItem("hideBtns", "true")
}, {
    description: "hides the buttons in the terminal"
})

