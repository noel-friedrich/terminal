terminal.addCommand("games", function() {
    let gameCommands = [
        'tictactoe', '4inarow', 'chess', 'mill2player', 'snake', '2048',
        'lunar-lander', 'tetris', 'number-guess', 'stacker', 'type-test',
        'pong', 'greed', 'labyrinth', 'perilious-path', 'shoot', 'flappy',
        'hangman'
    ]
    let longestCommandLength = gameCommands.reduce((p, c) => Math.max(p, c.length), 0)
    for (let command of gameCommands.sort((a, b) => a.localeCompare(b))) {
        terminal.printCommand(command, command, Color.PURPLE, false)
        let spaces = strRepeat(" ", longestCommandLength - command.length + 2)
        let description = terminal.allCommands[command]
        terminal.printLine(`${spaces}${description}`)
    }
}, {
    description: "shows the game menu",
})