import countMatches from "./count-matches";
import searchSources from "./project-search";
import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({ countMatches, searchSources });
