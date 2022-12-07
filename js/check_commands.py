import os, json, re
files = os.listdir("./js/commands")

forbidden_words = ["terminal.printf"]
found_baddie = False

for file in files:
    if not file.endswith(".js"):
        continue
    with open("./js/commands/" + file, "r") as command_file:
        content = command_file.read()
        if any([word in content for word in forbidden_words]):
            print(f"{file} contains a bad word!")
            found_baddie = True

if not found_baddie:
    print("Haven't spotted any baddies. Your Loss!")
