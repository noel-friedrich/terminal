terminal.addCommand("cal", async function(args) {
    const today = new Date()

    const monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ]

    class PrintInstruction {

        constructor(text, color, backgroundColor) {
            this.text = text
            this.color = color
            this.backgroundColor = backgroundColor
        }
    
    }

    let tempPrintInstructions = []

    const monthsPerRow = 3
    const monthSideSpacing = 4

    function addPrint(text, color, backgroundColor) {
        tempPrintInstructions.push(new PrintInstruction(text, color, backgroundColor))
    }

    function executePrintInstructions(printInstructions) {
        for (let instruction of printInstructions) {
            if (instruction === undefined)
                continue
            terminal.print(instruction.text, instruction.color, {background: instruction.backgroundColor})
        }
    }

    function restructureInstructions(instructions) {
        let lines = []
        let tempLine = []
        for (let instruction of instructions) {
            if (instruction.text == "\n") {
                lines.push(tempLine)
                tempLine = []
            } else {
                tempLine.push(instruction)
            }
        }
        if (tempLine.length > 0)
            lines.push(tempLine)
        return lines
    }

    function combineMonthInstructions(monthInstructions) {
        let combinedInstructions = []
        if (monthInstructions.length !== 12)
            throw new Error("Invalid month instructions")

        for (let startMonth = 0; startMonth < 12; startMonth += monthsPerRow) {
            for (let lineIndex = 0; lineIndex < monthInstructions[0].length; lineIndex++) {
                for (let monthIndex = startMonth; monthIndex < startMonth + monthsPerRow; monthIndex++) {
                    combinedInstructions = combinedInstructions.concat(monthInstructions[monthIndex][lineIndex])
                    combinedInstructions.push(new PrintInstruction(" ".repeat(monthSideSpacing)))
                }
                combinedInstructions.push(new PrintInstruction("\n"))
            }
        }
        return combinedInstructions
    }

    Date.prototype.getRealDay = function() {
        return this.getDay() == 0 ? 6 : this.getDay() - 1
    }

    function printMonth(monthIndex, year) {
        tempPrintInstructions = []
        let tableData = Array.from(Array(6)).map(() => Array(7).fill("  "))
        let tableHeader = "Mo Tu We Th Fr Sa Su"
        let date = new Date()
        date.setFullYear(year, monthIndex, 1)
        let month = monthNames[date.getMonth()]
        let dayOfMonth = (new Date()).getDate()

        function printTable() {
            let headerText = `${month} ${stringPad(year, 4, "0")}`
            headerText = stringPadMiddle(headerText, tableHeader.length)
            addPrint(headerText, Color.COLOR_1)
            addPrint("\n")
            addPrint(tableHeader)
            addPrint("\n")
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 7; x++) {
                    if (dayOfMonth == parseInt(tableData[y][x]) &&
                        today.getMonth() == monthIndex &&
                        today.getFullYear() == year) {
                        addPrint(tableData[y][x], Color.BLACK, Color.WHITE)
                    } else {
                        addPrint(tableData[y][x])
                    }
                    if (x < 7 - 1)
                        addPrint(" ")
                }
                addPrint("\n")
            }

            if (monthIndex < 12 - 1) {
                addPrint("\n")
            }
        }

        let weekIndex = 0
        for (let i = 1;; i++) {
            date.setDate(i)
            if (date.getMonth() != monthNames.indexOf(month)) {
                break
            }
            if (date.getRealDay() == 0) {
                weekIndex++
            }
            tableData[weekIndex][date.getRealDay()] = stringPad(String(i), 2)
        }

        printTable()
            
        return tempPrintInstructions
    }

    let chosenYear = null
    let chosenMonth = null

    argument_loop:
    for (let argument of Object.values(args).filter(i => i != undefined)) {
        for (let month of monthNames) {
            if (month.toLowerCase().startsWith(argument.toLowerCase())) {
                chosenMonth = monthNames.indexOf(month)
                continue argument_loop
            }
        }
        if (/^[0-9]{1,4}$/.test(argument)) {
            chosenYear = parseInt(argument)
        } else if (/^[0-9]{1,2}\.[0-9]{1,4}$/.test(argument)) {
            let [month, year] = argument.split(".")
            chosenMonth = parseInt(month) - 1
            chosenYear = parseInt(year)
        } else if (/^[0-9]{1,4}\.[0-9]{1,2}$/.test(argument)) {
            let [year, month] = argument.split(".")
            chosenMonth = parseInt(month) - 1
            chosenYear = parseInt(year)
        } else {
            throw new Error(`Invalid Month/Year "${argument}"`)
        }
    }

    if (chosenYear < 0) throw new Error("Cannot look past the year 0 - sorry")
    if (chosenYear > 9999) throw new Error("Cannot look past the year 9999 - sorry")
    if (chosenMonth > 11 || chosenMonth < 0)
        throw new Error("That month doesn't exist in this world.")

    if (chosenYear == null && chosenMonth == null) {
        chosenYear = today.getFullYear()
        chosenMonth = today.getMonth()
    }

    if (chosenMonth != null && chosenYear == null) {
        chosenYear = today.getFullYear()
    }

    if (chosenMonth == null) {
        let monthInstructions = []
        for (let month = 0; month < 12; month++) {
            let printInstructions = printMonth(month, chosenYear)
            let structuredInstructions = restructureInstructions(printInstructions)
            monthInstructions.push(structuredInstructions)
        }
        let combinedInstructions = combineMonthInstructions(monthInstructions)
        executePrintInstructions(combinedInstructions)
    } else {
        executePrintInstructions(printMonth(chosenMonth, chosenYear))
    }

}, {
    description: "print a calendar",
    args: {
        "?month": "the month to print",
        "?year": "the year to print"
    }
})

