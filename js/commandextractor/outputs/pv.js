terminal.addCommand("pv", async function(args) {
    await terminal.animatePrint(args.message)
}, {
    description: "print a message with a typing animation",
    args: ["*message"]
})

