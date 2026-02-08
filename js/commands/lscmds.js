terminal.addCommand("lscmds", async function(args) {
    let functions = [...terminal.visibleFunctions]
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.name.length - b.name.length)

    const allCategories = Array.from(new Set(functions.map(f => f.category)))
    const categoryColors = Object.fromEntries(allCategories.map((c, i) => {
        return [c, Color.hsl(i / allCategories.length, 1, 0.8)]
    }))

    function createTableData(columns) {
        let columnHeight = Math.ceil(functions.length / columns)
        let tableData = Array.from({length: columnHeight}, () => Array.from({length: columns}, () => ""))
        let columnIndex = 0
        let functionIndex = 0
        while (true) {
            let func = functions[functionIndex]
            if (!func) break
            tableData[functionIndex % columnHeight][columnIndex] = func
            if (functionIndex % columnHeight == columnHeight - 1) columnIndex++
            functionIndex++
        }
        return tableData
    }

    function printTable(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => !c ? 0 : c.name.length)))
        }

        for (let row of tableData) {    
            for (let i = 0; i < row.length; i++) {
                let cell = row[i]
                let commandName = cell ? cell.name : ""
                let width = columnWidths[i]
                const background = cell ? categoryColors[cell.category] : new Color(0, 0, 0, 0)
                terminal.printCommand(commandName, commandName, background, false)

                if (i < row.length - 1) {
                    terminal.print(" ".repeat(Math.max(0, width - commandName.length + 2)))
                }
            }
            terminal.addLineBreak()
        }
    }

    function calculateTableWidth(tableData) {
        let columnWidths = []
        for (let i = 0; i < tableData[0].length; i++) {
            let column = tableData.map(row => row[i])
            columnWidths.push(Math.max(...column.map(c => !c ? 0 : c.name.length)))
        }

        return columnWidths.reduce((p, c) => p + c + 2, 0)
    }

    terminal.addLineBreak()
    for (const category of allCategories) {
        terminal.print(` ${capitalize(category.replaceAll("-", " "))} `, Color.BLACK, {background: categoryColors[category]})
        terminal.print(" ")
    }
    terminal.addLineBreak(2)

    for (let tableWidth = 20; tableWidth >= 1; tableWidth--) {
        let tableData = createTableData(tableWidth)

        let width = calculateTableWidth(tableData)

        if (width <= 91 || tableWidth == 1) {
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
    terminal.printLine(" to see all commands including their descriptions")

}, {
    description: "list all available commands",
    helpVisible: true,
    category: "information"
})

