const formContainer = document.createElement("div")
const formWidth = "min(25em, 50vw)"

let formInfo = {}

function addInput({
    type="text",
    name=null,
    errorFunc=null,
    placeholder=null,
}={}) {
    const input = document.createElement("input")
    input.setAttribute("type", type)
    if (placeholder) input.setAttribute("placeholder", placeholder)

    if (name) {
        input.setAttribute("name", name)
        formInfo[name] = {
            errorFunc,
            input,
        }
        input.addEventListener("input", validateForm)
    }

    formContainer.appendChild(input)
    input.style.display = "block"
    input.style.margin = "10px"
    input.style.padding = "10px"
    input.style.border = "1px solid var(--foreground)"
    input.style.borderRadius = "5px"
    input.style.width = formWidth

    return input
}

const nameInput = addInput({
    name: "name",
    placeholder: "Name *",
    errorFunc: (value) => {
        if (!value) return "Please enter a name"
        if (value.length > 100) return "Name is too long"
        return ""
    }
})

const emailInput = addInput({
    type: "email",
    name: "email",
    placeholder: "Email *",
    errorFunc: (value) => {
        if (!value) return "Please enter an email"
        if (value.length > 100) return "Email is too long"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Invalid email format"
        return ""
    }
})

const phoneInput = addInput({
    type: "tel",
    name: "phone",
    placeholder: "Phone",
    errorFunc: (value) => {
        if (!value) return ""
        if (value.length > 100) return "Phone is too long"
        const phoneRegex = /^\+?[0-9\s]+$/
        if (!phoneRegex.test(value)) return "Invalid phone format"
        return ""
    }
})

const messageTextarea = document.createElement("textarea")
messageTextarea.setAttribute("name", "message")
messageTextarea.setAttribute("placeholder", "Message *")
formContainer.appendChild(messageTextarea)

messageTextarea.style.display = "block"
messageTextarea.style.margin = "10px"
messageTextarea.style.padding = "10px"
messageTextarea.style.border = "1px solid var(--foreground)"
messageTextarea.style.borderRadius = "5px"
messageTextarea.style.width = formWidth
messageTextarea.style.height = "10em"
messageTextarea.style.resize = "vertical"
messageTextarea.style.backgroundColor = "var(--background)"
messageTextarea.style.color = "var(--foreground)"

formInfo["message"] = {
    errorFunc: (value) => {
        if (!value) return "Please enter a message"
        if (value.length > 1000) return "Message max length is 1000 characters"
        return ""
    },
    input: messageTextarea
}

messageTextarea.addEventListener("input", validateForm)

const errorOutput = document.createElement("div")
errorOutput.style.color = "#ff5555"
errorOutput.style.margin = "10px"
formContainer.appendChild(errorOutput)

const submitButton = document.createElement("div")
submitButton.textContent = "Send Message"
formContainer.appendChild(submitButton)

submitButton.style.display = "block"
submitButton.style.textAlign = "center"
submitButton.style.margin = "10px"
submitButton.style.padding = "10px"
submitButton.style.border = "1px solid var(--foreground)"
submitButton.style.borderRadius = "5px"
submitButton.style.width = formWidth
submitButton.style.backgroundColor = "var(--background)"
submitButton.style.color = "var(--foreground)"
submitButton.style.cursor = "pointer"

submitButton.addEventListener("mouseenter", () => {
    submitButton.style.backgroundColor = "var(--foreground)"
    submitButton.style.color = "var(--background)"
})

submitButton.addEventListener("mouseleave", () => {
    submitButton.style.backgroundColor = "var(--background)"
    submitButton.style.color = "var(--foreground)"
})

function validateForm() {
    for (let [name, info] of Object.entries(formInfo)) {
        const { errorFunc, input } = info
        if (errorFunc) {
            const error = errorFunc(input.value)
            errorOutput.textContent = error
            if (error) {
                return false
            }
        }
    }
    return true
}

validateForm()

submitButton.addEventListener("click", async () => {
    if (!validateForm()) {
        errorOutput.animate([
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(0px)" },
        ], {
            duration: 500,
            iterations: 1,
        })
        return
    }

    let submitUrl = "./api/contact.php"
    let formData = new FormData()
    for (let [name, info] of Object.entries(formInfo)) {
        formData.append(name, info.input.value)
    }
    const response = await fetch(submitUrl, {
        method: "POST",
        body: formData,
    })
    const data = await response.json()
    if (data.ok) {
        formSuccessful = true
    } else {
        errorOutput.textContent = data.error
    }
})

let formSuccessful = false

terminal.addCommand("contact", async function(args) {
    formSuccessful = false
    terminal.parentNode.appendChild(formContainer)

    terminal.scroll()

    setTimeout(() => nameInput.focus(), 300)
    
    while (!formSuccessful) await sleep(1000)

    terminal.printSuccess("Message sent!")
    terminal.printLine("I'll get back to you as soon as possible.")
    formContainer.remove()

    for (let [name, info] of Object.entries(formInfo)) {
        info.input.value = ""
    }
}, {
    description: "Open contact form",
})