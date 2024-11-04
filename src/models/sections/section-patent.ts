import { patentParser } from "../../parsers/patent-parser";
import { Section } from "./section";
import fs from "fs";
import path from "path";
import { PatentDispatch, PatentJournal } from "../../types/patent-journal";
import { ExploredProcess } from "../../types/patent-process";

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

    sortIntoICTDirs(journal: PatentJournal, path: string): void {
        const siglasICTs = ['cefetmg', 'ifgoiano', 'ifmg', 'ifnmg', 'ifsemg', 'utfpr'];
        for(let sigla in siglasICTs) {
            const pathIctJournal = [path.slice(0, 4), ("/" + siglasICTs[sigla]), path.slice(4)].join("");
            let ictJournal: PatentJournal = JSON.parse(JSON.stringify(journal));
            ictJournal.revista.despachos = [];
            fs.writeFileSync(pathIctJournal, JSON.stringify(ictJournal), 'utf-8');
        }
    
        journal.revista.despachos.forEach((despacho: PatentDispatch) => {
            //adiciona os despachos
            const siglasICTDespacho: string[] = despacho.processoPatente.siglasTitulares;
            for(let sigla in siglasICTDespacho) {
                const pathIctJournal = [path.slice(0, 4), ("/" + siglasICTDespacho[sigla]), path.slice(4)].join("");
                let ictJournal: PatentJournal = JSON.parse(fs.readFileSync(pathIctJournal, "utf-8"));
                //console.log(ictJournal);
                ictJournal.revista.despachos.push(despacho);
                fs.writeFileSync(pathIctJournal, JSON.stringify(ictJournal), 'utf-8');
            }
        });
    }


}