#!/usr/bin/env node

/**
 * CSS Token Use Validator v2
 * 
 * Validates that CSS custom properties used in stylesheets are properly
 * defined in token files. Detects undefined properties, unused tokens,
 * component-scoped properties, and provides context-aware suggestions.
 * 
 * Usage:
 *   node validator.js --tokens "path/to/tokens/*.css" --css "path/to/files/*.css"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// =============================================================================
// Configuration and Arguments
// =============================================================================

function parseArguments() {
  const args = process.argv.slice(2);
  const config = {
    tokens: null,
    css: null,
    format: 'json',
    threshold: 0.7,
    ignore: []
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--tokens':
        config.tokens = nextArg;
        i++;
        break;
      case '--css':
        config.css = nextArg;
        i++;
        break;
      case '--format':
        config.format = nextArg;
        i++;
        break;
      case '--threshold':
        config.threshold = parseFloat(nextArg);
        i++;
        break;
      case '--ignore':
        config.ignore = nextArg.split(',').map(prop => prop.trim());
        i++;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  // Validate required arguments
  if (!config.tokens || !config.css) {
    console.error('Error: --tokens and --css arguments are required');
    printHelp();
    process.exit(1);
  }

  return config;
}

function printHelp() {
  console.log(`
CSS Token Use Validator

Usage:
  node validator.js --tokens <pattern> --css <pattern> [options]

Required:
  --tokens <pattern>    Glob pattern for token definition files
  --css <pattern>       Glob pattern for CSS files to validate

Options:
  --format <type>       Output format: json, summary, detailed (default: json)
  --threshold <float>   Similarity threshold for typos, 0-1 (default: 0.7)
  --ignore <list>       Comma-separated properties to ignore

Examples:
  node validator.js --tokens "src/tokens/*.css" --css "src/components/**/*.css"
  node validator.js --tokens "tokens/*.css" --css "Button.css" --format summary
  node validator.js --tokens "tokens/*.css" --css "src/**/*.css" --ignore "scrollbar-color"
  `);
}

// =============================================================================
// File Operations
// =============================================================================

async function findFiles(pattern) {
  try {
    // Use shell glob expansion via bash
    // This works reliably across all Node versions and is already available
    const command = `bash -c 'shopt -s globstar nullglob; for f in ${pattern}; do echo "$f"; done'`;
    const output = execSync(command, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    
    const files = output
      .trim()
      .split('\n')
      .filter(f => f.length > 0)
      .map(f => path.resolve(f));
    
    return files;
  } catch (error) {
    // If command fails or no files match, return empty array
    return [];
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file "${filePath}":`, error.message);
    return '';
  }
}

// =============================================================================
// CSS Parsing
// =============================================================================

/**
 * Extract custom property definitions from CSS content
 * Returns a map of property names to their definition locations
 */
function extractDefinitions(content, filePath) {
  const definitions = new Map();
  
  // Match custom property definitions: --property-name: value;
  // This regex handles:
  // - Properties in :root, selectors, or anywhere
  // - Multiline values
  // - Comments within values
  const propertyPattern = /(--[\w-]+)\s*:\s*[^;]+;/g;
  
  let match;
  while ((match = propertyPattern.exec(content)) !== null) {
    const propertyName = match[1];
    const position = match.index;
    
    // Calculate line number for better error reporting
    const lineNumber = content.substring(0, position).split('\n').length;
    
    if (!definitions.has(propertyName)) {
      definitions.set(propertyName, {
        property: propertyName,
        definedIn: `${path.basename(filePath)}:${lineNumber}`
      });
    }
  }
  
  return definitions;
}

/**
 * Extract custom property usage from CSS content
 * Returns a map of property names to their usage locations
 */
function extractUsage(content, filePath) {
  const usage = new Map();
  
  // Match var() functions: var(--property-name) or var(--property-name, fallback)
  // This regex handles:
  // - Nested var() functions
  // - Fallback values
  // - Multiple var() on same line
  const varPattern = /var\(\s*(--[\w-]+)(?:\s*,\s*[^)]+)?\)/g;
  
  let match;
  while ((match = varPattern.exec(content)) !== null) {
    const propertyName = match[1];
    const position = match.index;
    
    // Calculate line number
    const lineNumber = content.substring(0, position).split('\n').length;
    const location = `${path.basename(filePath)}:${lineNumber}`;
    
    if (!usage.has(propertyName)) {
      usage.set(propertyName, {
        property: propertyName,
        usedIn: []
      });
    }
    
    usage.get(propertyName).usedIn.push(location);
  }
  
  return usage;
}

// =============================================================================
// Analysis & Category Detection
// =============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo detection
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  // Calculate distances
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity between two strings (0 to 1)
 */
function calculateSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLength);
}

/**
 * Detect category from property name
 * Returns likely category prefix (color, spacing, etc.)
 */
function detectCategory(propertyName) {
  const parts = propertyName.toLowerCase().replace(/^--/, '').split('-');
  
  // Common category patterns
  const categories = [
    'color', 'background', 'border', 'text', 'font',
    'spacing', 'margin', 'padding', 'gap',
    'size', 'width', 'height', 'radius',
    'shadow', 'opacity', 'z-index', 'transition', 'animation'
  ];
  
  // Check if first part matches a category
  for (const category of categories) {
    if (parts[0] === category || parts[0].startsWith(category)) {
      return category;
    }
  }
  
  return null;
}

/**
 * Find tokens in the same category as the undefined property
 */
function findTokensByCategory(undefinedProperty, definitions) {
  const category = detectCategory(undefinedProperty);
  
  if (!category) {
    return [];
  }
  
  const categoryTokens = [];
  for (const definedProperty of definitions.keys()) {
    if (detectCategory(definedProperty) === category) {
      categoryTokens.push(definedProperty);
    }
  }
  
  return categoryTokens;
}

/**
 * Find potential typos by comparing undefined properties to defined ones
 * Returns object with typo suggestions and category matches
 */
function findSuggestions(undefinedProperty, definitions, threshold) {
  const typoSuggestions = [];
  
  // First, look for typos using Levenshtein distance
  for (const definedProperty of definitions.keys()) {
    const similarity = calculateSimilarity(undefinedProperty, definedProperty);
    
    if (similarity >= threshold && similarity < 1.0) {
      typoSuggestions.push({
        property: definedProperty,
        similarity: similarity
      });
    }
  }
  
  // Sort by similarity (highest first)
  typoSuggestions.sort((a, b) => b.similarity - a.similarity);
  
  const result = {
    typos: [],
    categoryTokens: []
  };
  
  // If typo similarity is very high (>= 0.85), it's likely a typo
  // Show ONLY typo suggestions
  if (typoSuggestions.length > 0 && typoSuggestions[0].similarity >= 0.85) {
    result.typos = typoSuggestions.slice(0, 3).map(s => s.property);
  } else {
    // Otherwise, show category matches for semantic selection
    result.categoryTokens = findTokensByCategory(undefinedProperty, definitions);
  }
  
  return result;
}

/**
 * Analyze token usage and generate report
 */
function analyzeTokens(tokenDefinitions, componentDefinitions, allDefinitions, usage, ignoredProperties, threshold) {
  const undefined = [];
  const componentScoped = [];
  const unused = [];
  
  // Find undefined and component-scoped properties
  for (const [propertyName, usageInfo] of usage.entries()) {
    if (ignoredProperties.includes(propertyName)) {
      continue;
    }
    
    // Check if property exists anywhere
    if (!allDefinitions.has(propertyName)) {
      // Truly undefined - not in tokens or component files
      const suggestions = findSuggestions(propertyName, tokenDefinitions, threshold);
      
      undefined.push({
        property: propertyName,
        usedIn: usageInfo.usedIn,
        typoSuggestions: suggestions.typos,
        categoryTokens: suggestions.categoryTokens
      });
    } else if (componentDefinitions.has(propertyName) && !tokenDefinitions.has(propertyName)) {
      // Component-scoped - defined in component file, not in tokens
      componentScoped.push({
        property: propertyName,
        definedIn: componentDefinitions.get(propertyName).definedIn,
        usedIn: usageInfo.usedIn
      });
    }
  }
  
  // Find unused token definitions (only check token files, not component-scoped)
  for (const [propertyName, definitionInfo] of tokenDefinitions.entries()) {
    if (!usage.has(propertyName)) {
      unused.push(definitionInfo);
    }
  }
  
  // Calculate statistics
  const totalTokens = tokenDefinitions.size;
  const totalComponentScoped = componentDefinitions.size;
  const tokensUsed = Array.from(usage.keys()).filter(prop => tokenDefinitions.has(prop)).length;
  const totalUndefined = undefined.length;
  const totalUnused = unused.length;
  const tokenCoverage = totalTokens > 0 
    ? ((tokensUsed / totalTokens) * 100).toFixed(1) 
    : 0;
  
  return {
    undefined,
    componentScoped,
    unused,
    stats: {
      totalTokens,
      totalComponentScoped,
      tokensUsed,
      totalUndefined,
      totalUnused,
      tokenCoverage: parseFloat(tokenCoverage)
    }
  };
}

// =============================================================================
// Output Formatting
// =============================================================================

function formatJSON(results) {
  return JSON.stringify(results, null, 2);
}

function formatSummary(results) {
  const { stats } = results;
  
  return `
Token Validation Summary
========================
Token Definitions:      ${stats.totalTokens}
Tokens Used:            ${stats.tokensUsed}
Component-Scoped:       ${stats.totalComponentScoped}
Undefined:              ${stats.totalUndefined}
Unused Tokens:          ${stats.totalUnused}
Token Coverage:         ${stats.tokenCoverage}%
`.trim();
}

function formatDetailed(results) {
  const { undefined, componentScoped, unused, stats } = results;
  let output = [];
  
  // Summary section
  output.push('Token Validation Report');
  output.push('======================');
  output.push('');
  output.push(`Token Coverage: ${stats.tokenCoverage}% (${stats.tokensUsed}/${stats.totalTokens} tokens used)`);
  output.push(`Component-Scoped Properties: ${stats.totalComponentScoped}`);
  output.push('');
  
  // Undefined properties section (true errors)
  if (undefined.length > 0) {
    output.push(`Undefined Properties (${undefined.length})`);
    output.push('-'.repeat(50));
    output.push('These properties are used but not defined anywhere.');
    output.push('');
    
    for (const item of undefined) {
      output.push(`${item.property}`);
      output.push(`  Used in: ${item.usedIn.join(', ')}`);
      
      // Show either typo suggestions OR category tokens, not both
      if (item.typoSuggestions.length > 0) {
        output.push(`  Likely typo - did you mean: ${item.typoSuggestions.join(', ')}`);
      } else if (item.categoryTokens.length > 0) {
        const category = detectCategory(item.property);
        const tokenList = item.categoryTokens.slice(0, 5).join(', ');
        const more = item.categoryTokens.length > 5 ? ` (and ${item.categoryTokens.length - 5} more)` : '';
        output.push(`  Available ${category} tokens: ${tokenList}${more}`);
      } else {
        output.push(`  No similar tokens found`);
      }
      
      output.push('');
    }
  } else {
    output.push('✓ No undefined properties found');
    output.push('');
  }
  
  // Component-scoped properties section (informational)
  if (componentScoped.length > 0) {
    output.push(`Component-Scoped Properties (${componentScoped.length})`);
    output.push('-'.repeat(50));
    output.push('These properties are defined and used within component files.');
    output.push('This is a valid pattern and not an error.');
    output.push('');
    
    for (const item of componentScoped) {
      output.push(`${item.property}`);
      output.push(`  Defined in: ${item.definedIn}`);
      output.push(`  Used in: ${item.usedIn.join(', ')}`);
      output.push('');
    }
  }
  
  // Unused tokens section
  if (unused.length > 0) {
    output.push(`Unused Tokens (${unused.length})`);
    output.push('-'.repeat(50));
    output.push('These tokens are defined but not used in the validated CSS files.');
    output.push('');
    
    for (const item of unused) {
      output.push(`${item.property} (defined in ${item.definedIn})`);
    }
    
    output.push('');
  } else {
    output.push('✓ No unused tokens found');
    output.push('');
  }
  
  return output.join('\n');
}

// =============================================================================
// Main Execution
// =============================================================================

async function main() {
  const config = parseArguments();
  
  console.error('Starting validation...');
  
  // Find all token and CSS files
  console.error(`Finding token files: ${config.tokens}`);
  const tokenFiles = await findFiles(config.tokens);
  
  console.error(`Finding CSS files: ${config.css}`);
  const cssFiles = await findFiles(config.css);
  
  if (tokenFiles.length === 0) {
    console.error('Error: No token files found');
    process.exit(1);
  }
  
  if (cssFiles.length === 0) {
    console.error('Error: No CSS files found');
    process.exit(1);
  }
  
  console.error(`Found ${tokenFiles.length} token file(s)`);
  console.error(`Found ${cssFiles.length} CSS file(s)`);
  
  // Extract all token definitions (from token files)
  const tokenDefinitions = new Map();
  
  for (const filePath of tokenFiles) {
    const content = readFileContent(filePath);
    const definitions = extractDefinitions(content, filePath);
    
    // Merge into token definitions map
    for (const [key, value] of definitions.entries()) {
      if (!tokenDefinitions.has(key)) {
        tokenDefinitions.set(key, { ...value, source: 'token' });
      }
    }
  }
  
  console.error(`Extracted ${tokenDefinitions.size} token definition(s)`);
  
  // Extract component-scoped definitions (from CSS files being validated)
  const componentDefinitions = new Map();
  
  for (const filePath of cssFiles) {
    const content = readFileContent(filePath);
    const definitions = extractDefinitions(content, filePath);
    
    // Merge into component definitions map
    for (const [key, value] of definitions.entries()) {
      if (!componentDefinitions.has(key)) {
        componentDefinitions.set(key, { ...value, source: 'component' });
      }
    }
  }
  
  console.error(`Extracted ${componentDefinitions.size} component-scoped definition(s)`);
  
  // Combine all definitions for lookup
  const allDefinitions = new Map([...tokenDefinitions, ...componentDefinitions]);
  
  // Extract all property usage
  const allUsage = new Map();
  
  for (const filePath of cssFiles) {
    const content = readFileContent(filePath);
    const usage = extractUsage(content, filePath);
    
    // Merge into global usage map
    for (const [key, value] of usage.entries()) {
      if (!allUsage.has(key)) {
        allUsage.set(key, value);
      } else {
        // Append usage locations
        allUsage.get(key).usedIn.push(...value.usedIn);
      }
    }
  }
  
  console.error(`Extracted ${allUsage.size} property usage(s)`);
  
  // Analyze and generate report
  const results = analyzeTokens(
    tokenDefinitions,
    componentDefinitions,
    allDefinitions, 
    allUsage, 
    config.ignore, 
    config.threshold
  );
  
  // Format output
  let output;
  switch (config.format) {
    case 'summary':
      output = formatSummary(results);
      break;
    case 'detailed':
      output = formatDetailed(results);
      break;
    case 'json':
    default:
      output = formatJSON(results);
      break;
  }
  
  console.log(output);
  
  // Exit with error code if truly undefined properties found (useful for CI/CD)
  if (results.undefined.length > 0) {
    console.error(`\nValidation failed: ${results.undefined.length} undefined properties`);
    process.exit(1);
  }
  
  console.error('\nValidation completed successfully');
  process.exit(0);
}

// Run the validator
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
