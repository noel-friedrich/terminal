terminal.addCommand("hugehugeturtlo", async function() {
    await terminal.modules.load("turtlo", terminal)
    terminal.modules.turtlo.spawn({size: 3})
}, {
    description: "spawn huge turtlo",
})