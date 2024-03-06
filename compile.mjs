import { compilePack } from "@foundryvtt/foundryvtt-cli";
import moduleJson from "./module.json" assert { type: "json" };

for (const pack of moduleJson.packs.map(pack => pack.name)) {
	await compilePack(`src/packs/${pack}`, `out/packs/${pack}`);
}
