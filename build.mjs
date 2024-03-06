import archiver from "archiver";
import { createWriteStream } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import packageJson from "./package.json" assert { type: "json" };

await rm("./dist", { recursive: true, force: true });
await mkdir("./dist");
let moduleJson = JSON.parse((await readFile("./module.json", "utf-8")));
moduleJson.description = packageJson.description;
moduleJson.version = packageJson.version;
moduleJson.url = packageJson.repository.url;
moduleJson.manifest = `${packageJson.repository.url}/releases/latest/download/module.json`;
moduleJson.download = `${packageJson.repository.url}/releases/download/v${packageJson.version}/${packageJson.name}-v${packageJson.version}.zip`;
await writeFile(`./dist/module.json`, JSON.stringify(moduleJson, undefined, 2), "utf-8");

const output = createWriteStream(`./dist/${packageJson.name}-v${packageJson.version}.zip`);
const archive = archiver("zip");
archive.pipe(output);

archive.file("./LICENSE.md", { name: "LICENSE.md" });
archive.file("./README.md", { name: "README.md" });
archive.file(`./dist/module.json`, { name: "module.json" });
archive.directory("./src/static", false);
archive.directory("./out", false);

await archive.finalize();
