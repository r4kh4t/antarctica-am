#!/usr/bin/env node

const chunks = [];

process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", () => {
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  const command = String(input.command ?? "");
  const riskyPatterns = [
    /\brm\s+(-[^\s]*r|-[^\s]*f|-[^\s]*rf|-[^\s]*fr)\b/,
    /\bgit\s+reset\s+--hard\b/,
    /\bgit\s+push\b.*\s--force(?:-with-lease)?\b/,
    /\bgit\s+clean\s+-[^\s]*f/,
    /\bchmod\s+-R\b/,
    /\b(cat|printenv|env)\b.*\b(\.env|SECRET|TOKEN|PASSWORD|KEY)\b/i,
  ];

  if (riskyPatterns.some((pattern) => pattern.test(command))) {
    process.stdout.write(
      JSON.stringify({
        permission: "ask",
        user_message:
          "This shell command looks destructive or could expose secrets. Please review it before continuing.",
        agent_message: "A project hook flagged this command as risky.",
      }),
    );
    return;
  }

  process.stdout.write(JSON.stringify({ permission: "allow" }));
});
