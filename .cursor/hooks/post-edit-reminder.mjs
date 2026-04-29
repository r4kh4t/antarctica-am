#!/usr/bin/env node

const chunks = [];

process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", () => {
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  const filePath = String(input.path ?? input.file_path ?? "");

  const isSourceEdit = /^src\//.test(filePath);
  const isChangelogItself = filePath === "CHANGELOG.md";

  if (!isSourceEdit || isChangelogItself) {
    process.stdout.write(JSON.stringify({}));
    return;
  }

  const isPortfolioOrUi = /^(src\/lib\/portfolio|src\/app|src\/components)\//.test(filePath);

  const testReminder = isPortfolioOrUi
    ? " Run the relevant tests and lint before final delivery."
    : "";

  process.stdout.write(
    JSON.stringify({
      additional_context:
        `Project reminder: you edited ${filePath}.${testReminder}` +
        " Before committing, add an entry to CHANGELOG.md under [Unreleased]" +
        " unless this is a formatting-only change.",
    }),
  );
});
