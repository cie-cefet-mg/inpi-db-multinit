import { softwareParser } from "../../parsers/software-parser";
import { Section } from "./section";
import path from "path";
import fs from "fs";
import { SoftwareDispatch, SoftwareJournal } from "../../types/software-journal";
import { ExploredProcess } from "../../types/patent-process";
import { isNonEmptyArray } from "../../parsers/utils-parser";

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
            let processNumber = dispatch.processoPrograma.numero;
            
            if (String(processNumber).length == 24) {
                processNumber = String(processNumber).split(" ")[0];
            }

            const processFilePath = path.join(this.processesDirectoryPath, `${processNumber}.json`);

            let processJson: Partial<ExploredProcess> = {};
            if (fs.existsSync(processFilePath)) {
                processJson = JSON.parse(fs.readFileSync(processFilePath, "utf-8"));
            }
                                                     //mudei
            processJson = Object.assign(processJson, dispatch.processoPrograma);

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

    sortIntoICTDirs(journal: SoftwareJournal, path: string): void {
        const siglasICTs = ['cefetmg', 'ifgoiano', 'ifmg', 'ifnmg', 'ifsemg', 'utfpr'];
        for(let sigla in siglasICTs) {
            const pathIctJournal = [path.slice(0, 4), ("/" + siglasICTs[sigla]), path.slice(4)].join("");
            let ictJournal: SoftwareJournal = JSON.parse(JSON.stringify(journal));
            ictJournal.revista.despachos = [];
            fs.writeFileSync(pathIctJournal, JSON.stringify(ictJournal), 'utf-8');
        }

        journal.revista.despachos.forEach((despacho: SoftwareDispatch) => {
            //adiciona os despachos
            const siglasICTDespacho: string[] = despacho.processoPrograma.siglasTitulares;
            for(let sigla in siglasICTDespacho) {
                const pathIctJournal = [path.slice(0, 4), ("/" + siglasICTDespacho[sigla]), path.slice(4)].join("");
                let ictJournal: SoftwareJournal = JSON.parse(fs.readFileSync(pathIctJournal, "utf-8"));
                ictJournal.revista.despachos.push(despacho);
                fs.writeFileSync(pathIctJournal, JSON.stringify(ictJournal), 'utf-8');
            }
        });
    }


}