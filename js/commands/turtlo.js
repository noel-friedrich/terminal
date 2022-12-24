terminal.addCommand("turtlo", async function() {
    await terminal.modules.load("turtlo", terminal)
    terminal.modules.turtlo.spawn({size: 1})
}, {
    description: "spawn turtlo",
})