#!/usr/bin/env python

import pathlib
import subprocess
import argparse

parser = argparse.ArgumentParser(prog="build.py", description="builds a container.")
parser.add_argument("--skip", action="store_true", help="skips container running.")

args = parser.parse_args()

print("=====> STEP 1: Generating database scripts")
db_init_file = pathlib.Path("./sql_init/03-db-init.sql")

sql_script = subprocess.run(
    ["pnpm", "exec", "drizzle-kit", "export"], capture_output=True, text=True
)
export_opt = "\n".join(sql_script.stdout.splitlines()[3:])
with open(db_init_file, "w") as f:
    f.write(export_opt)
print("Done.")

if not args.skip:
    print("=====> STEP 2: Starting container")
    podman_compose_up = subprocess.call(["podman", "compose", "up", "-d"])
    if podman_compose_up == 125:
        subprocess.call(["podman", "machine", "start"])
        subprocess.call(["podman", "compose", "up", "-d"])
    print("Done.")
    print("===== Container is now running!")
else:
    print("===== DB init file generated!")
