

## Fix: Cabling (3x) quantity still showing ×9 in Card Reference

The previous round updated comments and total text but missed the actual data on **line 26 of `src/pages/CardReference.tsx`**:

```
quantity: 9  →  quantity: 8
```

One line, one file.

