import { softwareParser } from "../../parsers/software-parser";
import { Section } from "./section";
import path from "path";
import fs from "fs";
import { SoftwareJournal } from "../../types/software-journal";
import { ExploredProcess } from "../../types/patent-process";
import { isICT } from "./section";

export class SectionSoftware extends Section {
    constructor() {
        super("PC", "programa-computador");
    }

    parse(value: { [key: string]: any }): { [key: string]: any } | null {
        return softwareParser(value);
    }

    explore(jsonPath: string): void {
        const json = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as SoftwareJournal;
        console.log(json.revista.numero);
        json.revista.despachos.forEach((dispatch: any) => {
            if(!isICT(dispatch.processoSoftware)) {
                return;
            }
            
            let processNumber = dispatch.processoSoftware.numero;
            
            if (String(processNumber).length == 24) {
                processNumber = String(processNumber).split(" ")[0];
            }

            const processFilePath = path.join(this.processesDirectoryPath, `${processNumber}.json`);

            let processJson: Partial<ExploredProcess> = {};
            if (fs.existsSync(processFilePath)) {
                processJson = JSON.parse(fs.readFileSync(processFilePath, "utf-8"));
            }

            processJson = Object.assign(processJson, dispatch.processoSoftware);

            if (!processJson.despachos) {
                processJson.despachos = [];
            }

            processJson.despachos = [
                ...processJson.despachos,
                { codigo: dispatch.codigo, titulo: dispatch.titulo, rpi: json.revista.numero },
            ];
            fs.writeFileSync(processFilePath, JSON.stringify(processJson), "utf-8");
        });

        fs.renameSync(jsonPath, jsonPath.replace(".new", ""));
    }
}