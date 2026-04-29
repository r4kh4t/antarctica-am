/**
 * Renders a string with backtick-wrapped spans (`like this`) as bold text.
 * Supports only inline backtick syntax — no other markdown is processed.
 */
export function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
