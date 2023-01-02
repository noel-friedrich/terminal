from update_command_list import commands
commands = dict(sorted(commands.items()))

def generate_commands_list():
    output_str = ""
    for command, command_data in commands.items():
        output_str += f"| `{command}` | {command_data['description']} |\n"
    return output_str[:-1]

replacements = {
    "COMMANDS_TABLE_DATA": generate_commands_list(),
    "TOTAL_NUMBER_COMMANDS": len(commands)
}

readme_text = ""
with open("scripts/templates/README_TEMPLATE.md", "r") as file:
    readme_text = file.read()

for key, value in replacements.items():
    readme_text = readme_text.replace(f"<{key}>", str(value))

with open("README.md", "w") as file:
    file.write(readme_text)

print("Successfully updated README.md file")