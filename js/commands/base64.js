terminal.addCommand("base64", async function(args) {
    let msg = args.message
    let output = ""
    if (args.d) {
        output = atob(msg)
    } else {
        output = btoa(msg)
    }
    terminal.printLine(output)

    if (args.c)
        await terminal.copy(output, {printMessage: true})
}, {
    description: "encode/decode a message using base64",
    args: {
        "*message": "the message to encode/decode",
        "?d=decode:b": "decode the message instead of encoding it",
        "?c=copy:b": "copy the result to the clipboard"
    },
})