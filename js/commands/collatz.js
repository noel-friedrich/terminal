terminal.addCommand("collatz", async function(args) {
	let currNum = args.n

	if (currNum < 1) {
		throw new Error("Number must not be below 1")
	}

	let output = ""
	let stepCount = 0
	
	output += currNum + "\n"
	while (currNum != 1) {
		if (stepCount >= args.m) {
			output += "Reached Limit"
			terminal.printLine(output)
			return
		}
		if (currNum % 2 === 0) {
			currNum = currNum / 2
		} else {
			currNum = currNum * 3 + 1
		}
		output += currNum + "\n"
		stepCount++
	}

	terminal.printLine(output)
	terminal.print(`(${stepCount} steps)`)
}, {
	description: "Calculate the Collatz Sequence (3x+1) for a given Number",
	args: {
		"n:i": "the starting number of the sequence",
		"?m=max:i": "max number of steps to print"
	},
	standardVals: {
		m: 999999999999
	}
})