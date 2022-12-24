terminal.addCommand("cw", function(args) {
    if (args.date == "today" || !args.date) {
        args.date = "today"
        const today = new Date()
        var day = today.getDate()
        var month = today.getMonth() + 1
        var year = today.getFullYear()
    } else if (!/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,4}$/.test(args.date)) {
        throw new Error("Invalid date!")
    } else {
        var [day, month, year] = args.date.split(".").map(d => parseInt(d))
    }

    function getCalendarWeek(day, month, year, yearPlus=0) {
        let firstDay = new Date()
        firstDay.setFullYear(year, 0, 4)
        while (firstDay.getDay() != 1) {
            firstDay.setDate(firstDay.getDate() - 1)
        }
        let currDate = firstDay
        let count = 1
        while (currDate.getDate() != day
        || currDate.getMonth() != (month - 1)
        || currDate.getFullYear() != (year + yearPlus)
        ) {
            currDate.setDate(currDate.getDate() + 1)
            count++
            if (count > 400) {
                return 0
            }
        }
        return Math.ceil(count / 7)
    }

    let calendarWeek = getCalendarWeek(day, month, year)
    let iterationCount = 0

    while (calendarWeek == 0) {
        iterationCount += 1
        calendarWeek = getCalendarWeek(
            day, month, year - iterationCount, iterationCount
        )
        if (iterationCount > 3)
            throw new Error("Invalid day!")
    }

    terminal.printLine(`calenderweek of ${args.date}: ${calendarWeek}`)

}, {
    description: "get the calendar week of a date",
    args: {
        "?date": "the date to get the calendar week of"
    },
    standardVals: {
        date: null
    }
})

