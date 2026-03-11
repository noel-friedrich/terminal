terminal.addCommand("visits", async function(args) {
    const relevantJSONKeys = ["url", "visits"]

    terminal.printTable(
        (
            await fetch("api/get_visit_count.php")
            .then(response => response.json())
        )
        .map(v => relevantJSONKeys.map(k => v[k])),
        relevantJSONKeys
    )
}, {
    description: "Shows the number of page visits",
    category: "tools"
})