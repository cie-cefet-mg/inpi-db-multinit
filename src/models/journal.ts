import { differenceInDays } from "date-fns";
import { Section } from "./sections/section";
import path from "path";
import fs from "fs";

export class Journal {
    private baseUrl = "http://revistas.inpi.gov.br/txt/";

    static firstJournal = 2474;
    static get lastPublication(): number {
        const referenceJournal = 2730;
        const referenceJournalPublicationDate = new Date(2023, 4, 2);
        const todayDate = new Date();
        const diffInDays = differenceInDays(todayDate, referenceJournalPublicationDate);
        return Math.floor(diffInDays / 7) + referenceJournal;
    }

    constructor(private section: Section, private number: number) {}

    get isDownloaded(): boolean {
        const extensions = [".zip", ".json", ".new.json"];
        return extensions.some((extension) => {
            const filePath = path.join(this.section.directoryPath, `${this.identifier}${extension}`);
            return fs.existsSync(filePath);
        });
    }

    get url(): URL {
        return new URL(`${this.section.identifier}${this.number}.zip`, this.baseUrl);
    }

    get identifier(): string {
        return `${this.section.identifier}${this.number}`;
    }
}
