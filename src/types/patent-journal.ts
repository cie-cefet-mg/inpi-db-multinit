export interface PatentJournal {
    revista: {
        numero: string;
        dataPublicacao: string;
        diretoria: string;
        despachos: PatentDispatch[];
    };
}

export interface PatentDispatch {
    codigo: string;
    titulo: string;
    processoPatente: PatentProcess;
}

export interface PatentProcess {
    numero?: string;
    dataDeposito?: string;
    dataConcessao?: string;
    dataFaseNacional?: string;
    pedidoInternacional?: {
        numeroPCT: string;
        dataPCT: string;
    };
    publicacaoInternacional?: {
        numeroOMPI: string;
        dataOMPI: string;
    };
    titulo?: string;
    IPC?: string[];
    titulares?: Holder[];
    siglasTitulares: string[]; 
    inventores?: string[];
    prioridadesUnionistas?: {
        siglaPais: string;
        numeroPrioridade: string;
        dataPrioridade: string;
    }[];
    divisaoPedido?: {
        dataDeposito: string;
        numero: string;
    };
    pedidoPrincipal: {
        dataDeposito: string;
        numero: string;
    };
}

export interface Holder {
    nomeCompleto: string;
    pais: string;
    uf?: string;
}
