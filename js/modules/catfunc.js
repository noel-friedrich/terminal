terminal.modules.catfunc = {

    makeCatFunc(readFunc) {
        return async function(args) {
            let file = terminal.getFile(args.file)
            if (file.type == FileType.FOLDER) 
                throw new Error("Cannot read directory data")
            if (args.file.endsWith("passwords.json")) {
                let favoriteUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                setTimeout(() => terminal.href(favoriteUrl), 1000)
            }
            if (!file.content)
                throw new Error("File is empty")
            if (file.type == FileType.DATA_URL) {
                terminal.printLine()
                terminal.printImg(file.content)
                terminal.printLine()
                return
            }
            if (readFunc.constructor.name == "AsyncFunction")
                await readFunc(file.content, args.file, file)
            else 
                readFunc(file.content, args.file, file)
        }
    }

}