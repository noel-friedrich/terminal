terminal.addCommand("pi", async function(args) {
    if (args.n < 0) {
        throw new Error("number of digits can't be negative")
    }

    if (!args.yes) {
        if (args.n > 100000) {
            await terminal.acceptPrompt("This will take very long to calculate. Continue? ", false)
        } else if (args.n > 10000) {
            await terminal.acceptPrompt("This will take a bit to calculate. Continue?")
        }
    }

    let i = 1n
    let x = 3n * (10n ** (BigInt(args.n - 2) + 20n))
    let pi = x

    while (x > 0) {
        x = x * i / ((i + 1n) * 4n)
        pi += x / (i + 2n)
        i += 2n
    }
    
    const piString = "3." + (pi / (10n ** 20n)).toString().slice(1)

    if (args.unwrap) {
        terminal.printLine(piString)
    } else {
        for (i = 0; i < piString.length; i += 100) {
            terminal.printLine(piString.slice(i, i + 100))
        }
    }

    if (args.copy) {
        await terminal.copy(piString)
        terminal.printLine("\nCopied digits to Clipboard ✓") 
    }
}, {
    description: "calculate pi to the n-th digit",
    args: {
        "?n:i": "the number of digits",
        "?w=unwrap:b": "don't split the digits into lines.",
        "?c=copy:b": "copy the digits to the clipboard",
        "?y=yes:b": "ignore any computation warnings"
    },
    standardVals: {
        n: 100
    }
})


