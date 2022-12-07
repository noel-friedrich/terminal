terminal.addCommand("base64", async function(args) {
    let msg = args.message
    let output = ""
    if (args.d) {
        output = atob(msg)
    } else {
        output = btoa(msg)
    }
    terminal.printLine(output)
}, {
    description: "encode/decode a message using base64",
    args: {
        "*message": "the message to encode/decode",
        "?d": "decode the message instead of encoding it"
    },
})