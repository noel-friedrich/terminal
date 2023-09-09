terminal.addCommand("debug", function(args) {
	if (terminal.debugMode) {
		throw new Error("Debug Mode already activated")
	}

	terminal.debugMode = true
	terminal.printSuccess("Activated Debug Mode")
	terminal.log("Activated Debug Mode")
} ,{
	description: "activate the debug mode to enable untested new features",
	isSecret: true
})