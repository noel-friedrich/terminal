terminal.addCommand("collatz", async function(args) {
	let currNum = args.n

	if (currNum < 1n) {
		throw new Error("Number must not be below 1")
	}

	let output = ""
	let stepCount = 0
	
	output += currNum + "\n"
	while (currNum != 1) {
		if (currNum % 2n === 0n) {
			currNum >>= 1n
		} else {
			currNum = currNum * 3n + 1n
		}
		output += currNum + "\n"
		stepCount++
	}

	terminal.printLine(output)
	terminal.print(`(${stepCount} steps)`)
}, {
	description: "Calculate the Collatz Sequence (3x+1) for a given Number",
	args: {
		"n:bn": "the starting number of the sequence"
	},
})