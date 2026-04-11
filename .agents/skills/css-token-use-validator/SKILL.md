---
name: css-token-use-validator
description: Validate CSS custom property usage against token definitions. Use when the user wants to check if CSS variables are properly defined, find unused tokens, detect typos in var() references, audit custom property, or when working between Figma design files and code. Works with single files, directories, or entire projects. Can be used as a Claude Code hook to automatically validate after CSS edits.
---

# CSS Token Use Validator

Validate that CSS custom properties (CSS variables) used in stylesheets are properly defined in token files, and identify unused or potentially misspelled tokens.

## When to Use This Skill

Use this skill when the user:

- Wants to validate custom property usage in CSS files
- Needs to find undefined `var()` references
- Wants to identify unused tokens in their design system
- Suspects typos in custom property names
- Requests a token usage audit or coverage report
- Asks to check if CSS variables are properly defined
- Mentions "tokens", "design tokens", "custom properties", or "CSS variables" in the context of validation
- When working between Figma design files and code
- Runs as a Claude Code PostToolUse hook after CSS file edits

## Figma variables to custom properties map

For a complete reference of Figma variables to custom properties, see the [Figma-to-CSS Custom Properties Map](figma-to-custom-properties-map.md).

## Core Capabilities

This skill provides:

- **Undefined property detection**: Find `var()` references that aren't defined anywhere
- **Component-scoped recognition**: Distinguish local properties from true errors
- **Context-aware suggestions**: Provide typo detection AND category-based token listings
- **Unused token detection**: Identify defined tokens that are never used
- **Coverage reporting**: Show overall token usage statistics
- **Flexible scope**: Validate single files, directories, or entire projects

## Workflow

### 1. Understand the Request

Clarify the scope with the user:

- Which CSS files should be validated? (specific file, directory, all files)
- Where are the token definitions? (usually in a tokens/ or design-system/ directory)
- Are there specific concerns? (looking for a particular issue vs. general audit)

If the user hasn't specified, ask for:

1. Token file location(s) - where custom properties are defined
2. CSS file scope - what should be validated

### 2. Run the Validator Tool

Execute the validation using the companion tool: `scripts/validator.js`

**Tool Options:**

- `--tokens` (required): Glob pattern or path to token definition files
- `--css` (required): Glob pattern or path to CSS files to validate
- `--format`: Output format (`json`, `summary`, `detailed`) - default: `json`
- `--threshold`: Similarity threshold for typo detection (0-1) - default: 0.7
- `--ignore`: Comma-separated list of properties to ignore (e.g., browser defaults)

**Common Patterns:**

```bash
# Single file validation
--tokens "src/tokens/colors.css" --css "src/components/Button.css"

# Directory validation
--tokens "src/tokens/*.css" --css "src/components/**/*.css"

# Full project audit
--tokens "src/design-system/tokens/**/*.css" --css "src/**/*.css"

# Ignore browser-provided properties
--ignore "scrollbar-color,scrollbar-width"
```

### 3. Interpret Results

The validator returns structured data with these sections:

**undefined**: Properties used in CSS but not defined anywhere (true errors)

```json
{
  "property": "--color-primary-hover",
  "usedIn": ["components/Button.css:15"],
  "typoSuggestions": ["--color-primary-dark"],
  "categoryTokens": ["--color-primary", "--color-primary-light", "--color-accent"]
}
```

**componentScoped**: Properties defined and used within component files (valid pattern, informational only)

```json
{
  "property": "--Legend-block-end-margin",
  "definedIn": "components/Legend.css:5",
  "usedIn": ["components/Legend.css:12"]
}
```

**unused**: Properties defined in tokens but never referenced

```json
{
  "property": "--spacing-xxl",
  "definedIn": "tokens/spacing.css:8"
}
```

**stats**: Overall coverage metrics

```json
{
  "totalTokens": 120,
  "totalComponentScoped": 8,
  "tokensUsed": 98,
  "totalUndefined": 2,
  "totalUnused": 22,
  "tokenCoverage": 81.7
}
```

### 4. Present Findings with Context-Aware Guidance

Format results clearly for the user:

**For undefined properties (true errors):**

- Show the property name and where it's used
- **CRITICAL**: Present suggestions thoughtfully based on their type:

  **For likely typos** (high similarity > 0.85):
  - "This looks like a typo. Did you mean `--spacing-md`?"
  - Safe to suggest specific correction

  **For semantic choices** (category tokens shown):
  - "This property doesn't exist. Here are available [category] tokens:"
  - List the category tokens (e.g., available color tokens, spacing tokens)
  - "Which one fits your intent? Or should I add this as a new token?"
  - **DO NOT** suggest a specific token - let the user choose

- Point the user to token source files when needed
- These require action from the user

**NEVER blindly suggest a token substitution based only on string similarity when the context matters.** A token that is syntactically close may be semantically wrong for what the agent was trying to accomplish.

**For component-scoped properties (informational):**

- Acknowledge these are valid local properties
- Show where they're defined and used
- Note this is a common and correct pattern
- Only mention if the user seems concerned about them
- Generally don't present these as issues unless asked

**For unused tokens:**

- List unused properties with their definitions
- Consider if they're legacy/deprecated or genuinely unused
- Suggest cleanup if there are many unused tokens

**For statistics:**

- Highlight the token coverage percentage
- Note if coverage is low (< 80%) or excellent (> 95%)
- Provide context about what the numbers mean
- Component-scoped properties don't count against token coverage

### 5. Suggest Next Steps

Based on findings, recommend actions:

**If undefined properties found WITH obvious typos:**

- "Would you like me to fix these typos?"
- Safe to offer automatic correction

**If undefined properties found WITHOUT obvious typos:**

- "These properties don't exist in your tokens. Would you like to:"
- "1. View the token files to choose the right one"
- "2. Add these as new tokens"
- "3. Replace with existing tokens (I'll show you the options)"
- **DO NOT** automatically suggest replacements

**If unused tokens found:**

- "Would you like me to help clean up unused tokens?"
- "Should I check if these are used elsewhere (JS, templates)?"
- "Do you want to mark these as deprecated?"

## Best Practices

**Token File Recognition:**

- Look for files with `:root` or custom property definitions
- Common locations: `tokens/`, `design-system/`, `styles/variables/`
- Respect naming conventions (tokens.css, \_variables.css, etc.)

**Validation Scope:**

- Start narrow (single component) before going wide (full project)
- Exclude vendor/third-party CSS from validation
- Consider build output vs. source files

**Result Presentation:**

- For small issues (< 10), list them all
- For large issues (> 20), summarize and ask if user wants full list
- Group related issues together (e.g., all color tokens)

**Suggestion Safety:**

- High similarity (> 0.85) typo suggestions: safe to auto-fix with confirmation
- Category token listings: require user selection, explain why
- Never substitute tokens without understanding context
- When in doubt, show options and let the user decide

**Follow-up Actions:**

- Never auto-fix without user confirmation
- Show diffs before applying changes
- Offer to create a validation report file

## Example Interactions

**Example 1: Obvious Typo**

```
User: "Check if Button.css is using the right tokens"

1. Run validator
2. Find: --spacing-meduim (similarity 0.93 to --spacing-md)
3. Present: "Found a typo: `--spacing-meduim` should probably be `--spacing-md`"
4. Suggest: "Would you like me to fix this?"
```

**Example 2: Semantic Choice Required**

```
User: "Validate Card.css tokens"

1. Run validator
2. Find: --color-primary-hover (doesn't exist)
3. Available color tokens found: --color-primary-dark, --color-primary-light, --color-accent
4. Present: "`--color-primary-hover` doesn't exist. Available color tokens:
   - --color-primary-dark
   - --color-primary-light
   - --color-accent

   Which one should be used for the hover state? Or should I add --color-primary-hover as a new token?"
5. Wait for user decision
```

**Example 3: Project Audit**

```
User: "Audit all our CSS for token usage"

1. Confirm scope: "Should I check all CSS files in the project?"
2. Run: scripts/validator.js --tokens "src/tokens/**/*.css" --css "src/**/*.css"
3. Present summary statistics first
4. Highlight critical issues (undefined properties)
5. Offer detailed report or specific fixes
```

## Tool Output Formats

**JSON Format** (for programmatic processing):
Complete structured data with all findings including typoSuggestions and categoryTokens

**Summary Format** (for quick overview):

```
Token Validation Summary
========================
Token Definitions:      120
Tokens Used:            98
Component-Scoped:       3
Undefined:              2
Unused Tokens:          22
Token Coverage:         81.7%
```

**Detailed Format** (for human reading):

```
Token Validation Report
======================
Token Coverage: 81.7% (98/120 tokens used)
Component-Scoped Properties: 3

Undefined Properties (2)
--------------------------------------------------
These properties are used but not defined anywhere.

--spacing-meduim
  Used in: Button.css:15
  Possible typo: --spacing-md

--color-primary-hover
  Used in: Button.css:23
  Available color tokens: --color-primary-dark, --color-primary-light, --color-accent

Component-Scoped Properties (1)
--------------------------------------------------
These properties are defined and used within component files.
This is a valid pattern and not an error.

--Button-hover-opacity
  Defined in: Button.css:7
  Used in: Button.css:15

Unused Tokens (22)
--------------------------------------------------
These tokens are defined but not used in the validated CSS files.

--spacing-xxl (defined in tokens/spacing.css:8)
...
```

## Technical Notes

The validator tool:

- Parses CSS using regex for maximum compatibility
- Handles nested `var()` functions
- Respects `--` prefix for custom properties
- Uses Levenshtein distance for typo detection (similarity > 0.85 = likely typo)
- Uses category detection for semantic suggestions (similarity < 0.85 = show options)
- Supports glob patterns for file matching
- Returns exit code 1 if undefined properties found (useful for CI/CD)
- **Distinguishes between token and component-scoped properties**

### Component-Scoped Properties

The validator recognizes that custom properties can be defined locally within component files. For example:

```css
/* Component file: Legend.css */
.legend {
  --Legend-block-end-margin: 1rem;
  margin-block-end: var(--Legend-block-end-margin);
}
```

This is a **valid and common pattern** for component-specific values that don't belong in the design system tokens. The validator will:

- Detect that `--Legend-block-end-margin` is defined in the same file
- Categorize it as "component-scoped" rather than "undefined"
- Not report it as an error
- Include it in informational output if detailed format is used

**When to use component-scoped properties:**

- Component-specific calculations or derived values
- Local state or variations within a component
- Values that shouldn't be reused elsewhere
- Temporary values during refactoring

**When to use design tokens:**

- Colors, spacing, typography from the design system
- Values that should be consistent across components
- Theme-able properties
- Shared constants

### Category Detection

The validator detects property categories (color, spacing, size, etc.) by analyzing property names:

- Extracts the prefix from the property name
- Matches against known categories
- Returns tokens in the same category

This provides semantically relevant suggestions instead of just string similarity.

## Limitations

- Does not analyze JavaScript usage of CSS variables (e.g., `getComputedStyle`)
- Does not validate values, only existence
- Cannot detect dynamically generated property names
- Does not follow `@import` statements
- Glob patterns require proper quoting in shell commands

## Additional Context

This skill is designed for projects using CSS custom properties as design tokens. It's particularly useful for:

- Component libraries with centralized token systems
- Design systems with strict token governance
- Projects migrating to token-based styling
- Codebases where token drift is a concern
- Quality gates in Claude Code hooks

The validator helps maintain consistency and catches issues before they reach production, while being smart enough to avoid false positives from component-scoped properties and providing context-aware suggestions instead of blind replacements.
