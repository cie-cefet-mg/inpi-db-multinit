import { patentParser } from "../../parsers/patent-parser";
import { Section } from "./section";
import fs from "fs";
import path from "path";
import { PatentJournal } from "../../types/patent-journal";
import { ExploredProcess } from "../../types/patent-process";
import { isCefetMG } from "./section";

export class SectionPatent extends Section {
    constructor() {
        super("P", "patente");
    }

    parse(value: { [key: string]: any }): { [key: string]: any } | null {
        return patentParser(value);
    }

    explore(jsonPath: string): void {
        const json = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as PatentJournal;
        console.log(json.revista.numero);
        json.revista.despachos.forEach((dispatch) => {
            if(!isCefetMG(dispatch.processoPatente)) {
                return;
            }

            // BR 10 2013 024870-3
            // BR 10 2012 000093-8
            // BR 10 2012 000747-9

            const processNumber = dispatch.processoPatente.numero;
            const processFilePath = path.join(this.processesDirectoryPath, `${processNumber}.json`);

            let processJson: Partial<ExploredProcess> = {};
            if (fs.existsSync(processFilePath)) {
                processJson = JSON.parse(fs.readFileSync(processFilePath, "utf-8"));
            }

            processJson = Object.assign(processJson, dispatch.processoPatente);

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
