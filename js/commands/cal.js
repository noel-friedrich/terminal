terminal.addCommand("cal", async function(args) {
    const today = new Date()

    const monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ]

    function printMonth(monthIndex, year) {
        let tableData = Array.from(Array(6)).map(() => Array(7).fill("  "))
        let tableHeader = "Su Mo Tu We Th Fr Sa"
        let date = new Date()
        date.setFullYear(year, monthIndex, 1)
        let month = monthNames[date.getMonth()]
        let dayOfMonth = (new Date()).getDate()

        function printTable() {
            let headerText = `${month} ${stringPad(year, 4, "0")}`
            let paddingWidth = Math.floor((tableHeader.length - headerText.length) / 2)
            for (let i = 0; i < paddingWidth; i++) {
                headerText = " " + headerText
            }
            terminal.printLine(headerText, Color.COLOR_1)
            terminal.printLine(tableHeader)
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 7; x++) {
                    if (dayOfMonth == parseInt(tableData[y][x]) &&
                        today.getMonth() == monthIndex &&
                        today.getFullYear() == year) {
                        terminal.print(tableData[y][x] + " ", Color.COLOR_1)
                    } else {
                        terminal.print(tableData[y][x] + " ")
                    }
                }
                terminal.printLine()
            }
        }

        let weekIndex = 0
        for (let i = 1;; i++) {
            date.setDate(i)
            if (date.getMonth() != monthNames.indexOf(month)) {
                break
            }
            if (date.getDay() == 0) {
                weekIndex++
            }
            tableData[weekIndex][date.getDay()] = stringPad(String(i), 2)
        }

        printTable()
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
        for (let month = 0; month < 12; month++) {
            printMonth(month, chosenYear)
            if (month < 12 - 1) {
                terminal.printLine()
            }
        }
    } else {
        printMonth(chosenMonth, chosenYear)
    }

}, {
    description: "print a calendar",
    args: ["?month", "?year"]
})

