import { sections } from "../sections";

(async () => {
    for (const section of sections) {
        await section.exploreAll();
    }
})();
