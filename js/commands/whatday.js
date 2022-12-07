terminal.addCommand("whatday", function(args) {

    function dayToStr(n) {
        return [
            "first", "second", "third", "fourth",
            "fifth", "sixth", "seventh", "eigth",
            "ninth", "tenth", "eleventh", "twelfth",
            "thirteenth", "fourteenth", "fifteenth",
            "sixteenth", "seventeenth", "eighteenth",
            "nineteenth", "twentyth", "twentyfirst",
            "twentysecond", "twentythird", "twentyfourth",
            "twentyfifth", "twentysixth", "twentyseventh",
            "twentyeighth", "twentyninth", "thirtieth",
            "thirtyfirst"
        ][n - 1]
    }

    function yearToStr(n) {
        if (n == 0) return "zero"
        let out = ""
        if (n < 0) {
            out += "minus "
            n *= -1
        }
        function twoDigitNumStr(n) {
            const n1s = [
                "", "one", "two", "three", "four", "five",
                "six", "seven", "eight", "nine", "ten",
                "eleven", "twelve", "thirteen", "fourteen",
                "fifteen"
            ], n2s = [
                "", "", "twenty", "thirty", "fourty",
                "fifty", "sixty", "seventy", "eighty",
                "ninety"
            ]
            if (n1s[n]) return n1s[n]
            let n1 = n % 10
            let n2 = parseInt((n - n1) / 10)
            let out = ""
            out += n2s[n2]
            out += n1s[n1]
            if (n2 == 1) {
                out += "teen"
            }
            return out
        }
        if (String(n).length == 1) {
            return out + twoDigitNumStr(n)
        }
        if (String(n).length == 2) {
            return out + twoDigitNumStr(n)
        }
        if (String(n).length == 3) {
            let n1 = String(n)[0]
            let n2 = String(n).slice(1, 3)
            return out + twoDigitNumStr(n1) + "hundred" + twoDigitNumStr(n2)
        }
        if (String(n).length == 4) {
            let n1 = String(n).slice(0, 2)
            let n2 = String(n).slice(2, 4)
            return out + twoDigitNumStr(n1) + "-" + twoDigitNumStr(n2)
        } 
    }

    const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ], monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September",
        "October", "November", "December"
    ]

    let dateStr = args["DD.MM.YYYY"]

    function dateEq(d1, d2) {
        return (d1.getFullYear() == d2.getFullYear()
        && d1.getMonth() == d2.getMonth()
        && d1.getDate() == d2.getDate())
    }

    function sayDay(date) {
        let day = dayToStr(date.getDate())
        let month = monthNames[date.getMonth()].toLowerCase()
        let year = yearToStr(date.getFullYear())
        let dayName = dayNames[date.getDay()].toLowerCase()
        if (dateEq(new Date(), date)) {
            terminal.printLine(`today is a ${dayName}`)
        } else {
            if (new Date() > date) {
                terminal.printLine(`the ${day} of ${month} of the year ${year} was a ${dayName}`)
            } else {
                terminal.printLine(`the ${day} of ${month} of the year ${year} will be a ${dayName}`)
            }
        }
    }

    if (dateStr.toLowerCase() == "t" || dateStr.toLowerCase() == "today") {
        sayDay(new Date())
        return
    } else if (/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,4}$/.test(dateStr)) {
        let [d, m, y] = dateStr.split(".").map(i => parseInt(i))
        let date = new Date()
        date.setFullYear(y, m - 1, d)
        if (date.getDate() != d || (date.getMonth() + 1) != m || date.getFullYear() != y) {
            throw new Error("Invalid day - doesn't exist.")
        }
        sayDay(date)
    } else {
        terminal.printLine("Date-Format: DD:MM:YYYY, e.g. 01.01.1970")
        throw new Error(`Invalid date: ${dateStr}`)
    }
    
}, {
    description: "get the weekday of a date",
    args: ["DD.MM.YYYY"]
})

