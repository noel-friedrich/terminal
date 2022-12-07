terminal.addCommand("copy", async function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("Cannot copy a folder")
    await navigator.clipboard.writeText(file.content)
    terminal.printLine("Copied to Clipboard ✓")
}, {
    description: "copy the file content to the clipboard",
    args: {
        "file": "the file to copy"
    }
})

function g(n, k) {
    let a = Array.from(n.toString())
    let b = Array.from(n.toString())

    while (a.length < k)
        a.push("0")

    while (b.length < k)
        b.push("0")

    let c = 1

    a = a.sort().join("")
    b = b.sort((a, b) => b - a).join("")

    let m = b - a

    if (n === m || m === 0)
        return c

    return c + g(m, k)
}

