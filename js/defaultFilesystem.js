const about_txt_content = `<noel-friedrich>

    \\O_   This is me, Noel Friedrich.
 ,/\\/     I am a student still learning.
   /      I also really love rainy weather.
   \\      And command line interfaces.
   \`      (because i like to feel cool)

</noel-friedrich>`

const projects_readme_content = `Welcome to my projects Page!

In this folder, there are some projects of mine. Most of
them are websites. You can open a project using the 'run'
command or by simply executing the .url file inside the 
projects directory: './<project_name>.url'

I also have a Github. You can open it by executing the
'github.url' file inside this directory.
`

const perilious_path_txt = `Perilious Path is a simple html game.
You are shown a grid of bombs for 3 seconds,
then you must find a path between two points,
without hitting a bomb.

The game trains your memory skills and is also
available to play on mobile devices!`

const teleasy_txt = `Creating Telegram Bots Made Simple with Teleasy!
It's a python library that makes it easy to create
Telegram bots. It enables asynchronous handling of
updates and provides a simple interface to create
commands and queries.`

const anticookiebox_txt = `This browser extension will delete an 'accept cookie'
section of a page, by simply removing it from your screen
This plugin behaves similar to an ad blocker, but for 'Accept Cookies' Boxes. The plugin will
automatically scan the pages you load and remove the boxes, without accepting any Cookie use!

How does it work?
Behind the scenes, Lucy is your internet-immune system. She's a detective and
just really good at finding 'Accept Cookies' popups. She loves eating them :)

Just keep surfing the web as usual, but without wasting precious time clicking away
useless cookie boxes and giving random web-services access to your personal data.

Get Lucy to be part of your next Web-Journey by installing AntiCookieBox!`

const coville_txt = `Coville is a City-Simulator that allows you to simulate
a virtual city (coville) and a virtual virus (covid).

It's also my submission to the german 'Jugend Forscht' competetion.

(the website is in german)`

const compli_txt = `Compli, An Android to remind people to give compliments.

The App contains a timer telling you how long it's been since you've given
someone a compliment. If you give a compliment to someone, you can reset this
timer. Once this timer reaches a configurable threshold, you get a reminding
notification to compliment someone.

Download the App on the Google Play Store!`

const contact_txt = `E-Mail: noel.friedrich@outlook.de`

let passwords_json = `{
    "google.com": "FAKE_PASSWORD",
    "github.com": "FAKE_PASSWORD",
    "die-quote.de": "FAKE_PASSWORD",
    "instagram.com": "FAKE_PASSWORD",
    "facebook.com": "FAKE_PASSWORD",
    "steam": "FAKE_PASSWORD"
}`

while (passwords_json.match(/FAKE_PASSWORD/)) {
    passwords_json = passwords_json.replace(/FAKE_PASSWORD/, function() {
        let chars = "zyxwvutsrqponmlkjihgfedcbaABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?@+-#"
        let tempPw = ""
        let len = Math.random() * 8 + 8
        for (let i = 0; i < len; i++) {
            tempPw += chars[Math.floor(Math.random() * chars.length)]
        }
        return tempPw
    }())
}

const MELODIES_FOLDER = new Directory({}, {"<": "cd ..", "melody": "melody"})

const melodies_readme_txt = `Welcome to the Melodies Folder!
In this folder are some .melody files, which contain basic melodys.
- to list all melody files, use 'ls'
- to play a file, use 'play <filename>'
- to make your own melody, use 'melody'
- to download a melody as a .mp3, use 'exportmelody <filename>'`

MELODIES_FOLDER.content["README.txt"] = new TextFile(melodies_readme_txt)

terminal.fileSystem.root = new Directory({
    "about.txt": new TextFile(about_txt_content),
    "projects": new Directory({
        "README.txt": new TextFile(projects_readme_content),
        "github.url": new ExecutableFile("https://github.com/noel-friedrich/"),
        "perilious-path": new Directory({
            "about.txt": new TextFile(perilious_path_txt),
            "perilious-path.url": new ExecutableFile("https://noel-friedrich.de/perilious-path")
        }, {"<": "cd ..", "open": "run perilious-path.url"}),
        "anticookiebox": new Directory({
            "about.txt": new TextFile(anticookiebox_txt),
            "anticookiebox-github.url": new ExecutableFile("https://github.com/noel-friedrich/AntiCookieBox"),
            "anticookiebox.url": new ExecutableFile("https://noel-friedrich.de/anticookiebox")
        }, {"<": "cd ..", "install": "run anticookiebox.url", "github": "run anticookiebox-github.url"}),
        "coville": new Directory({
            "about.txt": new TextFile(coville_txt),
            "coville-github.url": new ExecutableFile("https://github.com/noel-friedrich/coville"),
            "coville.url": new ExecutableFile("https://noel-friedrich.de/coville")
        }, {"<": "cd ..", "open": "run coville.url", "github": "run coville-github.url"}),
        "teleasy": new Directory({
            "about.txt": new TextFile(teleasy_txt),
            "teleasy-github.url": new ExecutableFile("https://github.com/noel-friedrich/teleasy")
        }, {"<": "cd ..", "github": "run teleasy-github.url"}),
        "compli": new Directory({
            "about.txt": new TextFile(compli_txt),
            "compli.url": new ExecutableFile("https://github.com/noel-friedrich/compli")
        }, {"<": "cd ..", "open": "run compli.url"}),
    }, {
        "<": "cd ..",
        "ppath": ["cd perilious-path", "cat about.txt"],
        "coville": ["cd coville", "cat about.txt"],
        "acb": ["cd anticookiebox", "cat about.txt"],
        "teleasy": ["cd teleasy", "cat about.txt"],
        "compli": ["cd compli", "cat about.txt"]
    }),
    "noel": new Directory({
        "secret": new Directory({
            "passwords.json": new TextFile(passwords_json)
        }, {"<": "cd ..", "passwords": "cat passwords.json"}),
        "email.txt": new TextFile(contact_txt),
        "melodies": MELODIES_FOLDER
    }, {"<": "cd ..", "secret": "cd secret/", "contact": "cat contact.txt", "melodies": ["cd melodies/", "cat README.txt"]}),
    "github.url": new ExecutableFile("https://github.com/noel-friedrich/"),
    "blog.url": new ExecutableFile("https://noel-friedrich.de/blobber")
}, {"projects": ["cd projects/", "cat README.txt"], "about me": "cat about.txt", "help": "help", "my blog": "run blog.url"})