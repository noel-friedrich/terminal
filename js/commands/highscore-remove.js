terminal.addCommand("highscore-remove", async function(args) {
    
    await terminal.modules.import("game", window)
    await HighscoreApi.loginAdmin(true)
    if (args.uid) {
        await HighscoreApi.removeHighscore(HighscoreApi.tempPassword, args.uid)
        terminal.printSuccess("Removed highscore #" + args.uid)
        return
    }

    terminal.printLine(`Highscores for ${args.game}:`)

    let highscores = (await HighscoreApi.getHighscores(args.game))
        .slice(0, args.l).filter(h => h.name == args.n || args.n == null)

    if (highscores.length == 0)
        throw new Error("No highscores found")

    let maxNameLength = Math.max(...highscores.map(h => h.name.length))
    let maxScoreLength = Math.max(...highscores.map(h => h.score.toString().length))
    for (let highscore of highscores) {
        terminal.print(stringPadBack(highscore.name, maxNameLength + 2))
        terminal.print(stringPadBack(highscore.score, maxScoreLength + 2))
        terminal.print(highscore.time + "  ")
        terminal.printCommand("Remove", "highscore-remove x --uid " + highscore.uid)
    }
}, {
    description: "Remove a highscore",
    isSecret: true,
    args: {
        "game": "the game to remove the highscore from",
        "?n": "only show highscores with this name",
        "?l:n:1~10000": "limit the number of highscores to show",
        "?uid": "the uid of the highscore to remove",
    },
    standardVals: {
        "n": null,
        "l": Infinity
    }
})