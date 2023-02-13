terminal.addCommand("lscmds", async function(args) {
    let functions = [...terminal.visibleFunctions]
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.name.length - b.name.length)
    if (args.m) {
        functions.sort((a, b) => a.name.localeCompare(b.name))
        let maxFuncLength = terminal.visibleFunctions.reduce((p, c) => Math.max(p, c.name.length), 0)
        const allDescriptions = functions.map(f => f.description ? f.description : "undefined")
        let maxDescLength = allDescriptions.reduce((p, c) => Math.max(p, c.length), 0)
        let text = ""
        for (let i = 0; i < functions.length; i++) {
            let func = functions[i]
            let description = allDescriptions[i]
            let funcPart = stringPadBack("\`" + func.name + "\`", maxFuncLength + 2)
            let descpart = stringPadBack(description, maxDescLength)
            text += `| ${funcPart} | ${descpart} |\n` 
        }
        terminal.printLine(text)
        await terminal.copy(text)
        terminal.printLine("Copied to Clipboard ✓")
        return
    }

    function createTableData(columns) {
        let columnHeight = Math.ceil(functions.length / columns)
        let tableData = Array.from({length: columnHeight}, () => Array.from({length: columns}, () => ""))
        let columnIndex = 0
        let functionIndex = 0
        while (true) {
            let func = functions[functionIndex]
            if (!func) break
            tableData[functionIndex % columnHeight][columnIndex] = func.name
            if (functionIndex % columnHeight == columnHeight - 1) columnIndex++
            functionIndex++
        }
        return tableData
    }

    function printTable(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => c === undefined ? 0 : c.length)))
        }

        for (let row of tableData) {
            for (let i = 0; i < row.length; i++) {
                let cell = row[i]
                let width = columnWidths[i]
                terminal.printCommand(stringPadBack(cell, width + 2), cell, undefined, false)
            }
            terminal.addLineBreak()
        }
    }

    function calculateTableWidth(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => c === undefined ? 0 : c.length)))
        }

        return columnWidths.reduce((p, c) => p + c + 2, 0)
    }

    for (let tableWidth = 20; tableWidth >= 1; tableWidth--) {
        let tableData = createTableData(tableWidth)

        let width = calculateTableWidth(tableData)

        if (width <= 90 || tableWidth == 1) {
            printTable(tableData)
            break
        }
    }

    terminal.addLineBreak()
    terminal.printLine(`- in total, ${terminal.functions.length} commands have been implemented`)
    terminal.print("- use ")
    terminal.printCommand("man", "man", undefined, false)
    terminal.printLine(" <cmd> to get more information about a command")
    terminal.print("- use ")
    terminal.printCommand("whatis *", "whatis *", undefined, false)
    terminal.printLine(" to see all commands including their description")

}, {
    description: "list all available commands",
    helpVisible: true,
    args: {
        "?m:b": "format output as markdown table"
    }
})

