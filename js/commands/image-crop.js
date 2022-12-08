terminal.addCommand("image-crop", async function() {
    await terminal.modules.load("window")
    let terminalWindow = terminal.modules.window.make({
        iframeUrl: "../image-crop/",
        name: "Image Cropper"
    })
    terminal.onInterrupt(() => {
        terminalWindow.close()
    })
}, {
    description: "start image cropper program"
})