# UI Coding Standards

## Component Library

**ONLY shadcn/ui components may be used for UI in this project.**

- Do NOT create custom UI components (buttons, inputs, dialogs, cards, etc.)
- Do NOT use other component libraries (e.g., MUI, Chakra, Radix directly, Headless UI)
- All UI primitives must come from shadcn/ui

### Adding Components

Install shadcn/ui components via the CLI:

```bash
npx shadcn@latest add <component-name>
# e.g.
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Installed components live in `src/components/ui/`. Do not modify these generated files.

### Usage

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

---

## Date Formatting

All date formatting must use **date-fns**.

### Required Format

Dates must be displayed using ordinal day + abbreviated month + full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

```ts
import { format } from "date-fns"

function formatDate(date: Date): string {
  const day = date.getDate()
  const ordinal = getOrdinal(day)
  return `${day}${ordinal} ${format(date, "MMM yyyy")}`
}

function getOrdinal(day: number): string {
  if (day >= 11 && day <= 13) return "th"
  switch (day % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}
```

- Do NOT use `toLocaleDateString`, `Intl.DateTimeFormat`, or manual string manipulation for display dates
- Do NOT use other date libraries (e.g., moment, dayjs)
- Always import from `date-fns`, not `date-fns/esm` or subpaths unless tree-shaking requires it
