const getApiUrl = "../wc-prediction/api/get_results.php"
const addApiUrl = "../wc-prediction/api/add_result.php"
const deleteApiUrl = "../wc-prediction/api/delete_result.php"

terminal.addCommand("fifa2026update", async function(args) {
    function getNecessaryParam(argname) {
        if (!args[argname]) {
            throw new Error(`${argname} needs to be supplied`)
        }
        return args[argname]
    }

    if (args.action === "show") {
        const result = await fetch(getApiUrl)
        const resultData = await result.json()

        const columns = ["id", "winner", "loser"]
        terminal.printTable(
            resultData.map(row => columns.map(c => row[c])),
            columns
        )
    } else if (args.action === "add") {
        const urlParams = new URLSearchParams()
        urlParams.set("pw", getNecessaryParam("password"))
        urlParams.set("winner", getNecessaryParam("winner"))
        urlParams.set("loser", getNecessaryParam("loser"))

        const result = await fetch(addApiUrl + "?" + urlParams.toString())
        if (result.status === 200) {
            terminal.printSuccess("Added the result successfully!")
        } else {
            throw new Error("Something went wrong.")
        }
    } else if (args.action === "delete") {
        const urlParams = new URLSearchParams()
        urlParams.set("pw", getNecessaryParam("password"))
        urlParams.set("id", getNecessaryParam("id"))

        const result = await fetch(deleteApiUrl + "?" + urlParams.toString())
        if (result.status === 200) {
            terminal.printSuccess("Removed the result successfully.")
        } else {
            throw new Error("Something went wrong.")
        }
    }
}, {
    description: "update the results table for wc-prediction (internal use only)",
    args: {
        "action:e:show|add|delete": "action to take",
        "?p=password:s": "password",
        "?w=winner:s": "winner argument",
        "?l=loser:s": "loser argument",
        "?i=id:s": "id argument"
    },
    isSecret: true,
    category: "admin"
})