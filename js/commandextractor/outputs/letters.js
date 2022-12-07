terminal.addCommand("letters", function(args) {
    let text = args.text.trim().toLowerCase()

    if (!text)
        throw new Error("No text given")

    for (let char of text) {
        if (!(char in AsciiArtLetters)) {
            throw new Error("Unsupported character used ('" + char + "')")
        }
    }

    function pasteHorizontal(a, b, l1, l2) {
        let lines = {a: a.split("\n").slice(0, -1), b: b.split("\n").slice(0, -1)}
        let width = {a: () => lines.a[0].length, b: () => lines.b[0].length}
        let height = {a: () => lines.a.length, b: () => lines.b.length}
        
        while (height.a() > height.b()) {
            lines.b.unshift(stringMul(" ", width.b()))
        }
        while (height.b() > height.a()) {
            lines.a.unshift(stringMul(" ", width.a()))
        }

        function eq(a, b) {
            if (a == b) return true
            if (a == " " || b == " ") return true
            if (a == "(" && b == "|") return true
            if (a == ")" && b == "|") return true
            if (b == "(" && a == "|") return true
            if (b == ")" && a == "|") return true
            return false
        }

        for (let i = 0; i < 2; i++) {
            let compressBoth = true
            for (let i = 0; i < height.a(); i++) {
                let [x, y] = [lines.a[i].slice(-1), lines.b[i][0]]
                if (!(eq(x, y))) {
                    compressBoth = false
                    break
                }
            }

            if (!compressBoth)
                break

            for (let i = 0; i < height.a(); i++) {
                let [x, y] = [lines.a[i].slice(-1), lines.b[i][0]]
                if (x == " ") {
                    lines.a[i] = lines.a[i].slice(0, -1) + lines.b[i][0]
                }
                lines.b[i] = lines.b[i].slice(1)
            }
        }

        let combined = ""
        for (let i = 0; i < height.a(); i++)
            combined += lines.a[i] + lines.b[i] + "\n"
        return combined
    }

    let output = AsciiArtLetters[text[0]]
    for (let i = 1; i < text.length; i++) {
        output = pasteHorizontal(output, AsciiArtLetters[text[i]], text[i - 1], text[i])
    }
    terminal.printLine(output)
}, {
    description: "prints the given text in ascii art",
    args: {
        "*text": "the text to print"
    }
})

