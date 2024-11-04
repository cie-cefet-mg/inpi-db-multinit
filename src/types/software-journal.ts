export interface SoftwareJournal {
    revista: {
        numero: string;
        dataPublicacao: string;
        diretoria: string;
        despachos: SoftwareDispatch[];
    };
}

export interface SoftwareDispatch {
    codigo: string;
    titulo: string;
    processoPrograma: SoftwareProcess;
}

export interface SoftwareProcess {
    numero?: string;
    titulo?: string;
    dataCriacao?: string;
    camposAplicacao?: string[];
    linguagens?: string[];
    tiposPrograma?: string[];
    titulares?: string[];
    siglasTitulares: string[];
    criadores?: string[];
}
