terminal.addCommand("hi", async function(args) {
    const suggestions = [
        () => {
            terminal.printLine("You should go for a run outside!", Color.COLOR_1)
            terminal.print("- download ")
            terminal.printLink("Strava", "https://www.strava.com/", undefined, false)
            terminal.print(" or ")
            terminal.printLink("Nike Run Club", "https://www.nike.com/ie/nrc-app")
            terminal.printLine("- play some of your favourite music")
            terminal.printLine("- running is great for mental health")
        },
        () => {
            terminal.print("You should play a round of ", Color.COLOR_1)
            terminal.printCommand("longjump", "longjump", Color.COLOR_1, false)
            terminal.printLine("!")
            terminal.print("- enter '")
            terminal.printCommand("longjump", "longjump", undefined, false)
            terminal.printLine("' in the terminal to start")
            terminal.printLine("- fly turtlo as long as you can")
            terminal.printLine("- try to beat the highscores")
        },
        () => {
            terminal.printLine("You should go for a walk!", Color.COLOR_1)
            terminal.print("- download ")
            terminal.printLink("Stray", "https://noel-friedrich.de/stray/", undefined, false)
            terminal.printLine(" to make it fun")
            terminal.printLine("- don't play music, just explore your sorrounding")
            terminal.printLine("- go somewhere where you haven't ever been")
        }
    ]

    await terminal.animatePrint("Hello there!")
    await terminal.acceptPrompt("Are you bored?")
    terminal.printLine("\n> Thats fine! If you want, I can give")
    terminal.printLine("> you some suggestions what to do!")
    await terminal.acceptPrompt("\nDo you want a suggestion?")

    const indeces = shuffle(suggestions.map((_, i) => i))
    for (let index of indeces) {
        terminal.addLineBreak()
        suggestions[index]()
        await terminal.acceptPrompt("\nDo you want another suggestion?")
        if (index == indeces[indeces.length - 1]) {
            break
        }
    }

    await terminal.animatePrint("\nHm. Those were all suggestions I had.")
    await terminal.animatePrint("Maybe run ", undefined, {newLine: false})
    terminal.printCommand("lscmds", "lscmds", undefined, false)
    await terminal.animatePrint(" to see if there's some")
    await terminal.animatePrint("command that you will enjoy?")
}, {
    description: "say hello to the terminal"
})