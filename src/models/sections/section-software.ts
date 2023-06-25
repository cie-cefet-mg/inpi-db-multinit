import { journalsDirectoryPath } from "../../constants";
import { Section } from "./section";
import path from "path";

export class SectionSoftware extends Section {
    constructor() {
        super("PC", path.join(journalsDirectoryPath, "programa-computador"));
    }

    parse(value: { [key: string]: any }): { [key: string]: any } | null {
        return null;
    }
}
