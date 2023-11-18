import { Section } from "./section";
import { brandParser } from "../../parsers/brand-parser";
import path from "path";
import fs from "fs";
import { BrandDispatch, BrandJournal, BrandProcess } from "../../types/brand-journal";
import { ExploredProcess } from "../../types/patent-process";
import { isICT } from "./section";

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
        json.revista.despachos.forEach((dispatch: BrandDispatch) => {
            if(!isICT(dispatch.processoMarca)) {
                return;
            }
            
            
            const processNumber = dispatch.processoMarca.numero;
            const processFilePath = path.join(this.processesDirectoryPath, `${processNumber}.json`);

            let processJson: Partial<ExploredProcess> = {};
            if(fs.existsSync(processFilePath)) {
                processJson = JSON.parse(fs.readFileSync(processFilePath, "utf-8"));
            }

            processJson = Object.assign(processJson, dispatch.processoMarca);

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