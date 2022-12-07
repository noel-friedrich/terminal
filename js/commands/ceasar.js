terminal.addCommand("ceasar", function(args) {
    let text = args.text
    let shiftVal = args.shift
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    function betterMod(n, m) {
        while (n < 0) n += m
        return n % m
    }
    for (let char of text.toLowerCase()) {
        let index = alphabet.indexOf(char)
        if (index == -1) {
            terminal.print(char)
            continue
        }
        let newChar = alphabet[betterMod((index + shiftVal), alphabet.length)]
        terminal.print(newChar)
    }
    terminal.printLine()
}, {
    description: "shift the letters of a text",
    args: {
        "text": "the text to shift",
        "?s=shift:i:-26~26": "the shift value"
    },
    standardVals: {
        shift: 1
    }
})

