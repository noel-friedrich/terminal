terminal.addCommand("cat", async function(args) {
    await terminal.modules.load("catfunc")
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