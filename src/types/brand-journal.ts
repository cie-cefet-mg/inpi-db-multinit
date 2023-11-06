import { Holder } from "./patent-journal";

export interface BrandJournal {
    revista: {
        numero: string;
        dataPublicacao: string;
        diretoria: string;
        despachos: BrandDispatch[];
    };
}

export interface BrandProcess {
    numero?: string;
    dataDeposito?: string;
    dataConcessao?: string,
    dataVigencia?: string;
    titulo?: string;
    natureza?: string;
    apresentacao?: string;
    classesNice?: {
        codigo: string;
        status: string;
        especificacao: string;
    }[];
    classesVienna?: {
        codigo: string;
        edicao: string;
    }[];
    titulares?: Holder[];
    procurador?: string;
}

export interface BrandDispatch {
    codigo: string;
    titulo: string;
    comentario?: string;
    processoMarca: BrandProcess;
}