terminal.addCommand("highscores", async function(args) {
    if (args["show-all"]) args.l = Infinity

    await terminal.modules.import("game", window)

    {
        let commandName = args.game.split(":")[0]
        if (!terminal.commandExists(args.game.split(":")[0]))
            throw new Error(`Game ${commandName} not found`)
        let terminalFunc = await terminal.loadCommand(commandName)
        if (!terminalFunc.info.isGame)
            throw new Error(`Game ${commandName} not found`)
    }

    let allHighscores = await HighscoreApi.getHighscores(args.game)
    let highscores = allHighscores
        .filter(h => h.name == args.n || args.n == null)
        .slice(0, args.l)

    if (highscores.length == 0) {
        if (args.n != null)
            throw new Error(`No highscores found for ${args.n}`)
        else
            throw new Error("No highscores found")
    }

    let tableData = []
    for (let highscore of highscores) {
        let rank = await HighscoreApi.getRank(args.game, highscore.score, allHighscores)
        tableData.push([rank, highscore.name, Math.abs(highscore.score), highscore.time])
    }
    
    terminal.printTable(tableData, ["Rank", "Name", "Score", "Time"])
    
    if (highscores.length != allHighscores.length) {
        terminal.print(`(showing ${highscores.length} of ${allHighscores.length} highscores. `)
        let cmdText = `highscores ${args.game} --show-all`
        if (args.n != null) cmdText += ` -n ${args.n}`
        terminal.printCommand("show all", cmdText, undefined, false)
        terminal.printLine(")")
    }

}, {
    description: "Show global highscores for a game",
    args: {
        "game": "the game to show the highscores for",
        "?n": "only show highscores with this name",
        "?l:i:1~10000": "limit the number of highscores to show",
        "?show-all": "show all highscores, not just the top ones"
    },
    standardVals: {
        "n": null,
        "l": 10
    }
})