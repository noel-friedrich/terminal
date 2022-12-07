terminal.addCommand("highscores", async function(args) {
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
    let highscores = allHighscores.slice(0, args.l).filter(h => h.name == args.n || args.n == null)

    if (highscores.length == 0)
        throw new Error("No highscores found")

    let tableData = []
    for (let highscore of highscores) {
        let rank = await HighscoreApi.getRank(args.game, highscore.score, allHighscores)
        tableData.push([rank, highscore.name, highscore.score, highscore.time])
    }
    
    terminal.printTable(tableData, ["Rank", "Name", "Score", "Time"])
}, {
    description: "Show global highscores for a game",
    args: {
        "game": "the game to show the highscores for",
        "?n": "only show highscores with this name",
        "?l:n:1~10000": "limit the number of highscores to show",
    },
    standardVals: {
        "n": null,
        "l": 10
    }
})