terminal.addCommand("turtlo", async function(args) {
    await terminal.modules.load("turtlo", terminal)
    terminal.modules.turtlo.spawn({size: args.size, silent: args.silent})
}, {
    description: "spawn turtlo",
    args: {
        "?size:i:1~3": "size of turtlo",
        "?silent:b": "don't print anything"
    },
    defaultValues: {
        size: 1
    }
})