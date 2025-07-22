terminal.addCommand("wurzle-stats", async function(args) {
    const apiUrlBase = "https://www.noel-friedrich.de/wurzle-api/get_data.php"

    const localStoragePasswordKey = "wurzle-stats-password"
    const password = args.password ?? localStorage.getItem(localStoragePasswordKey)
    const date = args.date ?? new Date().toJSON().slice(0, 10).split("-").reverse().join(".")

    const fullApiUrl = `${apiUrlBase}?password=${encodeURIComponent(password)}&date=${encodeURIComponent(date)}`

    const response = await fetch(fullApiUrl)
    let jsonData = null

    try {
        jsonData = await response.json()

        // yay, password seems to be correct!
        if (localStorage.getItem(localStoragePasswordKey) != password) {
            localStorage.setItem(localStoragePasswordKey, password)
            terminal.printSuccess("Saved correct password locally.")
        }
    } catch (e) {
        // no, password seems to be incorrect!
        localStorage.removeItem(localStoragePasswordKey)
        terminal.printError("Incorrect Password. Aborting.")
        return
    }

    if (!args.date) {
        terminal.printLine(`selected date: ${date}`)
    }

    if (jsonData.length == 0) {
        terminal.printLine("no records found on selected date.")
        return
    }

    const rowHeaders = (["index"]).concat(Array.from(Object.keys(jsonData[0])))
    jsonData = jsonData.reverse().map((r, i) => {r.index = i + 1; return r})
    const dataRows = jsonData.map(rowData => rowHeaders.map(h => rowData[h]))

    const totalStartCount = jsonData.map(r => r.start_count).reduce((p, c) => p + c, 0)
    const totalFinishCount = jsonData.map(r => r.finish_count).reduce((p, c) => p + c, 0)    

    terminal.printTable(dataRows, rowHeaders)
    terminal.addLineBreak()

    terminal.printLine(`total starts: ${totalStartCount}`)    
    terminal.printLine(`total finishes: ${totalFinishCount}`)
    
}, {
    description: "show usage stats about wurzle (recmaths.ch/wurzle)",
    args: {
        "?d=date:s": "date to see the stats of",
        "?password": "admin password required to see stats",
    },
    isSecret: true
})

