terminal.addCommand("zip", async function() {
    await terminal.animatePrint("zip it lock it put it in your pocket")
    await terminal.animatePrint("(Sorry, this command is not yet implemented)")
    await terminal.animatePrint("It's very high on the priority list though!")
    await sleep(1000)
    await terminal.animatePrint("I promise!")
    await sleep(1000)
    await terminal.animatePrint("I'm working on it!")
    await sleep(1000)
    await terminal.animatePrint("I swear!")
    await sleep(1000)
    await terminal.animatePrint("I'm not lying!")
    await sleep(1000)
    await terminal.animatePrint("Maybe I'm lying...")
    await sleep(3000)
    await terminal.animatePrint("Zipping is hard!!")

    terminal.printEasterEgg("Zipper-Egg")

}, {
    description: "zip a file"
})

