terminal.addCommand("grep", async function(args) {
    let recursive = args.r ?? false
    let ignorecase = args.i ?? false
    let invert = args.v ?? false
    let linematch = args.x ?? false

    if (ignorecase)
        args.pattern = args.pattern.toLowerCase()

    let matches = []

    function processFile(file, filename, allowRecursionOnce=false) {
        if (file.type == FileType.FOLDER) {
            if (recursive || allowRecursionOnce) {
                for (let [newName, newFile] of Object.entries(file.content)) {
                    if (!recursive && newFile.type == FileType.FOLDER) continue
                    processFile(newFile, newName)
                }
            } else {
                throw new Error(`File ${filename} is a directory!`)
            }
        } else {
            for (let line of file.content.split("\n")) {
                if (linematch) {
                    let tempLine = line
                    if (ignorecase)
                        tempLine = line.toLowerCase()
                    var matching = tempLine === args.pattern
                } else if (ignorecase) {
                    var matching = line.toLowerCase().includes(args.pattern)
                } else {
                    var matching = line.includes(args.pattern)
                }
                if (matching ^ invert) {
                    if (ignorecase) {
                        var offset = line.toLowerCase().indexOf(args.pattern)
                    } else {
                        var offset = line.indexOf(args.pattern)
                    }
                    matches.push({
                        filename: filename,
                        filepath: file.path,
                        line: line,
                        offset: offset,
                    })
                }
            }
        }
    }

    if (args.file == "*") {
        processFile(terminal.currFolder, ".", true)
    } else {
        for (let filename of args.file.split(" ")) {
            let file = terminal.getFile(filename)
            processFile(file, filename)
        }
    }

    for (let match of matches) {
        terminal.printCommand(
            match.filename,
            `cat ${match.filepath}`,
            Color.COLOR_1, false
        )
        terminal.print(": ")
        if (match.offset == -1) {
            terminal.print(match.line)
        } else {
            let slicePoint = match.offset + 100
            if (slicePoint < match.line.length)
                match.line = match.line.slice(0, slicePoint) + "..."
            let prevLine = match.line.substring(0, match.offset)
            let matchLine = match.line.substring(match.offset, match.offset + args.pattern.length)
            let nextLine = match.line.substring(match.offset + args.pattern.length)
            terminal.print(prevLine)
            terminal.print(matchLine, Color.COLOR_2)
            terminal.print(nextLine)
        }
        terminal.addLineBreak()
    }

    if (matches.length == 0) {
        terminal.printLine("no matches")
    }

}, {
    description: "search for a pattern in a file",
    args: {
        "pattern": "the pattern to search for",
        "file": "the file to search in",
        "?r:b": "search recursively",
        "?i:b": "ignore case",
        "?v:b": "invert match",
        "?x:b": "match whole lines",
    }
})

