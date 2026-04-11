#!/bin/bash

# CSS Token Validator - Claude Code Hook Script
# Validates CSS custom property usage after file edits
# 
# This script is called by the PostToolUse hook after CSS files are edited.
# It auto-detects token directories and runs validation, feeding results
# back to the agent for immediate action.

set -e

# ============================================================================
# Configuration
# ============================================================================

# Default token directory patterns (checked in order)
TOKEN_PATTERNS=(
  "src/tokens/**/*.css"
  "tokens/**/*.css"
  "design-system/tokens/**/*.css"
)

# Output format (json, summary, or detailed)
FORMAT="${CSS_VALIDATOR_FORMAT:-detailed}"

# Similarity threshold for typo detection (0-1)
THRESHOLD="${CSS_VALIDATOR_THRESHOLD:-0.7}"

# ============================================================================
# Main Execution
# ============================================================================

# Extract the CSS file path from CLAUDE_FILE_PATHS
FILE_PATH=$(echo "$CLAUDE_FILE_PATHS" | tr " " "\n" | grep "\.css$" | head -1)

# Exit if no CSS file found
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Get project directory
PROJECT_DIR="$CLAUDE_PROJECT_DIR"

# Find token directory
TOKENS=""
for pattern in "${TOKEN_PATTERNS[@]}"; do
  # Extract the base directory from the pattern
  base_dir=$(echo "$pattern" | cut -d'/' -f1)
  
  if [ -d "$PROJECT_DIR/$base_dir" ]; then
    TOKENS="$PROJECT_DIR/$pattern"
    break
  fi
done

# Exit silently if no token directory found
if [ -z "$TOKENS" ]; then
  exit 0
fi

# Path to validator script
VALIDATOR="$PROJECT_DIR/.claude/skills/css-token-use-validator/validator.js"

# Check if validator exists
if [ ! -f "$VALIDATOR" ]; then
  echo "Error: Validator not found at $VALIDATOR" >&2
  exit 1
fi

# Run validation
node "$VALIDATOR" \
  --tokens "$TOKENS" \
  --css "$FILE_PATH" \
  --format "$FORMAT" \
  --threshold "$THRESHOLD" \
  2>&1

# Exit with validation result
exit $?
