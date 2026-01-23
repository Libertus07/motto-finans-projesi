---
name: ts-fixer
description: Guidelines for resolving recurring TypeScript errors in the MottoPos project.
---

# TS Fixer Skill

Use this skill to efficiently resolve TypeScript errors reported by `tsc`. This project has specific patterns for data models (Firebase) and component props.

## 🛠️ Common Fix Patterns

### 1. Missing Properties on Types (TS2339)
Often occurs when raw Firebase data is used or when an interface is incomplete.
- **Fix**: Check `src/types/index.ts` and add the missing property to the relevant interface (e.g., `Transaction`, `Product`, `Order`).
- **Quick Fix (if temporary)**: Use a type assertion `(data as any).property` or better, define a local interface.

### 2. Type Mismatch: String vs Number (TS2322)
Common in form inputs or ID handling.
- **Fix**: Wrap numeric values in `Number()` or use `parseInt(val, 10)`. Ensure Firestore `increment()` is only used on numeric fields.

### 3. Array Incompatibility (TS2322)
E.g., `CartItem[]` vs `OrderItem[]`.
- **Fix**: Map the array to the correct shape:
```tsx
const orderItems: OrderItem[] = cartItems.map(item => ({
  productId: item.id,
  name: item.name,
  // ...other fields
}));
```

### 4. Payment Methods & Enums
The project uses specific unions for `PaymentMethod`.
- **Note**: If `"iban"` or a new method is missing, update the `PaymentMethod` type in `src/types/index.ts`.

### 5. Environment Variables
If `import.meta.env` errors occur:
- **Fix**: Ensure `vite-client` is in the `types` array of `tsconfig.json`.

## 🛡️ Best Practices
- **Avoid `any`**: Use `unknown` or define a partial interface if the full type is unknown.
- **Type Guards**: Use `if ('prop' in obj)` to safe-check before access.
- **Interface Alignment**: Ensure `src/types` remains the single source of truth for shared models.
