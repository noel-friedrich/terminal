terminal.addCommand("ls", function(args) {
    let targetFolder = terminal.getFile(!!args.folder ? args.folder : "", FileType.FOLDER)

    let recursive = args.r

    const CHARS = {
        LINE: "│",
        T: "├",
        L: "└",
        DASH: "─",
    }

    function listFolder(folder, indentation="") {
        let i = 0
        let printedL = false
        for (let [fileName, file] of Object.entries(folder.content)) {
            i++
            if (indentation.length > 0) {
                terminal.print(indentation)
            }
            if (i == Object.keys(folder.content).length) {
                terminal.print(CHARS.L)
                printedL = true
            } else {
                terminal.print(CHARS.T)
            }
            terminal.print(CHARS.DASH.repeat(2) + " ")
            if (file.type == FileType.FOLDER) {
                terminal.printCommand(`${fileName}/`, `cd ${file.path}/`)
                if (recursive) {
                    let indentAddition = `${CHARS.LINE}   `
                    if (printedL) {
                        indentAddition = "    "
                    }
                    listFolder(file, indentation + indentAddition)
                }
            } else {
                terminal.printLine(fileName)
            }
        }
    }

    listFolder(targetFolder)

    if (Object.entries(targetFolder.content).length == 0)
        terminal.printLine(`this directory is empty`)

}, {
    helpVisible: true,
    description: "list all files of current directory",
    args: {
        "?folder:f": "folder to list",
        "?r:b": "list recursively",
    },
    standardVals: {
        folder: ""
    }
})

