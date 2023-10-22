import { Section } from "./section";
import { brandParser } from "../../parsers/brand-parser";
import path from "path";
import fs from "fs";
import { BrandJournal, BrandProcess } from "../../types/brand-journal";

export class SectionBrand extends Section {
    constructor() {
        super("RM", "marca");
    }

    parse(value: { [key: string]: any }): { [key: string]: any } | null {
        return brandParser(value);
    }

    explore(jsonPath: string): void {
        const json = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as BrandJournal;
        console.log(json.revista.numero);
        json.revista.processos.forEach((process: BrandProcess) => {
            const processNumber = process.numero;
            const processFilePath = path.join(this.processesDirectoryPath, `${processNumber}.json`);

            let processJson: Partial<BrandProcess> = {};
            if(fs.existsSync(processFilePath)) {
                processJson = JSON.parse(fs.readFileSync(processFilePath, "utf-8"));
            }

            processJson = Object.assign(processJson, process);

            processJson.despachos?.forEach(dispatch => dispatch.rpi = json.revista.numero);

            if (!processJson.despachos) {
                processJson.despachos = [];
            }

            fs.writeFileSync(processFilePath, JSON.stringify(processJson), "utf-8");
        });

        fs.renameSync(jsonPath, jsonPath.replace(".new", ""));
    }
}
