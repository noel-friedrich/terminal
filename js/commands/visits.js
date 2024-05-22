terminal.addCommand("visits", async function(args) {
    const visits = await fetch(
        "api/get_visit_count.php"
    ).then(response => response.json())
    terminal.printTable(visits.map(v => [v["url"], v["visits"]]), ["url", "visits"])
}, {
    "description": "Shows the number of page visits",
})