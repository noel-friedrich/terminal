terminal.addCommand("visits", async function(args) {
    let visits = await fetch(
        "api/get_visit_count.php"
    ).then(response => response.text())
    terminal.printLine(`This page has been visited ${visits} times since implementing the visit-count.`)
}, {
    "description": "Shows the number of page visits",
})