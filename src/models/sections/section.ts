import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import { Journal } from "../journal";
import { baseJournalsDirectoryPath, baseProcessesDirectoryPath } from "../../constants";
import { ICTConfig, ICTNamePattern } from "../../types/ict-config";

//import * as core from '@actions/core';

export type SectionIdentifier = "P" | "PC" | "RM";

export abstract class Section {
    constructor(public identifier: SectionIdentifier, public directoryName: string) {}

    abstract parse(value: { [key: string]: any }): { [key: string]: any } | null;
    abstract explore(jsonPath: string): void;

    get journalsDirectoryPath() {
        return path.join(baseJournalsDirectoryPath, this.directoryName);
    }

    get processesDirectoryPath() {
        return path.join(baseProcessesDirectoryPath, this.directoryName);
    }

    async downloadAll() {
        const urls = this.createDownloadList();

        if (urls.length === 0) {
            return;
        }

        if (!fs.existsSync(this.journalsDirectoryPath)) {
            fs.mkdirSync(this.journalsDirectoryPath, { recursive: true });
        }

        // Throttle download to 100 request per minute.
        const requestLimit = 100;
        const delay = 60000; // 1 minute
        const sleep = async (ms: number) => new Promise((res) => setTimeout(res, ms));

        for (let i = 0; i < urls.length; i += requestLimit) {
            const urlsSlice = urls.slice(i, i + requestLimit);
            Promise.allSettled(urlsSlice.map((url) => this.download(url)));

            const isOver = i + requestLimit >= urls.length;
            if (!isOver) {
                await sleep(delay);
            }
        }
    }

    async parseAll() {
        // Check zips that don't have a JSON file.
        const zipPaths = fs
            .readdirSync(this.journalsDirectoryPath)
            .filter((file) => file.endsWith(".zip"))
            .map((zip) => path.join(this.journalsDirectoryPath, zip))
            .filter((zip) => {
                const jsonFile = zip.replace(".zip", ".json");
                const jsonNewFile = zip.replace(".zip", ".new.json");
                return !fs.existsSync(jsonFile) && !fs.existsSync(jsonNewFile);
            });

        for (const zipPath of zipPaths) {
            const zipEntries = new AdmZip(zipPath).getEntries();
            const xmlEntry = zipEntries.find((entry) => entry.name.endsWith(".xml"));
            if (!xmlEntry) {
                console.warn(`${zipPath} does not have a XML file`);
                return;
            }

            const xml = xmlEntry?.getData().toString("utf-8");
            const json = this.parse(await xml2js.parseStringPromise(xml));

            if (!json) {
                return;
            }

            const jsonPath = zipPath.replace(".zip", ".new.json");
            fs.writeFileSync(jsonPath, JSON.stringify(json));
        }
    }

    async exploreAll() {
        const jsonPaths = fs
            .readdirSync(this.journalsDirectoryPath)
            .filter((file) => file.endsWith(".new.json"))
            .map((json) => path.join(this.journalsDirectoryPath, json));

        if (!fs.existsSync(this.processesDirectoryPath)) {
            fs.mkdirSync(this.processesDirectoryPath, { recursive: true });
        }

        for (const jsonPath of jsonPaths) {
            this.explore(jsonPath);
        }
    }

    private async download(url: URL) {
        try {
            const response = await fetch(url, { method: "GET" });

            const contentType = response.headers.get("content-type");

            // Checks if a zip file is downloaded
            if (!response.ok || contentType?.indexOf("application/zip")==-1) {
                throw new Error();
            }

            const zipBuffer = Buffer.from(await response.arrayBuffer());

            // If an invalid buffer is downloaded, then AdmZip will emit an error.
            // This is to make sure that the buffer downloaded is a valid zip.
            new AdmZip(zipBuffer);

            // Write zip to disk
            const zipFilename = url.pathname.replace("/txt/", "");
            const zipPath = path.join(this.journalsDirectoryPath, zipFilename);

            const file = fs.openSync(zipPath, "w");
            fs.writeSync(file, zipBuffer);
            fs.closeSync(file);
        } catch (e) {
            console.error(`Error while downloading "${url.href}"`, e);
            //throw e;
            //core.setFailed(`Error while downloading "${url.href}"`);
        }
    }

    private createDownloadList(): URL[] {
        const urls: URL[] = [];
        for (let journalNumber = Journal.firstJournal; journalNumber <= Journal.lastPublication; journalNumber++) {
            const journal = new Journal(this, journalNumber);
            if (!journal.isDownloaded) {
                urls.push(journal.url);
            }
        }

        return urls;
    }
}
