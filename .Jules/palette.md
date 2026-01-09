## 2024-05-22 - Custom Checkbox Accessibility
**Learning:** Custom "div-based" checkboxes are invisible to screen readers and keyboard users unless explicitly defined with `role="checkbox"`, `tabIndex="0"`, and `onKeyDown` handlers for Space/Enter keys.
**Action:** Always wrap custom interactive elements in semantic roles or use native inputs hidden with CSS where possible. When using custom divs, ensure full ARIA and keyboard support is added manually.

## 2024-05-22 - Environment-Dependent Rendering
**Learning:** Verification scripts (Playwright) can fail to visually verify UI if the underlying application crashes due to missing environment variables (e.g., Firebase keys), even if the UI code itself is correct.
**Action:** Ensure verification environments have necessary mock configurations or robust error boundaries to prevent blank screens during automated checks.
