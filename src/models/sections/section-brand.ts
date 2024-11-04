import { Section } from "./section";
import { brandParser } from "../../parsers/brand-parser";
import path from "path";
import fs from "fs";
import { BrandDispatch, BrandJournal, BrandProcess } from "../../types/brand-journal";
import { ExploredProcess } from "../../types/patent-process";

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

    sortIntoICTDirs(journal: BrandJournal, path: string): void {
        const siglasICTs = ['cefetmg', 'ifgoiano', 'ifmg', 'ifnmg', 'ifsemg', 'utfpr'];
        for(let sigla in siglasICTs) {
            const pathIctJournal = [path.slice(0, 4), ("/" + siglasICTs[sigla]), path.slice(4)].join("");
            let ictJournal: BrandJournal = JSON.parse(JSON.stringify(journal));
            ictJournal.revista.despachos = [];
            fs.writeFileSync(pathIctJournal, JSON.stringify(ictJournal), 'utf-8');
        }
    
        journal.revista.despachos.forEach((despacho: BrandDispatch) => {
            //adiciona os despachos
            const siglasICTDespacho: string[] = despacho.processoMarca.siglasTitulares;
            for(let sigla in siglasICTDespacho) {
                const pathIctJournal = [path.slice(0, 4), ("/" + siglasICTDespacho[sigla]), path.slice(4)].join("");
                let ictJournal: BrandJournal = JSON.parse(fs.readFileSync(pathIctJournal, "utf-8"));
                ictJournal.revista.despachos.push(despacho);
                fs.writeFileSync(pathIctJournal, JSON.stringify(ictJournal), 'utf-8');
            }
        });
    }


}