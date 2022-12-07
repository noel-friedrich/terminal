terminal.addCommand("highscore-admin", async function(args) {
    await terminal.modules.import("game", window)
    
    if (args.d) {
        localStorage.removeItem("highscore_password")
        HighscoreApi.tempPassword = null
        terminal.printLine("Removed password from local storage")
        return
    }
    await HighscoreApi.loginAdmin()
}, {
    description: "Login as Admin",
    isSecret: true,
    args: {
        "?d": "Delete password from local storage"
    }
})