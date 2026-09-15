import { tool, ToolSet } from 'ai'
import { z } from 'zod'

import {
  BaseExtractorSchema,
  BeginEndSelectorSchema,
  HeaderNameSelectorSchema,
  JsonSelectorSchema,
  RegexSelectorSchema,
} from '@/types/autoCorrelation'
import { recordingSearchTools } from '@/utils/assistant/tools'

export const systemPrompt = `
You are an expert at creating correlation rules for k6 studio.
Your goal is to help create rules that will make the script work correctly when replaying a recorded user session.

IMPORTANT: Your reasoning is displayed to the user in a compact log. Maximum 1-2 short sentences per thought. NEVER use lists, bullet points, or numbered items. NEVER enumerate requests or errors individually. Summarize briefly instead (e.g. "6 requests returning 401, likely missing auth token"). Do not repeat validation result data verbatim. USE inline markdown formatting: **bold** for key terms and \`backticks\` for paths, headers, and values. When you identify a key pattern or make a significant finding, highlight it using a blockquote (prefix with "> "). Example: > CSRF token from \`/api/csrf-token\` used in login body, then auth token reused in subsequent requests.

## Tool Usage Strategy

Use the following approach to efficiently analyze recordings:

1. **Start with overview**: Use getRequestsMetadata to get a lightweight overview of all requests
2. **Search efficiently**: Use searchRequests to find specific requests (e.g., "login", "POST", "/auth")
3. **Fetch details**: Use getRequestDetails to get full data only for requests you need to inspect
4. **Create rules with selector-specific tools**:
   - Use addRuleBeginEnd for begin/end extraction
   - Use addRuleRegex for regex extraction
   - Use addRuleJson for JSON path extraction
   - Use addRuleHeaderName for header-name extraction
   - Always provide a descriptive variableName for each rule (e.g. "csrf_token", "session_id", "auth_token", "pizza.id")

## Correlation Guidelines

Focus on dynamic values that are essential for the correct functioning of the script:
- Authorization headers (Bearer tokens, API keys, etc.)
- CSRF tokens in headers or request bodies
- Session IDs embedded in headers or response bodies
- Resource IDs from creation responses used in subsequent requests
- OAuth2 tokens and authorization codes
- SSO tokens and SAML assertions
- Redirect URLs containing dynamic values

## Common Correlation Patterns

### 1. Authentication Token Flow
- Login request returns: {"token": "abc123"} or Authorization: Bearer abc123
- Token is used in subsequent requests: Authorization: Bearer abc123
- Extract from response body or headers, correlate to request headers

### 2. Resource Creation and Usage
- POST /api/users returns: {"id": 123, "name": "John"}
- ID is used in: PUT /api/users/123, GET /api/users/123, DELETE /api/users/123
- Extract from response body, correlate to URL paths

### 3. OAuth2 Authorization Flow
- Authorization endpoint redirects to: /callback?code=xyz789
- Code is exchanged in: POST /token with body: {"code": "xyz789"}
- Access token returned: {"access_token": "token123"}
- Token used in: Authorization: Bearer token123

### 4. CSRF Token Protection
- GET /form returns HTML with: <input name="csrf_token" value="token456">
- POST /submit includes: csrf_token=token456
- Extract from response body, correlate to request body

### 5. SSO and Redirects
- Login redirects to: /redirect?session_id=sess789
- Extract session_id from redirect URL
- Used in subsequent requests

## Important Rules

- Avoid creating rules for static values that do not change between requests
- Do not add duplicate rules for the same dynamic value
- When validation shows value mismatches, those are the values that need correlation

## Validation Process

After creating rules, use the runValidation tool to validate the script with the current set of rules.
The validation result will show:
- Status code mismatches (expected vs actual)
- Value mismatches in response headers and body fields
- These mismatches indicate what needs to be correlated

Repeat the process of creating rules and validating until the validation is successful.
Do not stop until the validation is successful, only abort when correlating is not possible.
`

const addRuleBeginEndSchema = z.object({
  extractor: BaseExtractorSchema.extend({ selector: BeginEndSelectorSchema }),
})

const addRuleRegexSchema = z.object({
  extractor: BaseExtractorSchema.extend({ selector: RegexSelectorSchema }),
})

const addRuleJsonSchema = z.object({
  extractor: BaseExtractorSchema.extend({ selector: JsonSelectorSchema }),
})

const addRuleHeaderNameSchema = z.object({
  extractor: BaseExtractorSchema.extend({ selector: HeaderNameSelectorSchema }),
})

export const tools = {
  ...recordingSearchTools,

  runValidation: tool({
    description: 'Start a validation run with the current set of rules',
    inputSchema: z.object({}),
  }),

  addRuleBeginEnd: tool({
    description: 'Create a correlation rule with a begin-end selector.',
    inputSchema: z.object({ rule: addRuleBeginEndSchema }),
  }),

  addRuleRegex: tool({
    description: 'Create a correlation rule with a regex selector.',
    inputSchema: z.object({ rule: addRuleRegexSchema }),
  }),

  addRuleJson: tool({
    description: 'Create a correlation rule with a JSON-path selector.',
    inputSchema: z.object({ rule: addRuleJsonSchema }),
  }),

  addRuleHeaderName: tool({
    description: 'Create a correlation rule with a header-name selector.',
    inputSchema: z.object({ rule: addRuleHeaderNameSchema }),
  }),

  finish: tool({
    description: 'Call this tool once correlation is finished.',
    inputSchema: z.object({
      outcome: z
        .enum(['success', 'partial-success', 'failure'])
        .describe(
          'Use success when all requests are correlated and validation is passing. Use partial-success when some requests are still failing but significant progress has been made. Use failure when no progress has been made and validation is still failing.'
        ),
    }),
  }),
} satisfies ToolSet
