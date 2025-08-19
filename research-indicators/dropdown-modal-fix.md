# PrimeNG Dropdown Visibility Fix in Modals

## Problem

Dropdowns inside modals get clipped due to modal's `overflow: hidden` constraint, making options invisible.

## Solution

Add `appendTo="body"` to the dropdown component:

```html
<p-multiSelect appendTo="body" [(ngModel)]="form().years" [options]="availableYears" ...> </p-multiSelect>
```

## How it works

- `appendTo="body"` renders the dropdown panel as a direct child of `<body>`
- This escapes the modal's overflow restrictions
- Panel automatically positions near the trigger element
- No additional CSS needed

## Applicable to

- `p-select`
- `p-multiSelect`
- `p-calendar`
- `p-autoComplete`
- `p-cascadeSelect`

## Result

✅ Dropdown options are fully visible  
✅ Works in any constrained container  
✅ Maintains proper positioning and z-index
