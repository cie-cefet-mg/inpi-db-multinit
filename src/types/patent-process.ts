import { PatentProcess } from "./patent-journal";

export interface ExploredProcess extends PatentProcess {
    despachos?: { codigo: string; titulo: string; rpi: string }[];
}
