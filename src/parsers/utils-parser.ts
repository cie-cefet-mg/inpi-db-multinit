import { match } from "assert";
import { ICTConfig, ICTNamePattern } from "../types/ict-config";
import fs from "fs";

export function getFirstElement(object: any) {
    if (isNonEmptyArray(object) && object[0]) {
        return object[0];
    }

    return undefined;
}

export function isNonEmptyArray(object: any): boolean {
    return !!(object && Array.isArray(object) && object.length > 0);
}

export function isICT(process: any): boolean {
    let match = false;
    const ictConfigPath = "ictconfig.json";
    let ictConfig: ICTConfig;
    if(fs.existsSync(ictConfigPath)) {
        ictConfig = JSON.parse(fs.readFileSync(ictConfigPath, "utf-8"));

        ictConfig.namesPatterns.forEach((ictPattern: ICTNamePattern) => {
            if(ictPattern.beginning.length == 0 && ictPattern.ending.length == 0) {
                match = true;
                return;
            }

            const patern = `^(${ictPattern.beginning}){1}[\\w\\s\\W]*(${ictPattern.ending})$`;
            const regex = RegExp(patern, 'i');
            
            process.titulares?.forEach((holder: any) => {
                if(typeof holder === "string") {
                    let holderWithoutAccents = holder.normalize('NFD').replace(/[\u0300-\u0303\u0327]/g, "");
                    match = regex.test(holderWithoutAccents) ? true : match;
                } else {
                    let holderWithoutAccents = (holder.nomeCompleto).normalize('NFD').replace(/[\u0300-\u0303\u0327]/g, "");
                    match = regex.test(holderWithoutAccents) ? true : match;
                }   
            });
        });
    } else {
        match = true;
    }
    return match;
}


export function siglaICT(process: any): string[] {
    const ictSiglaPath = "ictsiglas.json";
    let siglas : string[] = [];

    if(fs.existsSync(ictSiglaPath)){
        const ictSigla = JSON.parse(fs.readFileSync(ictSiglaPath, "utf-8"));

        ictSigla.padroes.forEach((ict: any) => {
            process.titulares?.forEach((holder: any) => {

                const patern = `^(${ict.beginning}){1}[\\w\\s\\W]*(${ict.ending})$`;
                const regex = RegExp(patern, 'i');

                let titularSemAcento;
                if(typeof holder === "string") titularSemAcento = holder.normalize('NFD').replace(/[\u0300-\u0303\u0327]/g, "");
                else titularSemAcento = (holder.nomeCompleto).normalize('NFD').replace(/[\u0300-\u0303\u0327]/g, "");

                if(regex.test(titularSemAcento)){
                    siglas.push(ict.sigla);
                } 
            });
        });
    }
    return siglas;
}


export function initializeSiglasArray(): string[] {
    const siglas: string[] = [];
    return siglas;
}