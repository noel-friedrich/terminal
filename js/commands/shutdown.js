terminal.addCommand("shutdown", async function() {
    terminal.print("Shutting down")
    for (let i = 0; i < 10; i++) {
        terminal.print(".")
        await sleep(300)
    }
    terminal.printLine()
    await terminal.animatePrint("Initiating Shutdown Process......")
    for (let i = 10; i > 0; i--) {
        terminal.print(i, Color.COLOR_1)
        terminal.printLine(" Seconds left")
        await sleep(1000)
    }
    await sleep(1000)
    await terminal.animatePrint("...?")
    await sleep(1000)
    await terminal.animatePrint("Why didn't anything happen?")
    await sleep(1000)
    await terminal.animatePrint("I guess this is just a website.")
    await sleep(1000)
    await terminal.animatePrint("Let's just not shutdown. Have a good day!")
}, {
    description: "shutdown the terminal"
})

