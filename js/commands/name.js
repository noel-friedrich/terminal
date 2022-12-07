terminal.addCommand("name", async function(args) {
    await terminal.modules.import("game", window)

	const methods = {
		set: async () => {
			let newName = args.newname || ""
			while (!/^[a-zA-Z0-9_\-]{1,20}$/.test(newName)) {
				if (newName) {
            		terminal.printError("Name must be 1-20 characters long and only contain letters, numbers, dashes and underscores")
				}
				newName = await terminal.prompt("[highscores] username: ")
			}
			
			HighscoreApi.setUsername(newName)
			terminal.printSuccess("Set new username")
            terminal.print("Reset the username using ")
            terminal.printCommand("name reset", "name reset", Color.COLOR_1)
		},
		reset: async () => {
			if (HighscoreApi.username) {
				HighscoreApi.resetUsername()
				terminal.printSuccess("Reset username")
			} else {
				terminal.printError("No custom username found")
			}
		},
		get: async () => {
			let name = localStorage.getItem("highscore_username")
            if (name == null) {
                name = undefined
            }
			terminal.printLine(`Current username: "${name}"`)
		}
	}
	
	if (!Object.keys(methods).includes(args.method))
		throw new Error(`Unknown method "${args.method}"`)
		
	await methods[args.method]()
}, {
	description: "set a default name for the highscore system to use",
	args: {
		"method": "set | get | reset",
		"?newname": "the new name"
	},
})