terminal.addCommand("download", function(args) {
    function downloadFile(fileName, file) {
        let element = document.createElement('a')
        if (file.type == FileType.DATA_URL)
            var dataURL = file.content
        else
            var dataURL = 'data:text/plain;charset=utf-8,' + encodeURIComponent(file.content)
        element.setAttribute('href', dataURL)
        element.setAttribute('download', fileName)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot download directory")
    downloadFile(file.name, file)
}, {
    description: "download a file",
    args: {"file": "the file to download"}
})