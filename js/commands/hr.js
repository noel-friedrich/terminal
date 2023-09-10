const letterData = {
    "4x4": {
        letters: {
            "A": 0b1111100111111001, "B": 0b1100101011011010, "C": 0b1111100010001111,
            "D": 0b1110100110011110, "E": 0b1111111010001111, "F": 0b1111100011101000,
            "G": 0b1111100010011111, "H": 0b1001100111111001, "I": 0b1111010001001111,
            "J": 0b1111000110011111, "K": 0b1011110010101001, "L": 0b1000100010001111,
            "M": 0b1111101110011001, "N": 0b1101101110011001, "O": 0b1111100110011111,
            "P": 0b1111100111111000, "Q": 0b1111100110111111, "R": 0b1111100111111010,
            "S": 0b1111100011110111, "T": 0b1111010001000100, "U": 0b1001100110011111,
            "V": 0b1001100110010110, "W": 0b1001100110111111, "X": 0b1001011001101001,
            "Y": 0b1001100111110100, "Z": 0b1111001001001111, "0": 0b1111101111011111,
            "1": 0b0010011000100111, "2": 0b1111001001001111, "3": 0b1111011100011111,
            "4": 0b1001100111110001, "5": 0b1111100011110111, "6": 0b1000111110011111,
            "7": 0b1111000100010001, "8": 0b1110101111010111, "9": 0b1111100111110001,
            " ": 0b0000000000000000
        },
        size: 4
    },
    "5x5": {
        letters: {
            "A": 0b1111110001111111000110001, "B": 0b1111010001111111000111110,
            "C": 0b1111110000100001000011111, "D": 0b1111010001100011000111110,
            "E": 0b1111110000111101000011111, "F": 0b1111110000111101000010000,
            "G": 0b1111110000101111000111111, "H": 0b1000110001111111000110001,
            "I": 0b1111100100001000010011111, "J": 0b1111000100001001010011100,
            "K": 0b1001010100110001010010010, "L": 0b1000010000100001000011111,
            "M": 0b1000111011101011000110001, "N": 0b1000111001101011001110001,
            "O": 0b1111110001100011000111111, "P": 0b1111110001111111000010000,
            "Q": 0b1111110001100011001111111, "R": 0b1111110001111111001010001,
            "S": 0b1111110000111110000111111, "T": 0b1111100100001000010000100,
            "U": 0b1000110001100011000111111, "V": 0b1000110001010100101000100,
            "W": 0b1000110001101011101110001, "X": 0b1000101010001000101010001,
            "Y": 0b1000101010001000010000100, "Z": 0b1111100010001000100011111,
            "0": 0b0111010001101011000101110, "1": 0b0110000100001000010000100,
            "2": 0b0110010010001000100011110, "3": 0b1111000010011100001011110,
            "4": 0b1000110001111110000100001, "5": 0b0111010000111100001011110,
            "6": 0b1111010000111101001011110, "7": 0b1111000010001000100010000,
            "8": 0b1111010010011001001011110, "9": 0b1111010010111100001011110,
            " ": 0b0000000000000000000000000, "/": 0b0001100110011001100010000,
            "\\": 0b1100001100001100001100001, "#": 0b0101011111010101111101010,
            "?": 0b1111100001001110000000100, ":": 0b0110001100000000110001100,
            "-": 0b0000000000011100000000000, ".": 0b0000000000000000110001100,
            ",": 0b0000000000001000110001000, 
            "a": 0b0000001110100101001001111, "b": 0b1000010000111001001011100,
            "c": 0b0000001110100001000001110, "d": 0b0001000010011101001001110,
            "e": 0b0110010010111101000001110, "f": 0b0001000100011100010000100,
            "g": 0b0110010010011100001011100, "h": 0b1000010000111001001010010,
            "i": 0b0010000000011100010001110, "j": 0b0010000000001000010011000,
            "k": 0b0100001000010100110001010, "l": 0b0100001000010000101000100,
            "m": 0b0000000000010101010110001, "n": 0b0000000000111001001010010,
            "o": 0b0000001100100101001001100, "p": 0b0000001110010100111001000,
            "q": 0b0000001110010100111000010, "r": 0b0000000000001100100001000,
            "s": 0b0000000110010000011001100, "t": 0b0010001110001000010000110,
            "u": 0b0000000000010100101000110, "v": 0b0000000000010100101000100,
            "w": 0b0000000000100011010101011, "x": 0b0000000000010100010001010,
            "y": 0b0101001010001100001000100, "z": 0b0000001110000100010001110
        },
        size: 5
    }
}

const randomCharData = size => {
    let out = ""
    for (let i = 0; i < size*size; i++) {
        out += (Math.random() < 0.5) ? "0" : "1"
    }
    return parseInt(out, 2)
}

const maxCodeSize = 100

terminal.addCommand("hr", async function(args) {
    const fontData = letterData[args.fontmode]
    if (fontData === undefined) {
        throw new Error(`Unknown fontmode "${args.fontmode}"`)
    }

    const symbols = Array.from(args.message).map(letter => fontData.letters[letter])

    if (symbols.some(s => s === undefined)) {
        throw new Error("Message contains unsupported characters!")
    }

    let codeSize = 1
    for (; (codeSize ** 2) < symbols.length; codeSize++) {
        if (codeSize >= maxCodeSize) {
            throw new Error("Maximum Code Size exeeded.")
        }
    }
    
    let sizePx = (fontData.size + 1) * codeSize - 1
    let pixelData = Array.from({length: sizePx + 2},
        () => Array.from({length: sizePx + 2}, () => false))

    while (args.fill && symbols.length < (codeSize * codeSize)) {
        // let randomIndex = Math.floor(Math.random() * pixelData.length)
        // symbols.splice(randomIndex, 0, randomCharData(fontData.size))
        symbols.push(randomCharData(fontData.size))
    }

    const drawPixelData = (data, width=30) => {
        const canvas = terminal.document.createElement("canvas")
        const context = canvas.getContext("2d")

        const sizePx = width * terminal.charWidth
        canvas.width = sizePx
        canvas.height = canvas.width * (data.length / data[0].length)

        const xStep = canvas.width / data[0].length
        const yStep = canvas.height / data.length

        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = "black"
        for (let x = 0; x < data[0].length; x++) {
            for (let y = 0; y < data.length; y++) {
                if (data[y][x]) {
                    context.fillRect(
                        x * xStep, y * yStep,
                        xStep, yStep
                    )
                }
            }
        }

        terminal.parentNode.appendChild(canvas)
        terminal.addLineBreak()
    }

    for (let i = 0; i < symbols.length; i++) {
        let px = (i % codeSize) * (fontData.size + 1) + 1
        let py = Math.floor(i / codeSize) * (fontData.size + 1) + 1

        for (let j = 0; j < fontData.size ** 2; j++) {
            let bitMask = (1 << (fontData.size ** 2 - j - 1))
            let bitActive = (symbols[i] & bitMask) != 0
            if (bitActive) {
                let x = j % fontData.size
                let y = Math.floor(j / fontData.size)
                pixelData[py + y][px + x] = true
            }
        }
    }

    drawPixelData(pixelData)
}, {
    description: "create a hr code",
    args: {
        "message:s": "the message to encode",
        "?f=fontmode:s": "the font mode to use",
        "?fill:b": "fill empty spaces with random data"
    },
    defaultValues: {
        fontmode: "5x5"
    }
})