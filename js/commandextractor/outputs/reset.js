terminal.addCommand("reset", async function() {
    async function animatedDo(action) {
        return new Promise(async resolve => {
            terminal.print(action)
            for (let i = 0; i < 6; i++) {
                await sleep(200)
                terminal.print(".")
            }
            await sleep(500)
            terminal.printf`${{[Color.COLOR_1]: "done"}}\n`
            resolve()
        })
    }
    return new Promise(async () => {
        await animatedDo("resetting")
        localStorage.removeItem("terminal-autosave")
        setTimeout(() => window.location.reload(), 500)
    })
}, {
    description: "reset the terminal"
})

async function fileFromUpload(fileType=null) {
    return new Promise(async (resolve, reject) => {
        let input = document.createElement("input")
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

        document.body.onfocus = () => {if (!input.value.length) reject()}  
    })
}

async function getMP3FromUpload() {
    return new Promise(async (resolve, reject) => {
        let input = document.createElement("input")
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
                let audio = document.createElement("audio")
                audio.src = event.target.result
                resolve(audio)
            }
            fileReader.readAsDataURL(input.files[0])
        }

        document.body.onfocus = () => {if (!input.value.length) reject()}  
    })
}


async function getImageFromUpload() {
    return new Promise(async (resolve, reject) => {
        let input = document.createElement("input")
        input.setAttribute("type", "file")
        input.setAttribute("accept", "image/*")
        input.click()

        input.onchange = function(event) {
            if (!input.value.length) {
                reject()
                return
            }
            let fileReader = new FileReader()
            fileReader.onload = function(event) {
                let image = document.createElement("img")
                image.onload = function() {
                    resolve(image)
                }
                image.src = event.target.result
            }
            fileReader.readAsDataURL(input.files[0])
        }

        document.body.onfocus = () => {if (!input.value.length) reject()}
    })
}

