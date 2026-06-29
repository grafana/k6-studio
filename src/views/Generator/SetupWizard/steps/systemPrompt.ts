interface SystemPromptOptions {
  /** One-line task description shown after the shared expert-role line. */
  task: string
  /** Nouns listed after "backticks for" in the reasoning-log formatting rule. */
  backtickTargets: string
  /** Step-specific markdown body appended after the shared preamble. */
  body: string
}

/**
 * Builds an agent-step system prompt from the shared expert-role line and
 * reasoning-log formatting rules (identical across the wizard's agent steps)
 * plus the step's own task line, backtick targets, and body.
 */
export function buildSystemPrompt({
  task,
  backtickTargets,
  body,
}: SystemPromptOptions): string {
  return `
You are an expert at preparing k6 load tests from recorded user sessions.
${task}

IMPORTANT: Your reasoning is displayed to the user in a compact log. Maximum 1-2 short sentences per thought. NEVER use lists, bullet points, or numbered items. USE inline markdown formatting: **bold** for key terms and \`backticks\` for ${backtickTargets}. When you identify a key pattern, highlight it using a blockquote (prefix with "> ").

${body}
`
}
