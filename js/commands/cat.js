terminal.addCommand("cat", async function(args) {
    const specialCases = {
        "turtlo": "no, turtlo isn't a cat"
    }

    if (args.file in specialCases) {
        terminal.printLine(specialCases[args.file])
        return
    }

    await terminal.modules.load("catfunc", terminal)
    let func = terminal.modules.catfunc.makeCatFunc((content, _, file) => {
        if (file.type == FileType.PROGRAM) {
            terminal.printLink(content, content)
        } else {
            terminal.printLine(content.trimEnd())
        }
    })
    await func(args)
}, {
    description: "print file content",
    args: {
        "file": "file to display the content of"
    }
})