terminal.addCommand("pascal", async function(args) {
    function generate(depth) {
        let rows = []
        let prevRow = []
        for (let i = 0; i < depth; i++) {
            let row = Array(i + 1)
            row[0] = 1
            row[i] = 1
            for (let j = 1; j < i; j++)
                row[j] = prevRow[j - 1] + prevRow[j]
            rows.push(row)
            prevRow = row
        }
        return rows
    }

    args.depth = ~~args.depth

    let data = generate(args.depth)
    // highest number is the one at the bottom middle always
    let maxNumWidth = data[args.depth - 1][Math.floor(args.depth / 2)].toString().length
    let nums = data.map(row => row.map(n => stringPadMiddle(n, maxNumWidth)))
    let rows = nums.map(row => row.join(" "))

    if (args.f) {
        terminal.printLine(rows[rows.length - 1])
        return
    }

    for (let i = 0; i < rows.length; i++) {
        terminal.printLine(stringPadMiddle(rows[i], args.depth * (maxNumWidth + 1)))
    }

}, {
    description: "print a pascal triangle",
    args: {
        "?depth:n:1~100": "the depth of the triangle",
        "?f:b": "only show the final row"
    },
    standardVals: {
        depth: 10
    }
})

