terminal.addCommand("reset", async function() {
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
    return new Promise(async () => {
        await animatedDo("resetting")
        terminal.reset()
        setTimeout(() => terminal.reload(), 500)
    })
}, {
    description: "reset the terminal"
})