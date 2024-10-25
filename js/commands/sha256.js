terminal.addCommand("sha256", async function(args) {
    if (!window.crypto || !window.crypto.subtle)
        throw new Error("crypto API not supported")

    let hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(args.text))
    let hashArray = Array.from(new Uint8Array(hash))
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    terminal.printLine(hashHex)
}, {
    description: "calculate the SHA-256 hash of a message",
    args: {
        "*text:s": "ascii text to calculate hash of"
    }
})