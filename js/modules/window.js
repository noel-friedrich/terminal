terminal.modules.window = {

    make({backgroundColor="black", name="My new Window", iframeUrl=undefined}={}) {
        const windowContainer = terminal.document.createElement("div")
        windowContainer.classList.add("terminal-window")

        const header = terminal.document.createElement("div")
        header.classList.add("terminal-window-header")
        windowContainer.appendChild(header)

        const title = terminal.document.createElement("div")
        title.classList.add("terminal-window-title")
        title.textContent = name
        header.appendChild(title)

        const exitBtn = terminal.document.createElement("div")
        exitBtn.classList.add("terminal-window-exit")
        exitBtn.textContent = "✕"
        exitBtn.title = `Close ${name}`
        header.appendChild(exitBtn)

        exitBtn.addEventListener("click", function() {
            terminal.interrupt()
            windowContainer.remove()
            setTimeout(() => {
                if (terminal.currInputElement) {
                    terminal.currInputElement.focus()
                }
            }, 200)
        })

        const content = terminal.document.createElement("div")
        content.classList.add("terminal-window-content")
        windowContainer.appendChild(content)

        if (iframeUrl) {
            const iframe = terminal.document.createElement("iframe")
            iframe.src = iframeUrl
            content.appendChild(iframe)
            terminal.body.appendChild(windowContainer)
            return {
                iframe,
                windowContainer,
                close() {
                    windowContainer.remove()
                }
            }
        } else {
            const CANVAS = terminal.document.createElement("canvas")
            CANVAS.style.backgroundColor = backgroundColor
            content.appendChild(CANVAS)
            const CONTEXT = CANVAS.getContext("2d")

            terminal.body.appendChild(windowContainer)
            CANVAS.width = CANVAS.clientWidth
            CANVAS.height = CANVAS.clientHeight
        
            CONTEXT.font = "15px Courier New"
        
            terminal.window.addEventListener("resize", function() {
                CANVAS.width = CANVAS.clientWidth
                CANVAS.height = CANVAS.clientHeight
                CHARWIDTH = CONTEXT.measureText("A").width * 1.8
                CONTEXT.font = "15px Courier New"
            })
        
            return {
                CANVAS,
                CONTEXT,
                windowContainer,
                close() {
                    windowContainer.remove()
                    setTimeout(() => {
                        if (terminal.currInputElement) {
                            terminal.currInputElement.focus()
                        }
                    }, 200)
                }
            }
        }
    }
    
}