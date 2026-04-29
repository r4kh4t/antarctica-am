#!/usr/bin/env node

const chunks = [];

process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", () => {
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  const filePath = String(input.path ?? input.file_path ?? "");
  const relevant = /^(src\/lib\/portfolio|src\/app|src\/components)\//.test(filePath);

  if (!relevant) {
    process.stdout.write(JSON.stringify({}));
    return;
  }

  process.stdout.write(
    JSON.stringify({
      additional_context:
        "Project reminder: after editing portfolio logic or UI, run the narrow relevant tests first, then lint/build before final delivery.",
    }),
  );
});
