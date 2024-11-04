import { getFirstElement, initializeSiglasArray, isICT, siglaICT } from "./utils-parser";

export function brandParser(result: { [key: string]: any }): { [key: string]: any } {
    return {
        revista: {
            numero: getJournalNumber(result),
            dataPublicacao: getPublicationDate(result),
            diretoria: 'Marca',
            despachos: getDispaches(result),
        },
    };
}

// número da revista
function getJournalNumber(object: any) {
    if (object?.revista?.$?.numero) {
        return object?.revista?.$?.numero;
    }

    return undefined;
}

// data de publicação da revista
function getPublicationDate(object: any) {
    if (object?.revista?.$?.data) {
        return object?.revista?.$?.data;
    }

    return undefined;
}

// diretoria da revista
function getSection(object: any) {
    if (object?.revista?.$?.diretoria) {
        return object?.revista?.$?.diretoria;
    }

    return undefined;
}

function getDispaches(object: any) {
    let processes = object?.revista?.processo;
    
    if(isNonEmptyArray(processes)) {
        return processes.reduce((acc: any[], process: any) => {
            let dispatches = getFirstElement(process?.despachos)?.despacho;

            dispatches.forEach((dispatch: any)=> {
                if(!dispatch?.$?.codigo && !dispatch?.$?.nome) {
                    return acc;
                }

                const newDispatch = {
                    codigo: dispatch?.$?.codigo,
                    titulo: dispatch?.$?.nome,
                    comentario: getFirstElement(dispatch?.["texto-complementar"]),
                    processoMarca: getBrandProcess(process),
                }

                const siglas: string[] = siglaICT(newDispatch.processoMarca)
                if (isNonEmptyArray(siglas) && newDispatch.processoMarca){
                    newDispatch.processoMarca.siglasTitulares.push(...siglas);
                    acc.push(newDispatch);
                }
            });

            return acc
        }, []);

    }

    return undefined;
}

function getBrandProcess(process: any) {
    if(process != undefined) {
        return {
            numero: getBrandsProcessNumber(process),
            dataDeposito: getBrandsProcessDepositDate(process),
            dataConcessao: getBrandsProcessGrantDate(process),
            dataVigencia: getBrandsProcessValidityDate(process),
            titulo: getBrandsProcessBrandName(process),
            natureza: getBrandsProcessBrandNature(process),
            apresentacao: getBrandsProcessBrandPresentetion(process),
            classesNice: getBrandsProcessNiceClasses(process),
            classesVienna: getBrandsProcessViennaClasses(process),
            titulares: getBrandsProcessHolders(process),
            siglasTitulares: initializeSiglasArray(),
            procurador: getBrandsProcessAttorney(process),
        };
    }

    return undefined;
}

function getBrandsProcessNumber(brandProcess: any) {
    if(brandProcess?.$?.numero) {
        return brandProcess?.$?.numero;
    }

    return undefined;
}

function getBrandsProcessDepositDate(brandProcess: any) {
    if(brandProcess?.$?.["data-deposito"]) {
        return brandProcess?.$?.["data-deposito"];
    }

    return undefined;
}

function getBrandsProcessGrantDate(brandProcess: any) {
    if(brandProcess?.$?.["data-concessao"]) {
        return brandProcess?.$?.["data-concessao"];
    }

    return undefined;
}

function getBrandsProcessValidityDate(brandProcess: any) {
    if(brandProcess?.$?.["data-vigencia"]) {
        return brandProcess?.$?.["data-vigencia"];
    }

    return undefined;
}

// ? Não há data de publicação para marcas, certo?

function getBrandsProcessBrandName(brandProcess:any) {
    let name = getFirstElement(brandProcess?.marca);
    name = getFirstElement(name?.nome)
    
    if(name) {
        return name;
    }
    
    return undefined;
}

function getBrandsProcessBrandNature(brandProcess: any) {
    let nature = getFirstElement(brandProcess?.marca);
    nature = nature?.$?.natureza;

    if(nature) {
        return nature;
    }

    return undefined;
}

function getBrandsProcessBrandPresentetion(brandProcess: any) {
    let presentetion = getFirstElement(brandProcess?.marca);
    presentetion = presentetion?.$?.apresentacao;

    if(presentetion) {
        return presentetion;
    }

    return undefined;
}

function getBrandsProcessHolders(brandProcess: any) {
    const holdersList = brandProcess?.titulares
    
    if(isNonEmptyArray(holdersList)) {
        return holdersList.reduce((acc: any[], holder: any) => {
            holder = getFirstElement(holder?.titular);
            
            const fullName = holder?.$?.["nome-razao-social"];
            const country = holder?.$?.pais;
            const state = holder?.$?.uf;
            
            if(!fullName && !country && !state) {
                return acc;
            }

            acc.push({
                nomeCompleto: fullName,
                pais: country,
                uf: state,
            });

            return acc;
        }, []);
    }

    return undefined;
}

function getBrandsProcessDispaches(brandProcess: any) {
    const dispatches = getFirstElement(brandProcess?.despachos)
    
    
    if(isNonEmptyArray(dispatches?.despacho)) {
        return dispatches?.despacho.reduce((acc: any[], dispatch: any) => {
            const code = dispatch?.$?.codigo;
            const name = dispatch?.$?.nome;
            const description = getFirstElement(dispatch?.["texto-complementar"]);

            if(!code && !name) {
                return acc;
            }

            acc.push({
                codigo: dispatch?.$?.codigo,
                titulo: dispatch?.$?.nome,
                comentario: description,
            });

            return acc;
        }, []);
    }

    return undefined;
}

function getBrandsProcessAttorney(brandProcess: any) {
    if(brandProcess?.procurador) {
        return getFirstElement(brandProcess?.procurador);
    }

    return undefined;
}

function getBrandsProcessViennaClasses(brandProcess: any) {
    const viennaClasses = getFirstElement(brandProcess?.["classes-vienna"]);
    const mapViennaClasses = (viennaClass: any) => {
        return {
            codigo: viennaClass?.$?.codigo,
        }
    };

    if(viennaClasses?.["classe-vienna"] && Array.isArray(viennaClasses?.["classe-vienna"])) {
        return {
            edicao: viennaClasses?.$?.edicao,
            classes: viennaClasses?.["classe-vienna"].map(mapViennaClasses),
        };
    }

    return undefined;
}

function getBrandsProcessNiceClasses(brandProcess: any) {
    let niceClass = getFirstElement(brandProcess?.["lista-classe-nice"]);
    if(!niceClass) {
        niceClass = getFirstElement(brandProcess?.["classe-nice"]);
    }

    if(niceClass) {
        return {
            codigo: niceClass?.$?.codigo,
            status: niceClass?.status?._,
            especificacao: getFirstElement(niceClass?.especificacao),
        }
    }

    return undefined;
}

function isNonEmptyArray(object: any): boolean {
    return !!(object && Array.isArray(object) && object.length > 0);
}