terminal.addCommand("turtlo", async function(args) {
    await terminal.modules.load("turtlo", terminal)
    terminal.modules.turtlo.spawn({size: args.size, silent: args.silent})
    terminal.print("\nIf you like turtlo, I made her into a ")
    terminal.printLink("Browser Extension", "https://chromewebstore.google.com/detail/turtlo/jdifijcompinjdlgfomdhdogaododkim/related", undefined, false)
    terminal.printLine("!")
}, {
    description: "spawn turtlo",
    args: {
        "?size:i:1~3": "size of turtlo",
        "?silent:b": "don't print anything"
    },
    defaultValues: {
        size: 1
    },
    category: "fun"
})