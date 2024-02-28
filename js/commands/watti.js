terminal.addCommand("watti", async function(args) {
    if (args.action == "list") {
        const result = await fetch("https://www.noel-friedrich.de/walk-to-college/api/get_walks.php")
        const walks = await result.json()

        for (let walk of walks) {
            terminal.printLine(`${walk.date}: ${walk.names}`)
        }
    } else if (args.action == "add") {
        const names = await terminal.prompt("Names: ")
        const date = await terminal.prompt("Date: ")
        const password = await terminal.prompt("Password: ", {password: true})

        let url = "https://www.noel-friedrich.de/walk-to-college/api/add_walk.php?"
        url += `names=${encodeURIComponent(names)}&`
        url += `date=${encodeURIComponent(date)}&`
        url += `password=${encodeURIComponent(password)}`

        const result = await fetch(url)
        const text = await result.text()
        terminal.printLine(text)
    }
}, {
    description: "manage the walk to trinity database",
    isSecret: true,
    args: {
        "action:e:list|add": "<enum>"
    }
})