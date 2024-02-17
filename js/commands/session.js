terminal.window.addEventListener("beforeunload", function (e) {
    if (!terminal.fileSystem.inSessionMode) {
        return
    }

    e.preventDefault()
    return "You have an active terminal session. If you leave now, all unsaved changes will be gone"
})

terminal.addCommand("session", async function(args) {
    if (args.action == "begin") {
        if (terminal.fileSystem.inSessionMode) {
            throw new Error("Session already active")
        }

        terminal.fileSystem.beginSession()
        terminal.printSuccess("Successfully started a session.")
        terminal.printLine("All changes you make to the filesystem are now temporary")
        terminal.printLine("and will thus be gone when you reload the website. However,")
        terminal.printLine("this removes the necessary limit of very limited local storage.\n")
        terminal.print("- To end the session, use ")
        terminal.printCommand("session end")
    } else if (args.action == "reset") {
        if (!terminal.fileSystem.inSessionMode) {
            throw new Error("No active session found")
        }

        terminal.fileSystem.reset()
        terminal.printSuccess("Successfully reset the session filesystem")
    } else if (args.action == "save") {
        if (!terminal.fileSystem.inSessionMode) {
            throw new Error("No active session found")
        }

        const dateTime = new Date()
        let fileName = "session-"
        fileName += `${dateTime.getFullYear().toString().padStart(4, '0')}`
        fileName += `${(dateTime.getMonth() + 1).toString().padStart(2, '0')}`
        fileName += `${dateTime.getDate().toString().padStart(2, '0')}`
        fileName += "-"
        fileName += `${dateTime.getHours().toString().padStart(2, '0')}`
        fileName += `${dateTime.getMinutes().toString().padStart(2, '0')}`
        fileName += `${dateTime.getSeconds().toString().padStart(2, '0')}`
        fileName += ".json"

        let sessionFile = new PlainTextFile(terminal.fileSystem.toJSON())
        downloadFile(sessionFile.setName(fileName))

        terminal.printSuccess(`Successfully saved ${sessionFile.name}`)

    } else if (args.action == "load") {
        if (!terminal.fileSystem.inSessionMode) {
            throw new Error("No active session found")
        }

        await terminal.modules.load("upload", terminal)
        try {
            var [fileName, fileContent, isDataURL] = await terminal.modules.upload.file()
        } catch (e) {
            throw new Error("File Upload Failed")
        }

        try {
            terminal.fileSystem.loadJSON(fileContent)
        } catch (e) {
            throw new Error("Invalid session file")
        }

        terminal.printSuccess(`Successfully loaded ${fileName}`)

    } else if (args.action == "end") {
        if (!terminal.fileSystem.inSessionMode) {
            throw new Error("No active session found")
        }

        terminal.fileSystem.endSession()
        await terminal.fileSystem.load()
        terminal.printSuccess("Successfully ended the session.")
        terminal.print("The previous filesystem is restored. All session changes are gone.")
    }
}, {
    description: "manage a filesystem session",
    args: {
        "action:e:begin|reset|save|load|end": "<enum>"
    }
})  