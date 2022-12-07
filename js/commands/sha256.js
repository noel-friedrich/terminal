terminal.addCommand("sha256", async function(args) {
    if (!window.crypto || !window.crypto.subtle)
        throw new Error("crypto API not supported")

    if (!args.s && !args.f) {
        terminal.printError("must specify either -s or -f")
        terminal.print("Use ")
        terminal.printCommand("man sha256")
        terminal.printLine(" for more information")
        throw new IntendedError()
    }

    if (args.s && args.f)
        throw new Error("cannot specify both -s and -f")

    let text = ""
    if (args.s) {
        text = args.s
    } else if (args.f) {
        let file = terminal.getFile(args.f, FileType.READABLE)
        text = file.content
    }

    let hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    let hashArray = Array.from(new Uint8Array(hash))
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    terminal.printLine(hashHex)
}, {
    description: "calculate the SHA-256 hash of a message",
    args: {
        "?s": "a string to hash",
        "?f": "a file to hash"
    },
    standardVals: {
        s: null,
        f: null
    }
})

