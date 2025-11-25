# Status Tracking Feature - Testing Checklist

## Implementation Complete ✅

All components, services, and hooks have been implemented according to the plan:

### Files Created:
1. ✅ `src/features/status-tracking/types.ts` - Type definitions
2. ✅ `src/features/status-tracking/services/status-tracking.service.ts` - Data services
3. ✅ `src/features/status-tracking/hooks/useStatusConfig.ts` - Config management hook
4. ✅ `src/features/status-tracking/hooks/useStatusBoard.ts` - Board state management hook
5. ✅ `src/features/status-tracking/components/StatusCard.tsx` - Draggable card component
6. ✅ `src/features/status-tracking/components/StatusColumn.tsx` - Column container
7. ✅ `src/features/status-tracking/components/StatusBoard.tsx` - Main board with DnD context
8. ✅ `src/features/status-tracking/components/ConfigPanel.tsx` - Configuration UI
9. ✅ `src/features/status-tracking/components/EmptyStates.tsx` - Empty state components
10. ✅ `src/features/status-tracking/StatusTrackingPage.tsx` - Main page component
11. ✅ `app/dashboard/status-tracking/page.tsx` - Next.js route

### Files Modified:
1. ✅ `components/Sidebar.tsx` - Added Status Tracking navigation
2. ✅ `components/Icons.tsx` - Added IconKanban
3. ✅ `package.json` - Added @dnd-kit dependencies

### Linter Status:
✅ No linter errors found in any files

## Manual Testing Checklist

### 1. Navigation & Initial State
- [ ] Visit `/dashboard/status-tracking` from sidebar
- [ ] Verify "ステータストラッキング" menu item highlights
- [ ] Verify empty state shows when no table selected
- [ ] Verify ASCII art renders correctly in empty state

### 2. Configuration Panel
- [ ] Select a table from dropdown
- [ ] Verify status column dropdown populates with text/tag columns
- [ ] Select a status column
- [ ] Toggle card field checkboxes (名前, 担当者, 金額, 更新日)
- [ ] Verify config persists after page reload (localStorage)
- [ ] Change to different table, verify config resets appropriately

### 3. Board Display
- [ ] Verify columns render for each status value
- [ ] Verify column headers show status name and count
- [ ] Verify cards display configured fields correctly
- [ ] Check card formatting:
  - Name field (bold, truncated if long)
  - Assigned person (avatar + name)
  - Numeric value (formatted as ¥XXK/¥XXM)
  - Timestamp (relative: 今日, 昨日, X日前, etc.)

### 4. Drag & Drop Functionality
- [ ] Drag a card within the same column (should work)
- [ ] Drag a card to a different column
- [ ] Verify optimistic UI update (card moves immediately)
- [ ] Verify success toast appears
- [ ] Verify card status updated in Supabase
- [ ] Reload page and verify change persisted
- [ ] Test error scenario (disconnect network)
  - [ ] Verify rollback on error
  - [ ] Verify error toast appears

### 5. Empty States
- [ ] Create table with no rows → verify NoDataState
- [ ] Select column with no values → verify NoStatusColumnState
- [ ] Network error → verify ErrorState with retry button

### 6. Responsive Design
- [ ] Horizontal scroll works with many columns
- [ ] Vertical scroll works within columns with many cards
- [ ] Layout remains stable during drag operations
- [ ] Test on different screen sizes

### 7. Styling Compliance (styling.md)
- [ ] Border radius is 2px (sharp, not rounded)
- [ ] Primary blue (#0000FF) used sparingly
- [ ] Grayscale dominates the interface
- [ ] Monospace font (JetBrains Mono) for data values
- [ ] Hover states have instant transitions
- [ ] Grid-based layout with 8px spacing

### 8. Keyboard Shortcuts (Future Enhancement)
- [ ] ESC key (placeholder logged)
- [ ] Arrow keys (placeholder logged)

### 9. Performance
- [ ] Test with 50+ cards
- [ ] Test with 10+ columns
- [ ] Verify smooth drag animations
- [ ] Check for memory leaks (long session)

### 10. Edge Cases
- [ ] Table deleted while viewing board
- [ ] Column removed while selected as status column
- [ ] Multiple browser tabs (localStorage sync)
- [ ] User switches organization
- [ ] Concurrent edits from another user

## Known Limitations

1. **Virtualization**: Not yet implemented for large datasets (>100 cards)
2. **Card Details Modal**: Card click handler exists but modal not implemented
3. **Filter & Sort**: UI space reserved but functionality not implemented
4. **Real-time Updates**: Board doesn't auto-refresh when data changes elsewhere
5. **Drag Animation**: Basic DnD animation, could be enhanced with custom overlays

## Recommended Next Steps

1. Add card detail modal on click
2. Implement filters and sort controls
3. Add real-time updates via Supabase subscriptions
4. Virtualize columns/cards for performance
5. Enhanced drag animations and visual feedback
6. Export board data to CSV/PDF
7. Bulk actions (multi-select cards)
8. Board templates and saved views
9. Column reordering
10. Custom card field mapping UI

## Testing Commands

```bash
# Start dev server
npm run dev

# Check for linter errors
npm run lint

# Build for production
npm run build
```

## Access URL
http://localhost:3000/dashboard/status-tracking

## Test Data Requirements

To properly test, you need:
1. Organization with at least one table
2. Table with:
   - At least one text/tag column for status grouping
   - Multiple rows with different status values
   - Optional: text field for names
   - Optional: tag field for assigned persons
   - Optional: number field for values
   - Rows with `updated_at` timestamps

Example Test Data:
- Deals table with "Stage" column (Lead, In Progress, Won, Lost)
- Companies with 10-20 records spread across stages
- Varied names, assigned persons, ARR values

