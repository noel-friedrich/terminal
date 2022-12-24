terminal.addCommand("hugeturtlo", async function() {
    await terminal.modules.load("turtlo", terminal)
    terminal.modules.turtlo.spawn({size: 2})
}, {
    description: "spawn huge turtlo",
})