# Frank

A very simple app to run console commands.

## Install

1. Create a `frank.json` file:

-   Somewhere in your filesystem.
    -   Then, store its absolute path in the `FRANK_FILE` environment variable.
-   In the folder where you're going to use `frank`.

2. Run the following command:

```
deno install -A -f --name frank run.ts
```

## How to use

1. Define the commands you want to execute. Each command is defined by:
    - `cmd` The command itself.
    - `name` A friendly name. Optional.
    - `dir` The directory where to execute the command. Optional.
2. Define the extra directories where you can execute the previous commands. Each directory is defined by:
    - `dir` The directory itself. An absolute path.
    - `name` A friendly name. Optional.
3. Install and execute `frank`.
4. The `Commands` section is focused by default, you can navigate it with the arrow keys. To swith to the `Directories` section press `tab`.
5. Run a command pressing the `space` or `return` keys. The selected command will be executed with the selected directory.
    - If `none` is the directory selected, then the command will be executed in the configured directory, or in the current working directory if not configured in the command.
    - If any other directory is selected, then that directory will be used to execute the command.
