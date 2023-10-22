export function brandParser(result: { [key: string]: any }): { [key: string]: any } {
    return {
        revista: {
            numero: getJournalNumber(result),
            dataPublicacao: getPublicationDate(result),
            diretoria: getSection(result),
            processos: getBrandsProcess(result),
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

// ! ignorar essa função, ainda não apaguei pq talvez seja necessário mudar minha lógica e usala.
function getDispaches(object: any) {
    let processes = object?.revista?.processo;
    
    if(isNonEmptyArray(processes)) {
        return processes.reduce((acc: any[], process: any) => {
            let dispatches = process?.despachos?.despacho;

            

            dispatches.forEach((dispatch: any)=> {
                if(!dispatch?.$?.codigo && !dispatch?.$?.nome) {
                    return acc;
                }

                acc.push({
                    codigo: dispatch?.$?.codigo,
                    titulo: dispatch?.$?.nome,
                    comentario: dispatch?.$?.["texto-complementar"]?._,
                    processoMarca: getBrandsProcess(process),
                });
            });

            return acc
        }, []);

    }

    return undefined;
}

// ! ignorar essa função, ainda não apaguei pq talvez seja necessário mudar minha lógica e usala.
function getBrandProcess(process: any) {
    if(!process) {
        return {
            numero: getBrandsProcessNumber(process),
            dataDeposito: getBrandsProcessDepositDate(process),
            dataConcessao: getBrandsProcessGrantDate(process),
            dataVigencia: getBrandsProcessValidityDate(process),
            nome: getBrandsProcessBrandName(process),
            natureza: getBrandsProcessBrandNature(process),
            apresentacao: getBrandsProcessBrandPresentetion(process),
            classesNice: getBrandsProcessNiceClasses(process),
            classesVienna: getBrandsProcessViennaClasses(process),
            titulares: getBrandsProcessHolders(process),
            produrador: getBrandsProcessAttorney(process),
            despachos: getBrandsProcessDispaches(process, ""),
        };
    }

    return undefined;
}

function getBrandsProcess(object: any) {
    const mapProcess = (process: any) => {
        return {
            codigo: getBrandsProcessNumber(process),
            dataDeposito: getBrandsProcessDepositDate(process),
            dataConcessao: getBrandsProcessGrantDate(process),
            dataVigencia: getBrandsProcessValidityDate(process),
            titulo: getBrandsProcessBrandName(process),
            natureza: getBrandsProcessBrandNature(process),
            apresentacao: getBrandsProcessBrandPresentetion(process),
            classesNice: getBrandsProcessNiceClasses(process),
            classesVienna: getBrandsProcessViennaClasses(process),
            titulares: getBrandsProcessHolders(process),
            procurador: getBrandsProcessAttorney(process),
            despachos: getBrandsProcessDispaches(process, getJournalNumber(object)),
        };
    };

    if(!object?.revista?.processo && Array.isArray(object?.revist?.processo)) {
        return object.revista.processo.map(mapProcess);
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
    if(brandProcess?.marca?.nome) {
        return brandProcess?.marca?.nome?._;
    }

    return undefined;
}

function getBrandsProcessBrandNature(brandProcess: any) {
    if(brandProcess?.marca?.nome?.natureza) {
        return brandProcess?.marca?.nome?.natureza;
    }

    return undefined;
}

function getBrandsProcessBrandPresentetion(brandProcess: any) {
    if(brandProcess?.marca?.nome?.apresentacao) {
        return brandProcess?.marca?.nome?.apresentacao;
    }

    return undefined;
}

function getBrandsProcessHolders(brandProcess: any) {
    const holdersList = brandProcess?.titulares;

    if(isNonEmptyArray(holdersList?.titular)) {
        return holdersList.titular.reduce((acc: any[], holder: any) => {
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

function getBrandsProcessDispaches(brandProcess: any, journalNumber: string) {
    if(isNonEmptyArray(brandProcess?.despachos?.despacho)) {
        return brandProcess?.despachos?.despacho.reduce((acc: any[], dispatch: any) => {
            const code = dispatch?.$?.codigo;
            const name = dispatch?.$?.nome;
            const description = dispatch?.$?.["texto-complementar"]?._;

            if(!code && !name) {
                return acc;
            }

            acc.push({
                codigo: dispatch?.$?.codigo,
                titulo: dispatch?.$?.nome,
                rpi: journalNumber,
                comentario: description,
            });

            return acc;
        }, []);
    }

    return undefined;
}

function getBrandsProcessAttorney(brandProcess: any) {
    if(brandProcess?.procurador) {
        return brandProcess?.procurador?._;
    }

    return undefined;
}

function getBrandsProcessViennaClasses(brandProcess: any) {
    const mapViennaClasses = (viennaClass: any) => {
        return {
            codigo: viennaClass?.$?.codigo,
            edicao: viennaClass?.$?.edicao,
        }
    };

    if(brandProcess?.["classes-vienna"]?.["classe-vienna"] && Array.isArray(brandProcess?.["classes-vienna"]?.["classe-vienna"])) {
        return brandProcess?.["classes-vienna"]?.["classe-vienna"].map(mapViennaClasses);
    }

    return undefined;
}

function getBrandsProcessNiceClasses(brandProcess: any) {
    const mapNiceClasses = (niceClass: any) => {
        return {
            codigo: niceClass?.$?.codigo,
            status: niceClass?.status?._,
            especificacao: niceClass?.especificacao?._,
        }
    };

    if(brandProcess?.["lista-classe-nice"]?.["classe-nice"] && Array.isArray(brandProcess?.["lista-classe-nice"]?.["classe-nice"])) {
        return brandProcess?.["lista-classe-nice"]?.["classe-nice"].map(mapNiceClasses);
    }

    return undefined;
}

function isNonEmptyArray(object: any): boolean {
    return !!(object && Array.isArray(object) && object.length > 0);
}