terminal.addCommand("reset", async function(args) {
    async function animatedDo(action) {
        return new Promise(async resolve => {
            terminal.print(action)
            for (let i = 0; i < 6; i++) {
                await terminal.sleep(200)
                terminal.print(".")
            }
            await terminal.sleep(500)
            terminal.printLine("done")
            resolve()
        })
    }
    if (!args.now)
        await terminal.acceptPrompt("this will fully reset the terminal (including all files). are you sure?", false)
    return new Promise(async () => {
        if (!args.now) {
            await animatedDo("resetting")
        }
        terminal.reset()
        terminal.reload()
    })
}, {
    description: "reset the terminal",
    args: {
        "?n=now:b": "reset now"
    }
})