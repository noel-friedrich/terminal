terminal.addCommand("echonum", function(args) {
    terminal.printLine(args.number)
}, {
    description: "echo a given number",
    args: {
        "number:n": "number to echo"
    },
    isSecret: true
})