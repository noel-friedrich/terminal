async function loadImage(url) {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject    
        img.src = url
    })
}

// stolen from https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

class ChatMessage {

    constructor(text, side, hasTick) {
        this.text = text
        this.side = side
        this.hasTick = hasTick
    }

}

class Chat {

    static whatsappLowerUrl = "https://noel-friedrich.de/terminal/res/img/fakechat/whatsapp-lower.png"
    static whatsappUpperUrl = "https://noel-friedrich.de/terminal/res/img/fakechat/whatsapp-upper.png"

    constructor() {
        this.messages = []
        this.chatName = "My Friend"
        this.chatImage = "https://imgur.com/D1DjO7T.png"
        this.backgroundColor = Color.hex("#000000")
        this.backgroundImage = "https://noel-friedrich.de/terminal/res/img/fakechat/default-background.png"
        this.resolution = [720, 1560]
        // set this.time to time now in 12:00 format
        this.time = new Date().toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", hour12: false})
        this.bubbleOffset = 0
        this.textSizeFactor = 1
    }

    addMessage(text, side) {
        let lastMessage = this.messages[this.messages.length - 1]
        let hasTick = lastMessage == null || lastMessage.side != side
        this.messages.push(new ChatMessage(text, side, hasTick))
    }

    get resolutionWidth() {
        return this.resolution[0]
    }

    get resolutionHeight() {
        return this.resolution[1]
    }

    async exportToCanvas() {
        let lowerImg = await loadImage(Chat.whatsappLowerUrl)
        let upperImg = await loadImage(Chat.whatsappUpperUrl)

        let canvas = document.createElement("canvas")
        canvas.width = this.resolutionWidth
        canvas.height = this.resolutionHeight
        let context = canvas.getContext("2d")
        context.fillStyle = this.backgroundColor.toString()
        context.fillRect(0, 0, canvas.width, canvas.height)

        let helvetica = new FontFace("Helvetica", "url(res/fonts/Helvetica.ttf)")
        await helvetica.load()
        document.fonts.add(helvetica)

        let helveticaBold = new FontFace("HelveticaBold", "url(res/fonts/Helvetica-Bold.ttf)", {
            weight: "bold"
        })
        await helveticaBold.load()
        document.fonts.add(helveticaBold)

        let bubbleTextSize = canvas.height * 0.022 * this.textSizeFactor
        let bubbleRadius = bubbleTextSize * 0.8
        let bubblePadding = bubbleTextSize * 0.5
        let sidePadding = canvas.width * 0.05
        
        function drawBubbleBox(x, y, width, height, withTick=false, tickLeft=true, color=Color.WHITE) {
            context.fillStyle = color.toString()
            context.beginPath()
            context.moveTo(x + bubbleRadius, y)
            context.lineTo(x + width - bubbleRadius, y)
            context.quadraticCurveTo(x + width, y, x + width, y + bubbleRadius)
            context.lineTo(x + width, y + height - bubbleRadius)
            context.quadraticCurveTo(x + width, y + height, x + width - bubbleRadius, y + height)
            context.lineTo(x + bubbleRadius, y + height)
            context.quadraticCurveTo(x, y + height, x, y + height - bubbleRadius)
            context.lineTo(x, y + bubbleRadius)
            context.quadraticCurveTo(x, y, x + bubbleRadius, y)
            context.fill()
            if (withTick && tickLeft) {
                let tickRadius = bubbleRadius * 0.5
                const SINCOS = Math.sin(Math.PI / 4)
                context.beginPath()
                context.moveTo(x - bubbleRadius + tickRadius, y)
                context.lineTo(x + bubbleRadius, y)
                context.lineTo(x + bubbleRadius, y + bubbleRadius * 2)
                context.lineTo(x - bubbleRadius + tickRadius * SINCOS, y + tickRadius * SINCOS)
                context.quadraticCurveTo(x - bubbleRadius, y, x - bubbleRadius + tickRadius, y)
                context.fill()
            } else if (withTick && !tickLeft) {
                let tickRadius = bubbleRadius * 0.5
                const SINCOS = Math.sin(Math.PI / 4)
                context.beginPath()
                context.moveTo(x + width + bubbleRadius - tickRadius, y)
                context.lineTo(x + width - bubbleRadius, y)
                context.lineTo(x + width - bubbleRadius, y + bubbleRadius * 2)
                context.lineTo(x + width + bubbleRadius - tickRadius * SINCOS, y + tickRadius * SINCOS)
                context.quadraticCurveTo(x + width + bubbleRadius, y, x + width + bubbleRadius - tickRadius, y)
                context.fill()
            }
        }

        let currBubbleY = 0

        function drawBubble(side, text, withTick=true) {
            if (withTick) currBubbleY += bubblePadding
            let isLeft = (side == "left")
            let color = isLeft ? Color.hex("#ffffff") : Color.hex("#e7ffdb")
            let x = isLeft ? sidePadding : canvas.width - sidePadding
            let textStartX = isLeft ? x + bubblePadding : x - bubblePadding
            let textStartY = currBubbleY + bubblePadding
            context.font = `${bubbleTextSize}px Helvetica`
            let lines = getLines(context, text, canvas.width * 0.7)
            let lineHeight = context.measureText("M").width * 1.2
            let textHeight = lines.length * lineHeight
            let maxTextWidth = Math.max(...lines.map(line => context.measureText(line).width))
            x -= isLeft ? 0 : maxTextWidth + 2 * bubblePadding
            drawBubbleBox(x, currBubbleY, maxTextWidth + 2 * bubblePadding, textHeight + 2 * bubblePadding, withTick, isLeft, color)
            for (let line of lines) {
                context.fillStyle = Color.hex("#131b20").toString()
                context.textAlign = (side == "left") ? "left" : "right"
                context.textBaseline = "top"
                context.fillText(line, textStartX, textStartY)
                textStartY += lineHeight
            }
            currBubbleY += textHeight + 2 * bubblePadding + 5
        }

        let upperImgHeight = (upperImg.height / upperImg.width) * this.resolutionWidth
        let lowerImgHeight = (lowerImg.height / lowerImg.width) * this.resolutionWidth

        function drawChatName(chatName) {
            context.font = `${canvas.width * 0.045}px HelveticaBold`
            context.fillStyle = "white"
            context.textAlign = "left"
            context.textBaseline = "middle"
            context.fillText(chatName, canvas.width * 0.2, upperImgHeight * 0.7)
        }

        function drawTime(timeString) {
            context.font = `${canvas.width * 0.04}px Helvetica`
            context.fillStyle = "#a5e8dd"
            context.textAlign = "left"
            context.textBaseline = "middle"
            context.fillText(timeString, canvas.width * 0.063, upperImgHeight * 0.18)
        }

        async function drawChatImage(chatImageSrc) {
            let chatImg = await loadImage(chatImageSrc)
            context.beginPath()
            context.arc(canvas.width * 0.1285, canvas.width * 0.159, canvas.width * 0.05, 0, 2 * Math.PI)
            context.clip()
            context.drawImage(chatImg, canvas.width * 0.0785, canvas.width * 0.109, canvas.width * 0.1, canvas.width * 0.1)
        }

        currBubbleY = upperImgHeight

        if (this.bubbleOffset) {
            currBubbleY += this.bubbleOffset * canvas.height
        }

        if (this.backgroundImage) {
            let backgroundImg = await loadImage(this.backgroundImage)
            let imageWidth = (backgroundImg.width / backgroundImg.height) * canvas.height
            context.drawImage(backgroundImg, 0, 0, imageWidth, canvas.height)
        }

        for (let bubble of this.messages) {
            drawBubble(bubble.side, bubble.text, bubble.withTick)
        }

        context.drawImage(upperImg, 0, 0, canvas.width, upperImgHeight)
        context.drawImage(lowerImg, 0, canvas.height - lowerImgHeight - 20, canvas.width, lowerImgHeight)

        if (this.chatName) {
            drawChatName(this.chatName)
        }

        if (this.time) {
            drawTime(this.time)
        }

        if (this.chatImage) {
            await drawChatImage(this.chatImage)
        }
        
        return canvas
    }
}

terminal.addCommand("fakechat", async function(args) {
    let animationInterval = args.f ? 0 : 15

    const printLn = async msg => await terminal.animatePrint(msg, animationInterval)
    const promptLn = async (msg, regex, defaultValue=null) => {
        if (defaultValue) {
            msg += ` (default: ${defaultValue}): `
        } else {
            msg += ": "
        }

        while (true) {
            let result = await terminal.prompt(msg)
            if (result == "" && defaultValue) {
                return defaultValue
            } else if (regex.test(result)) {
                return result
            } else {
                await printLn("Invalid input. Please try again.")
            }
        }
    }

    let chat = new Chat()

    chat.textSizeFactor = args.s
    chat.bubbleOffset = args.o
    chat.resolution[0] = args.x
    chat.resolution[1] = args.y

    await printLn("Welcome to the fake chat generator!", animationInterval)
    await printLn("Together we will create a fake chat conversation.")
    terminal.addLineBreak()
    await printLn("First, we need to know the name of the chat.")
    await printLn("This could be 'Tom' or 'Mamamia'.")
    chat.chatName = await promptLn("Chat Name", /.+/)

    terminal.addLineBreak()
    await printLn("Great! Now let's add some messages.")
    await printLn("You can add as many messages as you want.")
    await printLn("- To add a message, type the message and press enter.")
    await printLn("- To finish adding messages, type 'done' or 'd'.")
    await printLn("- To switch sides, type 'switch' or 's'.")
    await printLn("- to undo the last message, type 'undo' or 'u'.")
    terminal.addLineBreak()
    let currSide = "right"
    const getName = side => side != "left" ? "You" : chat.chatName
    const changeSide = () => currSide = currSide == "left" ? "right" : "left"
    while (true) {
        let msg = await promptLn(getName(currSide), /.+/)
        if (msg == "done" || msg == "d") break
        if (msg == "switch" || msg == "s") {
            changeSide()
            continue
        }
        if (msg == "undo" || msg == "u") {
            if (chat.messages.pop()) {
                terminal.printSuccess("Removed last message.")
            } else {
                terminal.printError("No messages to remove.")
            }
            changeSide()
            continue
        }
        chat.addMessage(msg, currSide)
        changeSide()
    }

    terminal.addLineBreak()
    await printLn("Awesome! Now let's the current time.")
    await printLn("This could be '12:00' or '3:14'.")
    chat.time = await promptLn("Time", /[0-9]{1,2}\:[0-9]{1,2}/, chat.time)

    await terminal.modules.load("upload", terminal)

    terminal.addLineBreak()
    await printLn("Now let's add a profile picture.")
    await printLn("The profile picture will be displayed in the top left corner.")
    await printLn("You can either enter a URL or upload a file.")
    await printLn("To upload a file, type 'upload' or 'u'.")
    await printLn("Type 'default' to skip this step and use the default profile picture.")

    let defaultChatImage = chat.chatImage
    chat.chatImage = null
    while (chat.chatImage == null) {
        chat.chatImage = await promptLn("Profile Picture Url", /.+/)
        if (chat.chatImage == "default") {
            chat.chatImage = defaultChatImage
        } else if (chat.chatImage == "upload" || chat.chatImage == "u") {
            try {
                chat.chatImage = (await terminal.modules.upload.image()).src
            } catch (e) {
                chat.chatImage = null
            }
        } else {
            try {
                await loadImage(chat.chatImage)
            } catch (e) {
                terminal.printError("Invalid image URL.")
                chat.chatImage = null
            }
        }
    }

    terminal.addLineBreak()
    await printLn("Now let's add a background image.")
    await printLn("The background image will be displayed behind the chat.")
    await printLn("You can either enter a URL or upload a file.")
    await printLn("Type 'default' to skip this step and use the default background.")

    let defaultBackgroundImage = chat.backgroundImage
    chat.backgroundImage = null
    while (chat.backgroundImage == null) {
        chat.backgroundImage = await promptLn("Background Image Url", /.+/)
        if (chat.backgroundImage == "default") {
            chat.backgroundImage = defaultBackgroundImage
            break
        }
        if (chat.backgroundImage == "upload" || chat.backgroundImage == "u") {
            try {
                chat.backgroundImage = (await terminal.modules.upload.image()).src
            } catch (e) {
                chat.backgroundImage = null
            }
        } else {
            try {
                await loadImage(chat.backgroundImage)
            } catch (e) {
                terminal.printError("Invalid image URL.")
                chat.backgroundImage = null
            }
        }
    }

    terminal.addLineBreak()
    let canvas = await chat.exportToCanvas()
    terminal.parentNode.appendChild(canvas)
    canvas.classList.add("terminal-img")
    terminal._styleImgElement(canvas, true)
    terminal.addLineBreak()
}, {
    description: "fake a whatsapp chat conversation",
    args: {
        "?f=fast:b": "skip typing animations [fast mode]",
        "?o=offset:n:-100~100": "offset the chat by a procentage of the screen height",
        "?s=scale:n:0.1~5": "scale the chat by a factor",
        "?x=width:n:100~10000": "set the width of the screen in pixels",
        "?y=height:n:100~10000": "set the height of the screen in pixels",
    },
    standardVals: {
        o: 0,
        s: 1,
        x: 720,
        y: 1560,
    }
})