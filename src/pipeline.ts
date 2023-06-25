import { SectionPatent } from "./models/sections/section-patent";
import { SectionSoftware } from "./models/sections/section-software";
// import { SectionSoftware } from "./models/sections/section-software";

(async () => {
    const sections = [new SectionPatent(), new SectionSoftware()];

    for (const section of sections) {
        await section.downloadAll();
        await section.parseAll();
    }
})();
