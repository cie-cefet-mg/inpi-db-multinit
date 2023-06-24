import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { patentParser } from "./parsers/patent-parser";
import { journalsDirectoryPath } from "./paths";

(async () => {
    await unzipAll();
})();

async function unzipAll() {
    // Check zips that don't have a JSON file.
    const zips = fs
        .readdirSync(journalsDirectoryPath)
        .filter((file) => file.endsWith(".zip"))
        .map((zip) => path.join(journalsDirectoryPath, zip))
        .filter((zip) => {
            const jsonFile = zip.replace(".zip", ".json");
            return !fs.existsSync(jsonFile);
        });

    console.log(`-> unzip: ${zips.length} zip(s) to extract.\n`);

    for (const zip of zips) {
        await unzip(zip);
    }
}

async function unzip(zipPath: string) {
    const zipEntries = new AdmZip(zipPath).getEntries();
    const xmlEntry = zipEntries.find((entry) => entry.name.endsWith(".xml"));
    if (!xmlEntry) {
        console.warn(`${zipPath} does not have a XML file`);
        return;
    }

    const xml = xmlEntry?.getData().toString("utf-8");
    const json = await patentParser(xml);

    if (!json) {
        return;
    }

    const jsonPath = zipPath.replace(".zip", ".json");
    fs.writeFileSync(jsonPath, JSON.stringify(json));
}
