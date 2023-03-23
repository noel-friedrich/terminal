terminal.addCommand("keyboard", function(args) {
    let mode = args.m || "toggle"

    if (mode == "status") {
        let status = "auto"
        if (terminal.data.mobile === true) {
            status = "on"
        } else if (terminal.data.mobile === false) {
            status = "off"
        }

        terminal.printLine(`keyboard_mode=\"${status}\"`)
        terminal.addLineBreak()
        terminal.printCommand("Set to \"on\"", "keyboard on")
        terminal.printCommand("Set to \"off\"", "keyboard off")
        terminal.printCommand("Set to \"auto\"", "keyboard auto")
    }

    if (mode == "on") {
        terminal.data.mobile = true
        terminal.reload()
    }

    if (mode == "off") {
        terminal.data.mobile = false
        terminal.reload()
    }

    if (mode == "auto") {
        terminal.data.resetProperty("mobile")
        terminal.reload()
    }
}, {
    description: "Toggle mobile mode",
    args: {
        "?m=mode:s": "status | on | off | auto"
    },
    defaultValues: {
        m: "status"
    }
})