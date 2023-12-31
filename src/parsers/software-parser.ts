import { getFirstElement, isICT, isNonEmptyArray} from "./utils-parser";

export function softwareParser(result: { [key: string]: any }): { [key: string]: any } {
    return {
        revista: {
            numero: getJournalNumber(result),
            dataPublicacao: getPublicationDate(result),
            diretoria: getSection(result),
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
    if (object?.revista?.$?.dataPublicacao) {
        return object?.revista?.$?.dataPublicacao;
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
    let dispatches:any = [];

    const mapDispatch = (dispatch: any) => {
        const newDispatch = {
            codigo: getDispatchCode(dispatch),
            titulo: getDispatchTitle(dispatch),
            processoSoftware: getDispatchSoftwareProcess(dispatch),
        };

        if(isICT(newDispatch.processoSoftware)) dispatches.push(newDispatch);
    };

    if (object?.revista?.despacho && Array.isArray(object?.revista?.despacho)) {
        object?.revista?.despacho.forEach(mapDispatch);
        return dispatches;
    }

    return undefined;
}

function getDispatchCode(dispatch: any) {
    if (dispatch?.codigo && dispatch?.codigo.length > 0) {
        return dispatch?.codigo[0];
    }

    return undefined;
}

function getDispatchTitle(dispatch: any) {
    if (dispatch?.titulo && dispatch?.titulo.length > 0) {
        return dispatch?.titulo[0];
    }

    return undefined;
}

function getDispatchSoftwareProcess(dispatch: any) {
    if (
        !dispatch?.["processo-programa"] ||
        !Array.isArray(dispatch["processo-programa"]) ||
        dispatch["processo-programa"].length === 0
    ) {
        return undefined;
    }

    const softwareProcess = dispatch["processo-programa"][0];

    return {
        numero: getSoftwareProcessNumber(softwareProcess),
        titulo: getSoftwareProcessTitle(softwareProcess),
        dataCriacao: getSoftwareProcessCreationDate(softwareProcess),
        camposAplicacao: getSoftwareProcessApplicationFields(softwareProcess),
        linguagens: getSoftwareProcessLanguages(softwareProcess),
        tiposPrograma: getSoftwareProcessProgramTypes(softwareProcess),
        titulares: getSoftwareProcessHolders(softwareProcess),
        criadores: getSoftwareInventors(softwareProcess),
    };
}

function getSoftwareProcessNumber(softwareProcess: any) {
    const numero = getFirstElement(softwareProcess?.numero);

    if (numero?._) {
        return numero._;
    }

    return undefined;
}

function getSoftwareProcessTitle(softwareProcess: any) {
    const titulo = getFirstElement(softwareProcess?.titulo);

    if (titulo?._) {
        return titulo._;
    }

    return undefined;
}

function getSoftwareProcessCreationDate(softwareProcess: any) {
    const dataCriacao = getFirstElement(softwareProcess?.dataCriacao);

    if (dataCriacao?._) {
        return dataCriacao._;
    }

    return undefined;
}

function getSoftwareProcessApplicationFields(softwareProcess: any) {
    const applicationFieldsList = getFirstElement(softwareProcess?.["campo-aplicacao-lista"]);

    if (isNonEmptyArray(applicationFieldsList?.["campo-aplicacao"])) {
        return applicationFieldsList?.["campo-aplicacao"].reduce((acc: any[], campoAplicacaoAtual: any) => {
            const codigo = getFirstElement(campoAplicacaoAtual?.codigo);

            if (!codigo) {
                return acc;
            }

            acc.push(codigo);

            return acc;
        }, []);
    }

    return undefined;
}

function getSoftwareProcessLanguages(softwareProcess: any) {
    const languagesList = getFirstElement(softwareProcess?.linguagemLista);

    if (isNonEmptyArray(languagesList?.linguagem)) {
        return languagesList?.linguagem.reduce((acc: any[], linguagemAtual: any) => {
            if (!linguagemAtual) {
                return acc;
            }
    
            acc.push(linguagemAtual._);
    
            return acc;
        }, []);
    }

    return undefined;
}

function getSoftwareProcessProgramTypes(softwareProcess: any) {
    const programTypesList = getFirstElement(softwareProcess?.tipoProgramaLista);

    if (isNonEmptyArray(programTypesList?.tipoPrograma)) {
        return programTypesList?.tipoPrograma.reduce((acc: any[], tipoProgramaAtual: any) => {
            const codigo = getFirstElement(tipoProgramaAtual?.codigo);
            
            if (!codigo) {
                return acc;
            }

            acc.push(codigo._);

            return acc;
        }, []);
    }

    return undefined;
}

function getSoftwareProcessHolders(softwareProcess: any) {
    const holdersList = getFirstElement(softwareProcess?.titularLista);

    if (isNonEmptyArray(holdersList?.titular)) { 
        return holdersList.titular.reduce((acc: any[], holderAtual: any) => {
            const name = getFirstElement(holderAtual?.nome);

            if (!name) {
                return acc;
            }

            acc.push(name);

            return acc;
        }, []);
    }

    return undefined;
}

function getSoftwareInventors(softwareProcess: any) {
    const inventorsList = getFirstElement(softwareProcess?.criadorLista);

    if (isNonEmptyArray(inventorsList?.criador)) {
        return inventorsList.criador.reduce((acc: any[], inventorAtual: any) => {
            const name = getFirstElement(inventorAtual?.nome);

            if (!name) {
                return acc;
            }

            acc.push(name);

            return acc;
        }, []);
    }

    return undefined;
}