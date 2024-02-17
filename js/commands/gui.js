terminal.addCommand("gui", async function(args) {
    terminal.href(`gui/${args.command}/index.html`)
}, {
    description: "open the GUI page for a given command",
    args: {
        "command:c": "a terminal command"
    }
}) 