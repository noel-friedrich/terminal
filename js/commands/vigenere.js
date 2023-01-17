terminal.addCommand("vigenere", async function(args) {
    const getCharValue = char => char.toLowerCase().charCodeAt(0) - 97
    const getCharFromValue = value => String.fromCharCode(value + 97)
    
    if (!/^[a-zA-Z\s]+$/.test(args.message))
        throw new Error("message must only contain letters and spaces")
    else if (!/^[a-zA-Z]+$/.test(args.key))
        throw new Error("key must only contain letters")

    let output = ""

    Array.from(args.message).forEach((character, i) => {
        if (/[a-zA-Z]/.test(character)) {
            let charValue = getCharValue(character)
            let keyValue = getCharValue(args.key[i % args.key.length])
            let newValue = (charValue + keyValue) % 26
            if (args.d)
                newValue = (charValue - keyValue + 26) % 26
            output += getCharFromValue(newValue)
        } else {
            output += character
        }
    })

    terminal.printLine(output)

    if (args.c) {
        await terminal.copy(output, {printMessage: true})
    }
}, {
    description: "encrypt/decrypt a message using the vigenere cipher",
    args: {
        "message": "the message to encrypt/decrypt",
        "key": "the key to use",
        "?d=decrypt:b": "decrypt the message instead of encrypting it",
        "?c=copy:b": "copy the result to the clipboard"
    },
})

