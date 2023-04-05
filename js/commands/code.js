const jsKeywords = [
    "abstract", "arguments", "await*", "boolean",
    "break", "byte", "case", "catch",
    "class*", "const", "continue",
    "debugger", "default", "delete", "do",
    "double", "else", "enum*", "eval",
    "export*", "extends*", "false", "final",
    "finally", "float", "for", "function",
    "goto", "if", "implements", "import*",
    "in", "instanceof", "int", "interface",
    "let*", "long", "native", "new",
    "null", "package", "private", "protected",
    "public", "return", "short", "static",
    "super*", "switch", "synchronized", "this",
    "throw", "throws", "transient", "true",
    "try", "typeof", "var", "void",
    "volatile", "while", "with", "yield",
    "abstract", "boolean", "byte",
    "double", "final", "float", "goto",
    "int", "long", "native", "short",
    "synchronized", "throws", "transient", "volatile",
    "Array", "Date", "eval", "function",
    "hasOwnProperty", "Infinity", "isFinite", "isNaN",
    "isPrototypeOf", "length", "Math", "NaN",
    "name", "Number", "Object", "prototype",
    "String", "toString", "undefined", "valueOf",
    "let", "yield", "enum", "await",
    "implements", "package", "protected", "static",
    "interface", "private", "public",
    "null", "true", "false",
    "var", "let", "const", "function",
]

const structureTokens = [
    "if", "(", ")", "{", "}",
    "[", "]", "yield", "await", "for", "while",
    "do", "switch", "case", "default", "try",
    "catch", "finally", "class", "extends",
    "implements", "interface", "package",
    "private", "protected", "public", "static",
    "import", "export", "from", "as", "return",
    "break", "continue", "debugger", "delete",
    "in", "instanceof", "new", "typeof", "void",
    "with", "super", "this", "throw", "throws",
    "else", "of"
]

const specialWords = [
    "terminal"
]

const jsSymbols = [
    "{", "}", "(", ")", "[", "]",
    ".", ";", ",", "<", ">", "=",
    "+", "-", "*", "%", "&", "|",
    "^", "!", "~", "?", ":", "/",
    "\\", "&&", "||", "++", "--", "<<",
    ">>", ">>>", "<=", ">=", "==", "!=",
    "===", "!==", "+=", "-=", "*=", "%=",
    "<<=", ">>=", ">>>=", "&=", "^=", "|=",
    "=>", "...",
]

const cat = `                        _
                       | \\
                       | |
                       | |
  |\\                   | |
 /, ~\\                / /
X     \`-.....-------./ /
 ~-.                   |
    \\                 /
    \\  /_     ~~~\\   /
     | /\\ ~~~~~   \\ |
     | | \\        || |
     | |\\ \\       || )
     (_/ (_/      ((_/`

terminal.addCommand("code", async function(args) {
    if (!terminal.commandExists(args.command))
        throw new Error(`Command "${args.command}" does not exist`)
    let command = await terminal.getCommand(args.command)
    let code = command.callback.toString()

    // https://github.com/noel-friedrich/terminal/issues/6
    if (args.command == "cat") {
        terminal.printEasterEgg("Cat-Egg")
        return terminal.printLine(cat)
    }

    function printJSCode(rawCode) {
        const isLetter = char => /[a-zA-Z]/.test(char)
        const isApostrophe = char => RegExp("['\"`]").test(char)
        const isNumber = text => !isNaN(parseInt(text))
        const isClass = text => isLetter(text[0]) && text[0] == text[0].toUpperCase()

        function tokenize(text) {
            let tokens = []
            let tempToken = ""
            for (let char of text) {
                if (isLetter(char)) {
                    tempToken += char
                } else {
                    if (tempToken != "") {
                        tokens.push(tempToken)
                        tempToken = ""
                    }
                    tokens.push(char)
                }
            }
            if (tempToken != "")
                tokens.push(tempToken)
            return tokens.map(token => [token, Color.WHITE])
        }

        let tokenColors = tokenize(rawCode)

        const commentColor = Color.hex("#F7AEF8")
        const stringColor = Color.hex("#B388EB")
        const keywordColor = Color.hex("#8093F1")
        const numberColor = Color.hex("#72DDF7")
        const symbolColor = Color.hex("#96E6B3")
        const specialColor = Color.hex("#D36060")
        const structureColor = Color.hex("#DBD3AD")
        const classColor = Color.hex("#F6C177")

        let inApostrophe = false
        let inLineComment = false
        let i = 0
        for (let [token, color] of tokenColors) {
            if (isNumber(token))
                color = numberColor
            if (jsKeywords.includes(token))
                color = keywordColor
            if (jsSymbols.includes(token))
                color = symbolColor
            if (specialWords.includes(token))
                color = specialColor
            if (structureTokens.includes(token))
                color = structureColor
            if (isClass(token))
                color = classColor

            let prevToken = (tokenColors[i - 1] ?? ["", Color.WHITE])[0]
            let prevTokenIsBlocker = prevToken == "\\"
            
            if (isApostrophe(token) && !inApostrophe && !prevTokenIsBlocker) {
                inApostrophe = token
                color = stringColor
            } else if (token === inApostrophe && !prevTokenIsBlocker) {
                inApostrophe = false
                color = stringColor
            } else if (inApostrophe) {
                color = stringColor
            }

            let nextToken = (tokenColors[i + 1] ?? ["", Color.WHITE])[0]
            if (token == "/" && nextToken == "/" && !inApostrophe) {
                inLineComment = true
                color = commentColor
            } else if (token == "\n" && inLineComment) {
                inLineComment = false
                color = commentColor
            } else if (inLineComment) {
                color = commentColor
            }

            if (token == "\n") {
                inApostrophe = false
                inLineComment = false
            }

            // consider this an easteregg
            // congrats if you found it

            terminal.print(token, color)
            i++
        }
    }

    printJSCode(code)

    printJSCode(", " + JSON.stringify(command.info, null, 4))
    terminal.addLineBreak()

    if (args.command == "code") {
        terminal.printEasterEgg("Codeception-Egg")
    }
}, {
    description: "show the source code of a command",
    args: {
        "command": "the command to show the source code of"
    }
})