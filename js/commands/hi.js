async function funnyPrint(msg) {
    let colors = msg.split("").map(Color.niceRandom)
    for (let i = 0; i < msg.length; i++) {
        terminal.print(msg[i], colors[i])
        await sleep(100)
    }
    terminal.addLineBreak()
}

terminal.addCommand("hi", async () => await funnyPrint("hello there!"), {
    description: "say hello to the terminal"
})