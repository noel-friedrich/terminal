import os, json, re
files = os.listdir("./js/commands")

forbidden_words = ["terminal.printf"]

replace_words = {
    r'terminal.modules.load\((".*")\)': "terminal.modules.load(\\1, terminal)"
}

found_baddie = False

for file in sorted(files):
    if not file.endswith(".js"):
        continue
    with open("./js/commands/" + file, "r", encoding="utf-8") as command_file:
        content = command_file.read()
        new_content = None
        if any([word in content for word in forbidden_words]):
            print(f"{file} contains a bad word!")
            found_baddie = True
        for match, replacement in replace_words.items():
            if re.search(match, content):
                new_content = re.sub(match, replacement, content)
                print(f"replaced {match} at {file}")
        if new_content:
            with open("./js/commands/" + file, "w") as new_file:
                new_file.write(new_content)

if not found_baddie:
    print("Haven't spotted any baddies. Your Loss!")
