import AdmZip from "adm-zip";
import { differenceInDays } from "date-fns";
import fs from "fs";
import "isomorphic-fetch";
import path from "path";
import { journalsDirectoryPath } from "./paths";

// main
(async () => {
    await downloadAll();
})();

async function downloadAll() {
    // Check for missing journals.
    const downloadList = createDownloadList();

    console.log(`-> download: ${downloadList.length} journal(s) to download.\n`);

    if (downloadList.length === 0) {
        return;
    }

    // Throttle download to 100 request per minute.
    const requestLimit = 100;
    const delay = 60000; // 1 minute
    const sleep = async (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (let i = 0; i < downloadList.length; i += requestLimit) {
        const downloadListSlice = downloadList.slice(i, i + requestLimit);
        console.log(`-> ${i} to ${i + downloadListSlice.length - 1}`);
        Promise.allSettled(downloadListSlice.map(downloadJournal));

        const isOver = i + requestLimit >= downloadList.length;
        if (!isOver) {
            await sleep(delay);
        }
    }
}

async function downloadJournal(url: URL) {
    try {
        if (!fs.existsSync(journalsDirectoryPath)) {
            fs.mkdirSync(journalsDirectoryPath, { recursive: true });
        }

        const response = await fetch(url, { method: "GET" });

        if (response.url.includes("error") || response.redirected) {
            console.error(`Error while downloading "${url.href}"`);
            return;
        }

        const zipBuffer = Buffer.from(await response.arrayBuffer());

        // If an invalid buffer is downloaded, then AdmZip will emit an error.
        // This is to make sure that the buffer downloaded is a valid zip.
        new AdmZip(zipBuffer);

        // Write zip to disk
        const zipFilename = url.pathname.replace("/txt/", "");
        const zipPath = path.join(journalsDirectoryPath, zipFilename);

        const file = fs.openSync(zipPath, "w");
        fs.writeSync(file, zipBuffer);
        fs.closeSync(file);
    } catch (e) {
        console.error(`Error while downloading "${url.href}"`);
    }
}

function createDownloadList(): URL[] {
    const urlList: URL[] = [];
    const sections = ["P"];
    for (let journal = 2474; journal <= getLastPublication(); journal++) {
        sections.forEach((section) => {
            if (!isJournalDownloaded(journal, section)) {
                urlList.push(new URL(`${section}${journal}.zip`, "http://revistas.inpi.gov.br/txt/"));
            }
        });
    }

    return urlList;
}

function isJournalDownloaded(journal: number, section: string): boolean {
    const zipExists = fs.existsSync(path.join(journalsDirectoryPath, `${section}${journal}.zip`));
    const jsonExists = fs.existsSync(path.join(journalsDirectoryPath, `${section}${journal}.json`));
    return zipExists || jsonExists;
}

export function getLastPublication(): number {
    const referenceJournal = 2730;
    const referenceJournalPublicationDate = new Date(2023, 4, 2);
    const todayDate = new Date();
    const diffInDays = differenceInDays(todayDate, referenceJournalPublicationDate);
    return Math.floor(diffInDays / 7) + referenceJournal;
}
