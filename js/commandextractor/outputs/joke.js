terminal.addCommand("joke", async function(args) {
    let response = await fetch("https://official-joke-api.appspot.com/random_joke")
    let joke = await response.json()
    terminal.printLine(joke.setup)
    await sleep(3000)
    terminal.printLine(joke.punchline)
}, {
    description: "tell a joke",
})

