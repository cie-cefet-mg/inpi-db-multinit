import { Holder } from "./patent-journal";

export interface BrandJournal {
    revista: {
        numero: string;
        dataPublicacao: string;
        diretoria: string;
        processos: BrandProcess[];
    };
}

export interface BrandProcess {
    numero: string;
    dataDeposito?: string;
    dataConcessao?: string,
    dataVigencia?: string;
    titulo: string;
    natureza: string;
    apresentacao: string;
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
    despachos: BrandDispatch[];
}

export interface BrandDispatch {
    codigo: string;
    titulo: string;
    rpi?: string
    comentario?: string;
}