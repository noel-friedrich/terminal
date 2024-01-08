terminal.addCommand("say", async function({ text, pitch, language }) {
    return new Promise(async resolve => {
        if (window.speechSynthesis) {
    
            const message = new SpeechSynthesisUtterance();
    
            message.text = text;
            message.pitch = pitch;
            message.lang = language;

            let running = true;
            message.onend = () => {
                resolve();
                running = false;
            }

            terminal.onInterrupt(speechSynthesis.cancel.bind(speechSynthesis));
            
            window.speechSynthesis.speak(message);

            while (running) {
                await sleep(1000);
            }
    
        } else {
            terminal.printError("Sorry, your browser doesn't support text to speech!");
        }
    });
}, {
    author: "Colin Chadwick",
    description: "Say something",
    args: {
        "*text:s": "The text to say",
        "?pitch:n:0~2": "The pitch of the voice",
        "?language:s": "The language of the voice"
    },
    defaultValues: {
        pitch: 1,
        language: "en-US"
    }
})