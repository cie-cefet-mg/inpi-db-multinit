import { journalsDirectoryPath } from "../../constants";
import { patentParser } from "../../parsers/patent-parser";
import { Section } from "./section";
import path from "path";

export class SectionPatent extends Section {
    constructor() {
        super("P", path.join(journalsDirectoryPath, "patente"));
    }

    parse(value: { [key: string]: any }): { [key: string]: any } | null {
        return patentParser(value);
    }
}
