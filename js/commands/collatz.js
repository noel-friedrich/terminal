terminal.addCommand("collatz", async function(args) {
	function* collatz(n) {	
		while (n != 1) {
			yield n
			if (n % 2n === 0n) {
				n >>= 1n
			} else {
				n = n * 3n + 1n
			}
		}
		yield 1n
	}

	if (args.n < 1n) {
		throw new Error("Number must not be below 1")
	}
	
	if (!args.visualize) {
		let count = 0
		for (const n of collatz(args.n)) {
			terminal.printLine(n)
			count++
		}
		terminal.printLine(`\n(${count} step` + (count == 1 ? "" : "s") + ")")
		return
	}

	await terminal.modules.import("statistics", window)

	const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = 400
    const context = canvas.getContext("2d")
    terminal.parentNode.appendChild(canvas)
    terminal.scroll()

	const numbers = new Dataset([])
	for (const n of collatz(args.n)) {
		if (args["log-scale"]) {
			numbers.addNumber(Math.log(parseInt(n)))
		} else {
			numbers.addNumber(parseInt(n))
		}
		
		numbers.lineplot(context, {
			backgroundColor: terminal.data.background.toString(),
			color: terminal.data.foreground.toString(),
			arrowSize: 5
		}, {
			color: terminal.data.foreground.toString(),
			displayPoints: true
		})
		await sleep(10)
	}
	
	terminal.printLine(`\n${numbers.length} steps to reach 1`)
}, {
	description: "Calculate the Collatz Sequence (3x+1) for a given Number",
	args: {
		"n:bn": "the starting number of the sequence",
		"?v=visualize:b": "visualize the numbers as a graph",
		"?l=log-scale:b": "use a logarithmic scale to graph the numbers"
	},
})