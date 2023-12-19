async function fileFromUpload(fileType=null) {
    return new Promise(async (resolve, reject) => {
        let input = terminal.document.createElement("input")
        input.setAttribute("type", "file")
        if (fileType)
            input.setAttribute("accept", fileType)
        input.click()

        input.onchange = function(event) {
            if (!input.value.length) {
                reject()
                return
            }
            let fileReader = new FileReader()
            let fileName = input.files[0].name
            let readAsDataURL = (
                fileName.endsWith(".jpg")
                || fileName.endsWith(".png")
                || fileName.endsWith(".jpeg")
                || fileName.endsWith(".svg")
                || fileName.endsWith(".bmp")
                || fileName.endsWith(".gif")
            )
            fileReader.onload = function(event) {
                resolve([fileName, event.target.result, readAsDataURL])
            }
            if (readAsDataURL) {
                fileReader.readAsDataURL(input.files[0])
            } else {
                fileReader.readAsText(input.files[0])
            }
        }

        terminal.document.body.onfocus = () => {
            setTimeout(() => {
                if (!input.value.length)
                    reject()
            }, 1000)
        }  
    })
}

async function getMP3FromUpload() {
    return new Promise(async (resolve, reject) => {
        let input = terminal.document.createElement("input")
        input.setAttribute("type", "file")
        input.setAttribute("accept", "audio/mpeg3")
        input.click()

        input.onchange = function(event) {
            if (!input.value.length) {
                reject()
                return
            }
            let fileReader = new FileReader()
            fileReader.onload = function(event) {
                let audio = terminal.document.createElement("audio")
                audio.src = event.target.result
                resolve(audio)
            }
            fileReader.readAsDataURL(input.files[0])
        }

        terminal.document.body.onfocus = () => {if (!input.value.length) reject()}  
    })
}

async function getImageFromUpload({
    multiple=false
}={}) {
    return new Promise(async (resolve, reject) => {
        let input = terminal.document.createElement("input")
        input.setAttribute("type", "file")
        input.setAttribute("accept", "image/*")

        if (multiple) {
            input.setAttribute("multiple", "true")
        }

        input.click()

        let images = []
        let numExpectedImages = []

        input.onchange = function(event) {
            if (!input.value.length) {
                reject(new Error("No image selected"))
                return
            }

            numExpectedImages = input.files.length
            for (let file of input.files) {
                let fileReader = new FileReader()
                fileReader.onload = function(event) {
                    let image = terminal.document.createElement("img")
                    image.name = file.name
                    image.onload = function() {
                        if (multiple) {
                            images.push(image)
                            if (images.length >= numExpectedImages) {
                                resolve(images)
                            }
                        } else {
                            resolve(image)
                        }
                    }
                    image.src = event.target.result
                }
                fileReader.readAsDataURL(file)
            }
        }

        terminal.document.body.onfocus = () => {
            setTimeout(() => {
                if (!input.value.length) {
                    reject(new Error("No image selected"))
                }
            }, 500)
        }
    })
}

terminal.modules.upload = {
    file: fileFromUpload,
    mp3: getMP3FromUpload,
    image: getImageFromUpload,
}