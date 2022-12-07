terminal.addCommand("echo", function(args) {
    terminal.printLine(args.text)
}, {
    description: "print a line of text",
    args: ["*text"]
})

function missingPermissions() {
    terminal.printf`${{[Color.RED]: "Error"}}: You do not have permission to use this command!\n`
}

