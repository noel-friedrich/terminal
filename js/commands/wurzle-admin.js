terminal.addCommand("wurzle-admin", async function(args) {
    const apiUrlBase = "https://www.noel-friedrich.de/wurzle-api"

    const localStoragePasswordKey = "wurzle-challenge-password"
    const password = args.password ?? localStorage.getItem(localStoragePasswordKey)

    async function apiGet(action, params=null) {
        params ??= {}
        params["password"] = password
        let url = `${apiUrlBase}/${action}.php?`
        for (const [key, value] of Object.entries(params)) {
            url += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`
        }
        url = url.slice(0, -1)

        const response = await fetch(url)
        try {
            const jsonData = await response.json()
            if (localStorage.getItem(localStoragePasswordKey) != password) {
                localStorage.setItem(localStoragePasswordKey, password)
                terminal.printSuccess("Saved Password to Localstorage.")
            }
            return jsonData
        } catch (e) {
            console.error(e)
            localStorage.removeItem(localStoragePasswordKey)
            throw new Error("Incorrect Password.")
        }
    }

    if (args.action == "show") {
        const jsonData = await apiGet("get_all_wurzles")
        const headerColumns = Array.from(Object.keys(jsonData[0]))
        terminal.printTable(jsonData.map(r => headerColumns.map(h => r[h])), headerColumns)
    }

    else if (args.action == "set") {
        if (!args.date || !args.term) {
            throw new Error("No date or term provided to set.")
        }

        const jsonData = await apiGet("insert_wurzle", {date: args.date, term: args.term, author: args.author})
        terminal.printLine(`success=${jsonData.success} action=${jsonData.action}`)
    }

    else if (args.action == "delete") {
        if (!args.date) {
            throw new Error("No date provided to delete.")
        }

        const jsonData = await apiGet("remove_wurzle", {date: args.date})
        terminal.printLine(`success=${jsonData.success} deleted=${jsonData.deleted}`)
        if (jsonData.error) {
            terminal.printLine(`error=${jsonData.error}`)
        }
    }
}, {
    description: "manage wurzles (recmaths.ch/wurzle)",
    args: {
        "action:e:show|set|delete": "<enum>",
        "?d=date:s": "date to set or delete",
        "?t=term:s": "term to set",
        "?a=author:s": "author of wurzle",
        "?password:s": "admin password required to see stats"
    },
    defaultValues: {
        author: "noel"
    },
    isSecret: true,
    category: "admin"
})