const {tasks: {lastWeeksPRs}} = require("github-airtable-bridge");
const fs = require("fs")
const path = require("path")


async function main() {
  let prs = await lastWeeksPRs.getPRs({ cache: true });

  const postPath = path.join(__dirname, "../docs/updates/updates-10-31-2017.md")
  const post = lastWeeksPRs.post(prs);
  fs.writeFileSync(postPath, post))
}

main();
