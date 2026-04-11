---
name: playwright-best-practices
description: Comprehensive playwright testing best practices including ARIA snapshot testing for structural validation. Use when asked to "write playwright tests", "validate page structure", "test accessibility", "improve playwright test quality", "review playwright test code", or "advise on playwright test architecture".
license: MIT
---

# Playwright Testing Best Practices

## Description

This skill teaches WHAT makes good tests and WHY certain patterns prevent failures. Provides the decision-making framework behind test structure, locator selection, assertion strategies, and debugging approaches. Works in conjunction with playwright-cli skill (which teaches HOW to execute commands). Apply when planning test strategy, choosing between ARIA snapshots vs individual locators, structuring assertions, debugging test failures, reviewing test code, or advising on test architecture. Emphasizes ARIA snapshot testing for structural validation, user-visible behavior testing, locator resilience hierarchy, web-first assertion patterns, test isolation principles, and production-proven debugging strategies.

## Core Testing Philosophy

### Test User-Visible Behavior

**Principle**: Tests should verify what end users experience, not implementation details.

**Rules**:

- Focus on rendered output that users can see and interact with
- Avoid testing internal function names, data structures, or CSS class names
- Test the same interface that users experience
- Don't assert on implementation details that could change without affecting user experience

**Anti-patterns**:

```javascript
// ❌ Testing implementation details
expect(component.internalState.items).toBeArray();
expect(element.className).toBe("btn-primary");

// ✅ Testing user-visible behavior
await expect(page.getByRole("list")).toBeVisible();
await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();
```

### Test Isolation

**Principle**: Each test must run independently with its own state.

**Critical Requirements**:

- Every test gets fresh local storage, session storage, data, and cookies
- Tests cannot depend on execution order or state from other tests
- Each test should be able to run alone without setup from other tests

**Benefits**:

- Improves reproducibility
- Makes debugging easier
- Prevents cascading failures
- Allows parallel execution

**Implementation Patterns**:

```javascript
// ✅ Use beforeEach for common setup
test.beforeEach(async ({ page }) => {
  await page.goto("https://example.com/login");
  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("pass");
  await page.getByRole("button", { name: "Sign in" }).click();
});

test("first test", async ({ page }) => {
  // Fresh signed-in state
});

test("second test", async ({ page }) => {
  // Independent signed-in state
});
```

**Advanced Pattern - Setup Projects**:

- For expensive operations like authentication, use setup projects
- Log in once, save state, reuse across tests
- Dramatically improves test suite performance
- See Playwright auth documentation for implementation

**When Duplication is OK**:

- Simple tests where beforeEach adds complexity
- When it improves test clarity and readability
- When it makes tests more self-contained

### Avoid Third-Party Dependencies

**Principle**: Only test code you control.

**Rules**:

- Never navigate to external sites you don't control
- Don't test third-party APIs directly
- Mock external dependencies instead

**Why This Matters**:

- External sites can have cookie banners, overlays, downtime
- Content can change unexpectedly
- Slows down test execution
- Creates flaky tests

**Solution - Use Network Mocking**:

```javascript
// ✅ Mock third-party responses
await page.route("**/api/external-service", (route) =>
  route.fulfill({
    status: 200,
    body: JSON.stringify(expectedData),
  }),
);
await page.goto("https://example.com");
```

## ARIA Snapshot Testing

### What Are ARIA Snapshots?

**Definition**: ARIA snapshots provide a YAML representation of the accessibility tree - the semantic structure assistive technologies see.

**Why This Is Powerful**:

- Tests what actually matters: semantic structure and accessibility
- Survives CSS refactoring and styling changes
- Catches accessibility regressions automatically
- More resilient than pixel-based visual testing
- Documents expected page structure in human-readable format
- Single assertion can validate entire page regions

### The Core Pattern

```javascript
// Assert entire page structure matches
await expect(page.locator("body")).toMatchAriaSnapshot(`
  - banner:
    - heading "Welcome to Our Site" [level=1]
    - navigation:
      - link "Home"
      - link "About"
      - link "Contact"
  - main:
    - region "Featured Content":
      - heading "Latest News" [level=2]
      - list:
        - listitem: link "Article 1"
        - listitem: link "Article 2"
`);
```

### Why ARIA Snapshots Over Individual Assertions

**Traditional approach** (brittle):

```javascript
// ❌ Many fragile assertions
await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome");
await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
await expect(page.getByRole("link", { name: "About" })).toBeVisible();
await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();
// Breaks if order changes, doesn't validate hierarchy
```

**ARIA snapshot approach** (resilient):

```javascript
// ✅ Single assertion validates structure, hierarchy, and content
await expect(page.locator("nav")).toMatchAriaSnapshot(`
  - navigation:
    - link "Home"
    - link "About"
    - link "Contact"
`);
// Survives styling changes, validates semantic relationships
```

### YAML Format Guide

**Basic structure**:

```yaml
- role "accessible name" [attributes]:
    - child role "name"
    - child role "name"
```

**Role**: ARIA role (heading, button, link, navigation, list, etc.)

**Accessible name**: Text users hear from screen readers (in quotes)

**Attributes**: ARIA attributes in square brackets

- `[level=1]` - heading level
- `[checked]` or `[checked=true]` - checkbox state
- `[disabled]` - disabled state
- `[expanded=true]` - expanded state
- `[pressed=true]` - toggle button state

**Examples**:

```javascript
// Heading with level
- heading "Dashboard" [level=1]

// Button with state
- button "Menu" [expanded=true]

// Checkbox checked
- checkbox "Accept terms" [checked]

// Disabled input
- textbox "Email" [disabled]

// List structure
- list "Todo Items":
  - listitem: checkbox "Buy groceries"
  - listitem: checkbox "Call mom" [checked]
  - listitem: checkbox "Write tests"
```

### Partial Matching Strategy

**Default behavior - subset matching**:

```javascript
// By default, matches if specified children exist (subset match)
await expect(page.locator("ul")).toMatchAriaSnapshot(`
  - list:
    - listitem: text "Feature A"
    - listitem: text "Feature C"
`);
// ✅ Passes even if Feature B exists between them
// ✅ Passes even if more items exist after Feature C
```

**Control child matching with /children property**:

The `/children` property controls how strictly child elements are matched:

**1. Subset matching (default)**:

```javascript
await expect(page.locator("ul")).toMatchAriaSnapshot(`
  - list:
    /children:
    - listitem: text "Feature A"
    - listitem: text "Feature B"
`);
// ✅ Matches if A and B exist in order
// ✅ Other items can exist before, between, or after
```

**2. Exact matching with `deep-equal`**:

```javascript
await expect(page.locator("ul")).toMatchAriaSnapshot(`
  - list:
    /children: deep-equal
    - listitem: text "Feature A"
    - listitem: text "Feature B"
    - listitem: text "Feature C"
`);
// ✅ Only passes if exactly these 3 items exist in this exact order
// ❌ Fails if Feature D exists
// ❌ Fails if order changes
```

**3. No children validation**:

```javascript
await expect(page.locator("nav")).toMatchAriaSnapshot(`
  - navigation
`);
// ✅ Validates role exists
// ✅ Doesn't check any children at all
```

**When to use each mode**:

**Subset (default)** - Most flexible:

- Dynamic lists where count varies
- Checking specific items exist
- When order matters but count doesn't

```javascript
// Check shopping cart has key items, ignore quantity
- region "Cart":
  - listitem: text "Laptop"
  - listitem: text "Mouse"
  // Other items OK, we just care these exist
```

**deep-equal** - Most strict:

- Fixed navigation structures
- Known static content
- When exact structure matters

```javascript
// Main navigation must be exactly this
- navigation:
  /children: deep-equal
  - link "Home"
  - link "Products"
  - link "About"
  - link "Contact"
  // Fails if "Careers" link is added
```

**No children** - Structure only:

- When children are completely dynamic
- Just validating container exists

```javascript
// User feed could have any number of posts
- main:
  - region "Feed"
    // Don't validate children at all
```

**Partial matching by omitting attributes**:

```javascript
// Match structure regardless of checkbox state
await expect(page.locator("form")).toMatchAriaSnapshot(`
  - checkbox "Remember me"
  - button "Sign in"
`);
// ✅ Passes whether checkbox is checked or unchecked
```

**Use regex for dynamic content**:

```javascript
await expect(page.locator("header")).toMatchAriaSnapshot(`
  - banner:
    - heading /Welcome, .+/ [level=1]
    - text /Last login: \\d{4}-\\d{2}-\\d{2}/
`);
// Matches any username and date pattern
```

### When to Use ARIA Snapshots

**Use ARIA snapshots for**:

- Page layout validation (header, nav, main, footer structure)
- Form structure testing (labels, inputs, buttons in correct hierarchy)
- List and table structures
- Navigation menus
- Modal dialogs and their contents
- Component structure validation
- Accessibility compliance checks
- Regression detection for structural changes

**Use individual locators for**:

- Specific interactions (clicking, typing)
- Dynamic state changes
- Conditional logic in tests
- Precise timing requirements

**Combine both**:

```javascript
// Validate structure
await expect(page.locator("dialog")).toMatchAriaSnapshot(`
  - dialog "Confirm Action":
    - heading "Are you sure?" [level=2]
    - text "This action cannot be undone"
    - button "Cancel"
    - button "Confirm"
`);

// Then interact with specific elements
await page.getByRole("button", { name: "Confirm" }).click();
```

### Snapshot Generation Workflow

**Generate snapshot on first run**:

```javascript
// Write test with empty string
await expect(page.locator("nav")).toMatchAriaSnapshot(``);

// Run with update flag
// npx playwright test --update-snapshots

// Playwright generates snapshot automatically
```

**Update snapshots after changes**:

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Short form
npx playwright test -u
```

**Review generated snapshots**:

- Playwright creates patch files showing differences
- Review patches before committing
- Ensures structural changes are intentional
- Documents evolution of page structure

### Common Patterns

**Page layout validation**:

```javascript
test("homepage structure", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toMatchAriaSnapshot(`
    - banner:
      - link "Company Logo"
      - navigation:
        - link "Products"
        - link "About"
        - link "Contact"
    - main:
      - region "Hero":
        - heading "Transform Your Business" [level=1]
        - button "Get Started"
    - contentinfo:
      - text "© 2024 Company Name"
  `);
});
```

**Form structure testing**:

```javascript
test("registration form", async ({ page }) => {
  await page.goto("/register");

  await expect(page.locator("form")).toMatchAriaSnapshot(`
    - textbox "Email"
    - textbox "Password" [type="password"]
    - textbox "Confirm Password" [type="password"]  
    - checkbox "I agree to the terms"
    - button "Create Account"
  `);
});
```

**Table structure validation**:

```javascript
test("data table structure", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.locator("table")).toMatchAriaSnapshot(`
    - table:
      - rowgroup:
        - row:
          - columnheader "Name"
          - columnheader "Email"
          - columnheader "Status"
      - rowgroup:
        - row:
          - cell "John Doe"
          - cell "john@example.com"
          - cell "Active"
  `);
});
```

**Modal dialog validation**:

```javascript
test("confirmation dialog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Delete" }).click();

  await expect(page.locator("role=dialog")).toMatchAriaSnapshot(`
    - dialog "Confirm Deletion":
      - heading "Delete Item?" [level=2]
      - text "This action cannot be undone"
      - group "Actions":
        - button "Cancel"
        - button "Delete" [pressed=true]
  `);
});
```

### Integration with Accessibility Testing

**ARIA snapshots enforce accessibility**:

- Elements must have proper ARIA roles
- Interactive elements need accessible names
- Heading hierarchy must be correct
- Form inputs must be labeled
- Lists must use proper structure

**Example - catches accessibility issues**:

```html
<!-- Bad HTML - no accessible name -->
<button>
  <svg><path d="..." /></svg>
</button>
```

```javascript
// Snapshot test fails - button has no accessible name
await expect(page.locator("button")).toMatchAriaSnapshot(`
  - button "Delete"  // ❌ Fails - actual button has no name
`);
```

Forces fix:

```html
<!-- Good HTML - accessible name provided -->
<button aria-label="Delete">
  <svg><path d="..." /></svg>
</button>
```

### Best Practices

**Scope snapshots appropriately**:

```javascript
// ✅ Good - specific region
await expect(page.locator('nav')).toMatchAriaSnapshot(...)

// ❌ Too broad - entire page
await expect(page.locator('body')).toMatchAriaSnapshot(...)

// ✅ Better - specific sections
await expect(page.locator('header')).toMatchAriaSnapshot(...)
await expect(page.locator('main')).toMatchAriaSnapshot(...)
```

**Use partial matching for dynamic content**:

```javascript
// Shopping cart with variable item count
await expect(page.locator("aside")).toMatchAriaSnapshot(`
  - region "Cart":
    - heading /Cart \\(\\d+ items?\\)/ [level=2]
    - list:
      - listitem: text /.*/ 
      // Validates structure without checking all items
`);
```

**Combine with web-first assertions**:

```javascript
// Validate structure exists
await expect(page.locator("form")).toMatchAriaSnapshot(`
  - textbox "Email"
  - button "Submit"
`);

// Then validate dynamic states
await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();
```

**Version control snapshots**:

- Commit snapshot files with code
- Review snapshot changes in PRs
- Treat snapshot updates as structural changes
- Document why snapshots changed

## Locator Strategy Framework

### The Locator Resilience Hierarchy

**Always choose the highest priority locator that works**.

This hierarchy is based on production experience with test maintenance:

1. **Role-based locators** (HIGHEST PRIORITY)
   - Most resilient to UI changes
   - Aligned with accessibility best practices
   - Self-documenting

   ```javascript
   page.getByRole("button", { name: "Submit" });
   page.getByRole("textbox", { name: "Email" });
   page.getByRole("heading", { name: "Dashboard" });
   ```

2. **Label associations**
   - Resilient and semantically meaningful
   - Follows form best practices

   ```javascript
   page.getByLabel("Password");
   page.getByLabel("Remember me");
   ```

3. **Placeholder text**
   - Good for inputs when labels aren't available
   - Less stable than labels

   ```javascript
   page.getByPlaceholder("Enter email address");
   ```

4. **Text content**
   - Good for unique text
   - Can break if copy changes

   ```javascript
   page.getByText("Welcome back");
   ```

5. **Test IDs** (when semantic options aren't available)
   - Stable but requires code changes
   - Use data-testid attribute

   ```javascript
   page.getByTestId("submit-button");
   ```

6. **XPath/CSS selectors** (LAST RESORT)
   - Most fragile
   - Only when nothing else works
   - Document why you need them

### Why This Order Matters

**Role-based locators win because**:

- They survive CSS refactoring
- They survive DOM restructuring
- They survive text changes (use name option)
- They align with how users actually interact
- They encourage accessible markup

**CSS classes lose because**:

```javascript
// ❌ Breaks when designer changes styles
page.locator(".btn-primary.submit-button.large");

// ✅ Survives style refactoring
page.getByRole("button", { name: "Submit Order" });
```

**Deep DOM paths lose because**:

```javascript
// ❌ Breaks when structure changes
page.locator("div.container > section > form > button:nth-child(3)");

// ✅ Survives restructuring
page.getByRole("form", { name: "Checkout" }).getByRole("button", { name: "Submit" });
```

### Chaining and Filtering Patterns

**Narrow scope to reduce brittleness**:

```javascript
// ✅ Chain to narrow context - more resilient
const product = page.getByRole("listitem").filter({ hasText: "Product 2" });

await product.getByRole("button", { name: "Add to cart" }).click();
```

**Filtering Strategies**:

```javascript
// Filter by text content
.filter({ hasText: 'Premium' })

// Filter by another locator (element contains specific child)
.filter({ has: page.getByRole('button', { name: 'Delete' }) })

// Exclude elements
.filter({ hasNotText: 'Sold out' })

// Combine filters
.filter({ hasText: 'Premium' })
.filter({ has: page.getByRole('img') })
```

### Locator Generation Strategy

**Never hand-write complex locators** - use codegen to discover optimal selectors:

```bash
# Generate locator for specific element
npx playwright codegen https://example.com
# Then use Inspector's "Pick Locator" feature
```

**Why generation beats hand-writing**:

- Playwright knows the full context of the page
- It tests uniqueness automatically
- It prioritizes according to best practices
- It handles edge cases (multiple matches, hidden elements)

**When to regenerate locators**:

- After UI refactoring
- When tests become flaky
- When selectors feel brittle
- During test review

## Web-First Assertions

### The Core Pattern: Always Await Expect

**Critical Rule**: Use web-first assertions that wait and retry.

```javascript
// ✅ Web-first assertion - waits automatically
await expect(page.getByText("welcome")).toBeVisible();

// ❌ Manual check - no waiting, no retry
expect(await page.getByText("welcome").isVisible()).toBe(true);
```

### Why Manual Assertions Fail

**The timing problem**:

```javascript
// ❌ WRONG - checks exactly once
const visible = await page.getByText("welcome").isVisible();
expect(visible).toBe(true);
```

What happens:

1. Queries element at that exact millisecond
2. If not ready, returns false immediately
3. Test fails even though element appears 100ms later
4. Creates flaky tests that fail randomly

**The web-first solution**:

```javascript
// ✅ RIGHT - polls until timeout
await expect(page.getByText("welcome")).toBeVisible();
```

What happens:

1. Queries element repeatedly
2. Waits up to 5 seconds (default timeout)
3. Retries if element isn't ready
4. Only fails if truly never appears
5. Much more stable

### Assertion Strategy Guide

**Visibility Assertions**:

```javascript
await expect(locator).toBeVisible(); // Element is visible
await expect(locator).toBeHidden(); // Element is not visible
```

**State Assertions**:

```javascript
await expect(locator).toBeEnabled(); // Interactive element enabled
await expect(locator).toBeDisabled(); // Interactive element disabled
await expect(locator).toBeChecked(); // Checkbox/radio checked
await expect(locator).toBeFocused(); // Element has keyboard focus
```

**Content Assertions**:

```javascript
await expect(locator).toHaveText("exact text"); // Exact match
await expect(locator).toContainText("partial"); // Substring match
await expect(locator).toHaveValue("input value"); // Input value
await expect(locator).toHaveAttribute("href", "/about"); // Attribute value
```

**Collection Assertions**:

```javascript
await expect(locator).toHaveCount(5); // Exact number of elements
```

**Advanced Patterns**:

```javascript
// Multiple conditions
await expect(locator).toBeVisible();
await expect(locator).toHaveClass(/active/);

// Negation
await expect(locator).not.toBeVisible();

// Custom timeout for slow operations
await expect(locator).toBeVisible({ timeout: 10000 });
```

### Soft Assertions Pattern

**Use case**: Check multiple conditions without stopping on first failure.

```javascript
// Continue test even if assertions fail
await expect.soft(page.getByTestId("status")).toHaveText("Success");
await expect.soft(page.getByTestId("count")).toHaveText("42");
await expect.soft(page.getByTestId("user")).toHaveText("John");

// Test continues - all failures reported at end
await page.getByRole("link", { name: "next" }).click();
```

**When to use**:

- Checking multiple independent conditions
- Form validation with many fields
- Visual regression checks across page
- Gathering comprehensive failure information

**Important**: All failures compile and display once test completes.

## Debugging Strategy Framework

### Debugging Decision Tree

**When test fails, follow this sequence**:

1. **Check the failure message** - What assertion failed?
2. **Verify locator still matches** - Did UI change?
3. **Check timing** - Did content appear after timeout?
4. **Inspect network** - Did API call fail?
5. **Review auto-wait logs** - What actionability check failed?

### Parallelism Strategy

**Default behavior**:

- Tests in different files run in parallel
- Tests in same file run sequentially
- Each test gets isolated browser context

**Enable file-level parallelism**:

```javascript
test.describe.configure({ mode: "parallel" });

test("runs concurrently 1", async ({ page }) => {});
test("runs concurrently 2", async ({ page }) => {});
```

**When to use**:

- Many independent tests in one file
- No shared state between tests
- Tests are truly isolated

## Common Patterns and Edge Cases

### Dynamic Content Patterns

```javascript
// ✅ Web-first assertions handle delays automatically
await expect(page.getByText("Loaded")).toBeVisible();

// ❌ Don't add manual waits
await page.waitForTimeout(2000); // brittle, arbitrary
```

### Multiple Elements Pattern

```javascript
// Get count
const items = page.getByRole("listitem");
const count = await items.count();

// Iterate
for (let i = 0; i < (await items.count()); i++) {
  await items.nth(i).click();
}

// Filter and act on first match
await page.getByRole("listitem").filter({ hasText: "Premium" }).first().click();
```

### Form Interaction Patterns

```javascript
// Text inputs
await page.getByLabel("Email").fill("user@example.com");

// Clear and fill
await page.getByLabel("Email").clear();
await page.getByLabel("Email").fill("new@example.com");

// Checkboxes
await page.getByLabel("Subscribe").check();
await page.getByLabel("Unsubscribe").uncheck();

// Radio buttons (check the one you want)
await page.getByLabel("Option A").check();

// Select dropdowns
await page.getByLabel("Country").selectOption("USA");
await page.getByLabel("Country").selectOption({ label: "United States" });

// File uploads
await page.getByLabel("Upload").setInputFiles("file.pdf");
await page.getByLabel("Upload").setInputFiles(["file1.pdf", "file2.pdf"]);
```

### Network Request Patterns

```javascript
// Wait for specific request
const request = page.waitForRequest("**/api/data");
await page.getByRole("button", { name: "Load" }).click();
await request;

// Wait for response
const response = page.waitForResponse("**/api/data");
await page.getByRole("button", { name: "Load" }).click();
await response;

// Mock API response
await page.route("**/api/data", (route) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  }),
);
```

### Navigation Patterns

```javascript
// Wait for navigation to complete
await page.goto("https://example.com", {
  waitUntil: "networkidle", // or 'load', 'domcontentloaded'
});

// Click and wait for navigation
await Promise.all([page.waitForNavigation(), page.getByRole("link", { name: "Next" }).click()]);

// Wait for URL pattern
await page.waitForURL("**/dashboard");
```

## Anti-Patterns to Avoid

### Never Use Arbitrary Waits

```javascript
// ❌ NEVER do this
await page.waitForTimeout(5000);

// ✅ Use web-first assertions
await expect(page.getByText("Loaded")).toBeVisible();
```

**Why**:

- Arbitrary waits make tests slower than necessary
- Still flaky if content takes longer than wait
- No indication of what you're waiting for

### Don't Chain Promises Manually

```javascript
// ❌ Manual promise handling
page
  .getByRole("button")
  .click()
  .then(() => {
    return page.getByText("Success").isVisible();
  });

// ✅ Use async/await
await page.getByRole("button").click();
await expect(page.getByText("Success")).toBeVisible();
```

### Don't Re-Query the Same Element

```javascript
// ❌ Querying multiple times
await page.getByRole("button", { name: "Submit" }).click();
await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();

// ✅ Store locator, more efficient
const submitBtn = page.getByRole("button", { name: "Submit" });
await submitBtn.click();
await expect(submitBtn).toBeDisabled();
```

### Don't Test Implementation Details

```javascript
// ❌ Testing internal state
expect(component._internalState).toBe("loading");
expect(element.className).toContain("loading");

// ✅ Test user-visible behavior
await expect(page.getByRole("status")).toHaveText("Loading...");
await expect(page.getByRole("progressbar")).toBeVisible();
```

### Don't Use Non-Resilient Selectors

```javascript
// ❌ CSS classes
page.locator(".btn-primary");

// ❌ Deep DOM paths
page.locator("div > section > form > button:nth-child(3)");

// ❌ Generic selectors
page.locator("button");

// ✅ Role-based with name
page.getByRole("button", { name: "Submit Order" });
```

## Integration with playwright-cli

This best practices skill provides the **decision-making framework** for using playwright-cli effectively. When using playwright-cli:

**Apply ARIA snapshot strategy first**:

- Start with ARIA snapshots for broad structural validation
- Use `snapshot` command to visualize page structure
- Validates semantic structure and accessibility in single assertion
- More resilient than individual locator checks

**Apply locator hierarchy**:

- Use `snapshot` to explore page structure
- Choose highest-priority locator from the hierarchy
- Prefer role-based refs over CSS-based refs

**Apply assertion strategy**:

- After actions, verify state with appropriate assertions
- Use web-first assertion patterns in generated code
- Don't rely on manual timing

**Apply debugging framework**:

- Use `console` and `network` commands to diagnose
- Follow debugging decision tree
- Capture traces for complex failures

**Apply test isolation**:

- Use sessions to separate test contexts
- Don't let state leak between test scenarios
- Mock external dependencies with route commands

## When to Apply This Skill

**Trigger Scenarios**:

- Planning test strategy for new features
- Validating page structure and accessibility
- Choosing between ARIA snapshots vs individual locators
- Choosing locators during test creation
- Reviewing test code for resilience
- Debugging flaky or failing tests
- Optimizing test suite performance
- Advising on test architecture
- Setting up CI/CD test pipelines
- Evaluating test quality and maintainability

**Key Indicators**:

- Questions about ARIA snapshot usage
- Discussion of structural validation
- Questions about locator selection
- Discussion of test reliability
- Debugging test failures
- Test review and refactoring
- CI/CD configuration for tests
- Test suite optimization
- Cross-browser testing strategy
- Accessibility compliance questions

**Output Quality Markers**:

- Uses ARIA snapshots for structural validation
- Uses role-based locators over CSS selectors
- Employs web-first assertions consistently
- Implements proper test isolation
- Mocks external dependencies
- Follows locator resilience hierarchy
- Applies debugging decision tree
- Tests across multiple browsers
- Validates accessibility automatically
