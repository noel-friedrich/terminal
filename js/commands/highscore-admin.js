terminal.addCommand("highscore-admin", async function(args) {
    await terminal.modules.import("game", window)
    
    if (args.delete) {
        localStorage.removeItem("highscore_password")
        HighscoreApi.tempPassword = null
        terminal.printLine("Removed password from local storage")
        return
    } else if (args.list) {
        await HighscoreApi.loginAdmin(true)
        const highscores = await HighscoreApi.getUnconfirmedHighscores()
        highscores.sort((a, b) => a.game.localeCompare(b.game))

        terminal.printLine(`Showing ${highscores.length} Highscores...`)
        terminal.printTable(highscores.map(s => [
            s.id, s.game, s.name, s.score, s.time
        ]), ["id", "game", "name", "score", "time"])
    } else if (args.tinder) {
        await HighscoreApi.loginAdmin(true)
        const highscores = await HighscoreApi.getUnconfirmedHighscores()
        highscores.sort((a, b) => a.game.localeCompare(b.game))

        let i = 0
        for (let s of highscores) {
            i++

            terminal.printLine(`> Highscore #${i}/${highscores.length}:`)

            const rank = await HighscoreApi.getRank(s.game, s.score)

            try {
                terminal.printTable([[
                    rank, s.game, s.name, s.score, s.time
                ]], ["rank", "game", "name", "score", "time"])
                await terminal.acceptPrompt("Looks good?")
                await HighscoreApi.confirmHighscore(s.uid, 1)
                terminal.addLineBreak()
            } catch {
                await HighscoreApi.confirmHighscore(s.uid, 2)
                terminal.printSuccess("Removed Highscore successfully")
                terminal.addLineBreak()
            }
        }

        terminal.printSuccess("You're finished!")
    } else {
        await HighscoreApi.loginAdmin()
    }

}, {
    description: "Highscore Admin Management",
    isSecret: true,
    args: {
        "?l=list:b": "List all unconfirmed highscores",
        "?t=tinder:b": "Play Tinder Swiping with highscores",
        "?d=delete:b": "Delete password from local storage"
    }
})