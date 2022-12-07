terminal.addCommand("cheese", async function(args) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        throw new Error("Device does not support MediaDevices API")

    let stream = await navigator.mediaDevices.getUserMedia({video: true})
    let canvas = document.createElement("canvas")

    let context = canvas.getContext("2d")
    let video = document.createElement("video")
    video.srcObject = stream
    video.play()

    terminal.parentNode.appendChild(canvas)
    canvas.style.display = "none"

    await sleep(1000)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (Math.max(canvas.width, canvas.height) == 0) {
        throw new Error("Invalid image source")
    }

    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    stream.getTracks().forEach(track => track.stop())

    let imgSource = canvas.toDataURL("image/png")

    terminal.printImg(imgSource, "cheese")
    terminal.addLineBreak()

}, {
    description: "take a foto with your webcam",
})

