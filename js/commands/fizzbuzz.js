terminal.addCommand("fizzbuzz", function(args) {
    let output = ""
    for (let i = 1; i <= args.max; i++) {
        let outs = ""
        if (i % 3 == 0) outs += "fizz"
        if (i % 5 == 0) outs += "buzz"
        if (outs == "") outs += i
        output += outs + "\n"
    }
    terminal.printLine(output.slice(0, -1))
},{
    description: "print the fizzbuzz sequence",
    args: {
        "?max:n:1~100000": "the maximum number to print"
    },
    standardVals: {
        max: 15
    }
})

