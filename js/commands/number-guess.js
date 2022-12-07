terminal.addCommand("number-guess", async function(args) {
    await terminal.modules.import("game", window)

    terminal.printLine("i'm thinking of a random number. can you guess it?")
    let number = Math.floor(Math.random() * 1000) + 1
    let tries = 0
    while (true) {
        let guess = await terminal.promptNum("guess: ", {lineEnd: false})
        tries++
        if (guess == number) {
            break
        }
        if (guess < number) {
            terminal.printLine(`too low! (n > ${guess})`)
        }
        if (guess > number) {
            terminal.printLine(`too high! (n < ${guess})`)
        }
    }
    terminal.printLine(`you got it! it took you ${tries} tries`)    

    await HighscoreApi.registerProcess("number-guess")
    await HighscoreApi.uploadScore(-tries)

}, {
    description: "guess a random number",
    isGame: true
})