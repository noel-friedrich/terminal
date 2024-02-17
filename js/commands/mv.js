terminal.addCommand("mv", async function(args) {
    let file = terminal.getFile(args.file)
    if (file == terminal.currDirectory) {
        throw new Error("Cannot move active directory")
    }

    let directory = terminal.getFile(args.directory, FileType.DIRECTORY)
    
    if (args.name) {
        if (!terminal.isValidFileName(args.name)) {
            throw new Error("Invalid Filename")
        } else if (directory.getFile(args.name)) {
            throw new Error("File with that name already exists in directory")
        } else {
            file.setName(args.name)
        }
    } else if (directory == file.parent || directory.fileExists(file.name)) {
        let nameFromNumber = undefined

        let nameStart = ""
        let nameEnding = ""
        let foundPoint = false
        for (let char of [...file.name].reverse()) {
            if (!foundPoint && char == ".") {
                foundPoint = true
            } else if (foundPoint) {
                nameStart = char + nameStart
            } else {
                nameEnding = char + nameEnding
            }
        }

        if (!foundPoint) {
            // swap them
            let temp = nameStart
            nameStart = nameEnding
            nameEnding = temp
        }

        let match = nameStart.match(/^(.+?)([0-9]+)$/)
        let dotQ = foundPoint ? "." : ""
        if (match) {
            nameFromNumber = n => `${match[1]}${(BigInt(match[2]) + BigInt(n))}${dotQ}${nameEnding}`
        } else {
            nameFromNumber = n => `${nameStart}${n}${dotQ}${nameEnding}`
        }

        const maxNumberingTries = 1000
        for (let i = 1; i <= maxNumberingTries; i++) {
            let fileName = nameFromNumber(i)
            if (terminal.isValidFileName(fileName) && !directory.fileExists(fileName)) {
                file.setName(fileName)
                break
            }
            
            if (i == maxNumberingTries) {
                throw new Error("Couldn't generate new unique filename. Provide one using the --name option")
            }
        }
    }

    file.parent.deleteChild(file)
    directory.addChild(file)
}, {
    description: "move a file",
    args: {
        "file:f": "file to move",
        "d=directory:f": "directory to move to",
        "?n=name:s": "new filename",
    }
})