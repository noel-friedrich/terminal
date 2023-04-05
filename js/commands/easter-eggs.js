terminal.addCommand("easter-eggs", async function(args) {
    if (args.reset) {
        await terminal.acceptPrompt("Do you really want to reset the easter egg hunt?", false)
        terminal.data.resetProperty("easterEggs")
        return
    }

    terminal.printLine("Welcome to the easter egg hunt.", Color.COLOR_1)
    terminal.printLine("You can find easter eggs all across different")
    terminal.printLine("parts (commands) of this website. An example")
    terminal.printLine("Easter Egg looks like this: (click on it!)")
    terminal.printEasterEgg("Starter-Egg")
    terminal.addLineBreak()
    terminal.printLine("RULES", Color.COLOR_2)
    terminal.printLine("1. You may not look at the source code of this website using your browser.")
    terminal.print("2. You may use the ")
    terminal.printCommand("code", "code", undefined, false)
    terminal.printLine(" command to look at the source code of commands.")
    terminal.printLine("3. You must have fun.")
    terminal.addLineBreak()
    terminal.printLine("YOUR EGGS", Color.COLOR_2)

    let listOutput = terminal.print("", undefined, {forceElement: true})

    function updateList() {
        let output = ""
        let eggs = terminal.data.easterEggs
        let count = 0
        for (let egg of eggs) {
            count++
            output += `${count}: ${egg}\n`
        }
        if (eggs.size == 0)
            output += "< no eggs found (yet) >\n"

        listOutput.textContent = output
    }

    updateList()
    terminal.window.setInterval(updateList, 500)

}, {
    description: "open easter egg hunt",
    args: {
        "?reset:b": "reset easter egg hunt"
    }
})