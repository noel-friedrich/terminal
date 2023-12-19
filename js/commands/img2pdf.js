const img2pdfUrl = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js"

async function rotateImg90(img) {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    canvas.width = img.naturalHeight
    canvas.height = img.naturalWidth

    context.rotate(Math.PI / 2)

    context.drawImage(img, 0, -canvas.width, canvas.height, canvas.width)

    const newImg = new Image()

    return new Promise(resolve => {
        newImg.onload = () => resolve(newImg)
        newImg.name = img.name
        newImg.src = canvas.toDataURL()
    })
}

terminal.addCommand("img2pdf", async function(args) {
    if (!document.getElementById("img2pdfScript")) {
        await new Promise(resolve => {
            const script = document.createElement("script")
            script.addEventListener("load", resolve)
            script.src = img2pdfUrl
            script.id = "img2pdfScript"
            document.body.appendChild(script)
        })
    }

    await terminal.modules.load("upload", terminal)
    const images = await terminal.modules.upload.image({multiple: true})

    const doc = new jsPDF()
    const pdfWidth = doc.internal.pageSize.getWidth()
    const pdfHeight = doc.internal.pageSize.getHeight()
    const pdfPadding = args.padding
    
    for (let i = 0; i < images.length; i++) {
        let img = images[i]
        const format = img.src.split("image/")[1].split(";")[0]
        let imgAspectRatio = img.naturalWidth / img.naturalHeight

        if (args.rotate && imgAspectRatio > 1) {
            img = await rotateImg90(img)
            imgAspectRatio = img.naturalWidth / img.naturalHeight
        }

        let imgWidth = pdfWidth - pdfPadding * 2
        let imgHeight = imgWidth / imgAspectRatio

        if (imgHeight > pdfHeight - pdfPadding * 2) {
            imgHeight = pdfHeight - pdfPadding * 2
            imgWidth = imgHeight * imgAspectRatio
        }

        let xOffset = pdfWidth / 2 - imgWidth / 2
        let yOffset = pdfHeight / 2 - imgHeight / 2

        try {
            doc.addImage(img.src, format, xOffset, yOffset, imgWidth, imgHeight)
        } catch (e) {
            if (e.message.includes("Supplied Data is not a valid base64-String")) {
                throw new Error(`${img.name} isn't an image!`)
            } else {
                throw e
            }
        }

        if (i != images.length - 1) {
            doc.addPage()
        }

        if (images.length > 1) {
            terminal.printLine(`Loaded ${img.name} (${i+1}/${images.length})`)
            terminal.scroll()
            await sleep(50)

            if (i == images.length - 1) {
                terminal.addLineBreak()
            }
        }
    }

    const validFilenameRegex = /^[a-zA-Z0-9\.\_\s\-]+$/
    let fileName = args.filename

    while (!fileName) {
        fileName = await terminal.prompt("filename: ")
        if (!validFilenameRegex.test(fileName)) {
            terminal.printError("Invalid Filename. Must not include special characters!")
            fileName = null
        }
    }

    if (!fileName.endsWith(".pdf")) {
        fileName += ".pdf"
    }

    doc.save(fileName)
    terminal.printSuccess(`Downloaded ${fileName}`)
}, {
    description: "convert image files to pdf",
    args: {
        "?f=filename:s": "filename for the pdf",
        "?p=padding:i:0~50": "padding of pdf (in px)",
        "?r=rotate:b": "rotate the images to maximise space",
    },
    defaultValues: {
        filename: null,
        padding: 5,
    }
})