export function patentParser(result: { [key: string]: any }): { [key: string]: any } {
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

// despachos
function getDispaches(object: any) {
    const mapDispatch = (dispatch: any) => {
        return {
            codigo: getDispatchCode(dispatch),
            titulo: getDispatchTitle(dispatch),
            processoPatente: getDispatchPatentProcess(dispatch),
        };
    };

    if (object?.revista?.despacho && Array.isArray(object?.revista?.despacho)) {
        return object?.revista?.despacho.map(mapDispatch);
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

function getDispatchPatentProcess(dispatch: any) {
    if (
        !dispatch?.["processo-patente"] ||
        !Array.isArray(dispatch["processo-patente"]) ||
        dispatch["processo-patente"].length === 0
    ) {
        return undefined;
    }

    const patentProcess = dispatch["processo-patente"][0];

    return {
        numero: getPatentProcessNumber(patentProcess),
        dataDeposito: getPatentProcessDepositDate(patentProcess),
        dataConcessao: getPatentProcessGrantDate(patentProcess),
        dataFaseNacional: getPatentProcessNationalStageDate(patentProcess),
        pedidoInternacional: getPatentProcessInternationalRequest(patentProcess),
        publicacaoInternacional: getPatentProcessInternationalPublication(patentProcess),
        titulo: getPatentProcessTitle(patentProcess),
        IPC: getPatentProcessInternationalClassification(patentProcess),
        titulares: getPatentProcessHolders(patentProcess),
        inventores: getPatentInventors(patentProcess),
        prioridadesUnionistas: getPatentProcessUnionistPriorities(patentProcess),
        divisaoPedido: getPatentProcessDivisionRequest(patentProcess),
        pedidoPrincipal: getPatentProcessMainRequest(patentProcess),
    };
}

function getPatentProcessNumber(patentProcess: any) {
    const numero = getFirstElement(patentProcess?.numero);

    if (numero?._) {
        return numero._;
    }

    return undefined;
}

function getPatentProcessDepositDate(patentProcess: any) {
    const depositDate = getFirstElement(patentProcess?.["data-deposito"]);

    if (depositDate?._) {
        return depositDate._;
    }

    return undefined;
}

function getPatentProcessGrantDate(patentProcess: any) {
    const grantObject = getFirstElement(patentProcess?.concessao);
    const grantDate = getFirstElement(grantObject?.data);

    if (grantDate) {
        return grantDate;
    }

    return undefined;
}

function getPatentProcessNationalStageDate(patentProcess: any) {
    const nationalStageDate = getFirstElement(patentProcess?.["data-fase-nacional"]);

    if (nationalStageDate?._) {
        return nationalStageDate._;
    }

    return undefined;
}

function getPatentProcessInternationalRequest(patentProcess: any) {
    const internationalRequest = getFirstElement(patentProcess?.["pedido-internacional"]);

    if (!internationalRequest) {
        return undefined;
    }

    const pctNumber = getFirstElement(internationalRequest["numero-pct"]);
    const pctDate = getFirstElement(internationalRequest["data-pct"]);

    if (!pctNumber && !pctDate) {
        return undefined;
    }

    return {
        numeroPCT: pctNumber,
        dataPCT: pctDate,
    };
}

function getPatentProcessInternationalPublication(patentProcess: any) {
    const internationalPublication = getFirstElement(patentProcess?.["publicacao-internacional"]);

    if (!internationalPublication) {
        return undefined;
    }

    const ompiNumber = getFirstElement(internationalPublication["numero-ompi"]);
    const ompiDate = getFirstElement(internationalPublication["data-ompi"]);

    if (!ompiNumber && !ompiDate) {
        return undefined;
    }

    return {
        numeroOMPI: ompiNumber,
        dataOMPI: ompiDate,
    };
}

function getPatentProcessTitle(patentProcess: any) {
    const title = getFirstElement(patentProcess?.titulo);

    if (title?._) {
        return title._;
    }

    return undefined;
}

function getPatentProcessInternationalClassification(patentProcess: any) {
    const ipcList = getFirstElement(patentProcess?.["classificacao-internacional-lista"]);

    if (isNonEmptyArray(ipcList?.["classificacao-internacional"])) {
        return ipcList["classificacao-internacional"].reduce((acc: string[], curClassification: any) => {
            if (!curClassification?._) {
                return acc;
            }

            acc.push(curClassification._);
            return acc;
        }, []);
    }

    return undefined;
}

function getPatentProcessHolders(patentProcess: any) {
    const holdersList = getFirstElement(patentProcess?.["titular-lista"]);

    if (isNonEmptyArray(holdersList?.titular)) {
        return holdersList.titular.reduce((acc: any[], holder: any) => {
            const fullName = getFirstElement(holder?.["nome-completo"]);
            const address = getFirstElement(holder?.endereco);
            const state = getFirstElement(address?.uf);
            const countryObject = getFirstElement(address?.pais);
            const country = getFirstElement(countryObject?.sigla);

            if (!fullName && !state && !country) {
                return acc;
            }

            acc.push({
                nomeCompleto: fullName,
                uf: state,
                pais: country,
            });

            return acc;
        }, []);
    }

    return undefined;
}

function getPatentInventors(patentProcess: any) {
    const inventorsList = getFirstElement(patentProcess?.["inventor-lista"]);
    if (isNonEmptyArray(inventorsList?.inventor)) {
        return inventorsList.inventor.reduce((acc: string[], inventor: any) => {
            const inventorName = getFirstElement(inventor?.["nome-completo"]);
            if (!inventorName) {
                return acc;
            }

            acc.push(inventorName);
            return acc;
        }, []);
    }

    return undefined;
}

function getPatentProcessUnionistPriorities(patentProcess: any) {
    const unionistPrioritiesList = getFirstElement(patentProcess?.["prioridade-unionista-lista"]);

    if (isNonEmptyArray(unionistPrioritiesList?.["prioridade-unionista"])) {
        return unionistPrioritiesList["prioridade-unionista"].reduce((acc: any, priority: any) => {
            const countryInitials = getFirstElement(priority?.["sigla-pais"])?._;
            const priorityNumber = getFirstElement(priority?.["numero-prioridade"])?._;
            const priorityDate = getFirstElement(priority?.["data-prioridade"])?._;

            if (!countryInitials && !priorityNumber && !priorityDate) {
                return undefined;
            }

            acc.push({
                siglaPais: countryInitials,
                numeroPrioridade: priorityNumber,
                dataPrioridade: priorityDate,
            });

            return acc;
        }, []);
    }

    return undefined;
}

function getPatentProcessDivisionRequest(patentProcess: any) {
    const divisionRequest = getFirstElement(patentProcess?.["divisao-pedido"]);

    if (!divisionRequest) {
        return undefined;
    }

    const divisionRequestDepositDate = getFirstElement(divisionRequest["data-deposito"]);
    const divisionRequestNumber = getFirstElement(divisionRequest.numero);

    if (!divisionRequestDepositDate && !divisionRequestNumber) {
        return undefined;
    }

    return {
        dataDeposito: divisionRequestDepositDate,
        numero: divisionRequestNumber,
    };
}

function getPatentProcessMainRequest(patentProcess: any) {
    const mainRequest = getFirstElement(patentProcess?.["pedido-principal"]);

    if (!mainRequest) {
        return undefined;
    }

    const mainRequestDepositDate = getFirstElement(mainRequest["data-deposito"]);
    const mainRequestNumber = getFirstElement(mainRequest.numero);

    if (!mainRequestDepositDate && !mainRequestNumber) {
        return undefined;
    }

    return {
        dataDeposito: mainRequestDepositDate,
        numero: mainRequestNumber,
    };
}

function getFirstElement(object: any) {
    if (isNonEmptyArray(object) && object[0]) {
        return object[0];
    }

    return undefined;
}

function isNonEmptyArray(object: any): boolean {
    return !!(object && Array.isArray(object) && object.length > 0);
}
