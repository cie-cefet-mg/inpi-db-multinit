import { Section } from "./section";
import path from "path";

export class SectionSoftware extends Section {
    constructor() {
        super("PC", "programa-computador");
    }

    parse(value: { [key: string]: any }): { [key: string]: any } | null {
        return null;
    }

    explore(jsonPath: string): void {
        console.log(jsonPath);
        return;
    }
}
