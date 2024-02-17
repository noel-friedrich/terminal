terminal.addCommand("ls", function(args) {
    let targetFolder = terminal.getFile(args.folder || "", FileType.DIRECTORY)

    const CHARS = {
        LINE: "│",
        T: "├",
        L: "└",
        DASH: "─",
    }

    function listFolder(directory, indentation="") {
        let i = 0
        let printedL = false
        for (let file of directory.children) {
            i++
            if (indentation.length > 0) {
                terminal.print(indentation)
            }
            if (i == directory.children.length) {
                terminal.print(CHARS.L)
                printedL = true
            } else {
                terminal.print(CHARS.T)
            }
            terminal.print(CHARS.DASH.repeat(2) + " ")
            if (file.isDirectory) {
                terminal.printCommand(`${file.name}/`, `cd ${file.path}`)
                if (args.recursive) {
                    let indentAddition = `${CHARS.LINE}   `
                    if (printedL) {
                        indentAddition = "    "
                    }
                    listFolder(file, indentation + indentAddition)
                }
            } else {
                terminal.printLine(file.name)
            }
        }
    }

    listFolder(targetFolder)

    if (targetFolder.children.length == 0)
        terminal.printLine(`this directory is empty`)

}, {
    helpVisible: true,
    description: "list all files of current directory",
    args: {
        "?folder:f": "folder to list",
        "?r=recursive:b": "list recursively",
    },
    standardVals: {
        folder: ""
    }
})

