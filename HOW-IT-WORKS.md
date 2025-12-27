# How It Works

## Summary

**Pixel Quilt** is an interactive web-based collaborative pixel art editor built with React and Vite. The application presents users with a 6×6 grid of squares (36 total), where each square contains a 16×16 pixel canvas. Users can create pixel art patterns in individual squares using a 28-color palette, then copy patterns between squares by dragging. The editor includes advanced features like flood fill with preview, rotation tools, a contextual "halo" system that shows adjacent pixels for seamless pattern alignment, and comprehensive undo functionality at both the quilt and editor levels.

---

## Architecture Overview

### Technology Stack
- **React 19.1.1** - Component-based UI with hooks
- **Vite 7.1.7** - Fast build tool and dev server
- **Tailwind CSS 4.1.14** - Utility-first styling
- **ESLint** - Code quality enforcement

### Project Structure
```
src/
├── main.jsx              # React application entry point
├── App.jsx               # Main container with global state management
├── components/
│   ├── PixelEditor.jsx   # Modal pixel art editor (16×16 canvas)
│   ├── QuiltGrid.jsx     # 6×6 grid layout with drag-to-copy
│   └── QuiltSquare.jsx   # Individual square display component
└── index.css             # Tailwind configuration and custom styles
```

---

## Core Components

### 1. App.jsx - State Management Hub

**Responsibilities:**
- Manages global state for the entire quilt
- Orchestrates interaction between grid and editor
- Handles undo history for quilt-level changes
- Displays toast notifications

**State Management:**
```javascript
squares      // Array of 36 squares, each with 16×16 pixel grid
history      // Undo stack for quilt changes
editingSquare // Index of currently edited square (null if none)
showToast    // Toast notification visibility and message
```

**Key Features:**
- **Pattern Copying**: When user drags a pattern to another square, saves current state to history
- **Global Undo**: Cmd/Ctrl+Z reverts to previous quilt state
- **Toast System**: Shows confirmation when patterns are copied
- **Responsive Container**: Scrollable viewport for the quilt grid

---

### 2. PixelEditor.jsx - Advanced Pixel Art Editor

**Purpose:** Full-featured modal editor for creating 16×16 pixel art with context-aware tools.

**Color Palette:**
28 carefully curated colors organized by family:
- Pinks (5 shades)
- Peach/Orange (3 shades)
- Yellows (3 shades)
- Greens (5 shades)
- Blues (5 shades)
- Purples (4 shades)
- Grays and blacks (3 shades)

**Drawing Modes:**

1. **Draw Mode (Pencil)**
   - Click or drag to paint individual pixels
   - Supports both mouse and touch input
   - Groups consecutive strokes into single undo action (debounced)

2. **Bucket Fill Mode**
   - Stack-based flood fill algorithm (non-recursive)
   - **Preview System**: Hover shows which pixels will be filled with semi-transparent overlay
   - Flash animation when fill completes
   - Efficient handling of large fill areas

**Halo System:**
- Displays a 4-pixel border (2px on mobile) showing adjacent pixels from neighboring squares
- Helps users create seamless patterns that connect across square boundaries
- Retrieves and displays actual pixel data from north, south, east, and west neighbors

**Additional Tools:**
- **Rotate Clockwise/Counterclockwise**: Transforms the entire 16×16 grid
- **Clear Canvas**: Resets all pixels to white
- **Local Undo**: Independent undo stack within the editor session

**Layout:**
- **Desktop**: 60% canvas (left) / 40% controls (right) split
- **Mobile**: Full-screen canvas with compact toolbar at top

**Technical Details:**
- Uses `useMemo` for efficient pixel grid rendering
- Debounces drawing sessions (300ms) to group strokes
- Prevents propagation of click events to avoid interference
- Handles both pixel editing and history management independently

---

### 3. QuiltGrid.jsx - Grid Layout & Drag-to-Copy

**Purpose:** Renders the 6×6 grid of squares and handles pattern copying via drag interaction.

**Layout:**
- 6-column CSS Grid
- Responsive sizing: 200% width on mobile, 120% on desktop (enables scrolling)
- Uniform square sizing with auto-height rows

**Drag-to-Copy Mechanism:**

1. User clicks and holds on bottom-left corner of a square (20% × 20% area)
2. `QuiltGrid` tracks:
   - `draggingSquare`: Index of source square
   - `hoveringSquare`: Index of current hover target
3. Visual feedback:
   - Source square: Blue border
   - Target square: Green border while hovering
4. Ghost image: Shows pattern being dragged
5. On drop: Calls `onCopyPattern(sourceIndex, targetIndex)`

**Touch Support:**
- Handles `touchstart`, `touchmove`, `touchend` events
- Converts touch coordinates to element detection
- Mobile-friendly drag interaction

---

### 4. QuiltSquare.jsx - Individual Square Display

**Purpose:** Renders a single 16×16 pixel art square with interaction detection.

**Rendering:**
- Displays 16×16 grid using CSS Grid
- Each pixel rendered as colored div
- Efficient rendering with minimal re-renders

**Interaction Zones:**
- **Bottom-left corner (20% × 20%)**: Drag handle for pattern copying
- **Rest of square**: Click to open pixel editor

**Visual States:**
- **Idle**: Default border color
- **Hover**: Highlighted border
- **Dragging Source**: Blue border (controlled by parent)
- **Drag Target**: Green border (controlled by parent)

**Event Handling:**
- Mouse and touch event detection
- Calculates relative click position to determine if drag should start
- Prevents editor opening when drag starts from corner

---

## Data Flow

### Opening the Editor
```
User clicks QuiltSquare
    ↓
QuiltSquare.onClick fires
    ↓
App.setEditingSquare(index)
    ↓
PixelEditor modal opens with square's pixel data
    ↓
User edits pixels (local state)
    ↓
User clicks Save
    ↓
App receives updated pixels
    ↓
App saves current state to history
    ↓
App updates squares array
    ↓
Modal closes
```

### Copying a Pattern
```
User drags from square corner
    ↓
QuiltGrid detects drag start (draggingSquare set)
    ↓
User drags over another square
    ↓
QuiltGrid sets hoveringSquare (green border shows)
    ↓
User releases (drop)
    ↓
QuiltGrid calls App.handleCopyPattern(source, target)
    ↓
App saves current state to history
    ↓
App copies pixel array from source to target
    ↓
App shows toast notification
    ↓
Drag state cleared
```

### Undo System
```
User presses Cmd/Ctrl+Z
    ↓
App.handleUndo checks if history exists
    ↓
App pops last state from history
    ↓
App restores squares to previous state
    ↓
Grid re-renders with restored data
```

---

## Key Algorithms

### Flood Fill (Bucket Tool)

**Implementation:** Stack-based iterative approach (prevents stack overflow)

```
1. Start with clicked pixel coordinates
2. Get target color (color to replace)
3. If target already equals fill color, exit
4. Create stack with starting pixel
5. While stack not empty:
   a. Pop pixel from stack
   b. If pixel is target color:
      - Add to pixels-to-fill set
      - Push north/south/east/west neighbors to stack
6. Update all collected pixels with fill color
```

**Preview System:**
- Runs fill algorithm without applying changes
- Stores results in `fillPreview` state
- Renders semi-transparent overlay on affected pixels
- Clears preview when user moves mouse away

### Halo Calculation

**Purpose:** Show adjacent pixels from neighboring squares

```
For each side (north, south, east, west):
1. Calculate neighbor index based on position in 6×6 grid
2. If neighbor exists:
   a. Extract relevant edge pixels from neighbor
   b. North: Bottom 4 rows
   c. South: Top 4 rows
   d. East: Left 4 columns
   e. West: Right 4 columns
3. Render extracted pixels in halo border around canvas
```

### Drawing Session Debouncing

**Purpose:** Group consecutive pixel draws into single undo action

```
1. On first pixel draw, start session timer
2. Save current state to history
3. Continue drawing updates local state only
4. After 300ms of inactivity, end session
5. Next draw starts new session with new history entry
```

---

## State Management Pattern

### Global State (App.jsx)
- **squares**: Master data for all 36 squares
- **history**: Undo stack (max depth handled internally)
- **editingSquare**: Currently open editor index

### Local State (PixelEditor.jsx)
- **pixels**: Working copy of 16×16 grid being edited
- **localHistory**: Independent undo stack for editor
- **selectedColor**: Active color from palette
- **mode**: 'draw' or 'bucket'
- **fillPreview**: Pixels that would be affected by bucket fill

### Component State (QuiltGrid.jsx)
- **draggingSquare**: Source square index during drag
- **hoveringSquare**: Target square index during drag

### Component State (QuiltSquare.jsx)
- Visual states derived from props (isDragging, isHovering)

---

## Responsive Design Strategy

### Mobile (< 768px)
- **Quilt Grid**: 200% width, horizontal scrolling enabled
- **Pixel Editor**: Full-screen modal with toolbar at top
- **Halo Size**: 2 pixels to save screen space
- **Touch Events**: Primary interaction method

### Desktop (≥ 768px)
- **Quilt Grid**: 120% width, comfortable scrolling
- **Pixel Editor**: Split layout (60% canvas, 40% controls)
- **Halo Size**: 4 pixels for better visibility
- **Mouse Events**: Primary interaction with hover states

---

## Performance Optimizations

1. **useMemo for Grid Rendering**: Prevents recalculation of pixel grid on every render
2. **Debounced History Saves**: Groups drawing strokes to reduce memory usage
3. **Event Delegation**: Efficient event handling in grid layouts
4. **Conditional Rendering**: Only PixelEditor mounts when editing
5. **Stack-Based Algorithms**: Non-recursive flood fill prevents stack overflow

---

## User Experience Features

### Visual Feedback
- **Border Colors**: Blue for source, green for target during drag
- **Toast Notifications**: Confirmation when patterns are copied
- **Fill Preview**: Semi-transparent overlay shows bucket fill results
- **Flash Animation**: Quick visual feedback when fill completes
- **Halo Display**: Context-aware border showing adjacent patterns

### Accessibility
- Touch and mouse support for all interactions
- Clear visual states for interactive elements
- Keyboard shortcuts (Cmd/Ctrl+Z for undo)
- Responsive design for various screen sizes

### Error Prevention
- Modal overlay prevents accidental clicks outside editor
- Drag corner is clearly defined (20% × 20% zone)
- Undo functionality at multiple levels
- Fill preview prevents unwanted bucket fills

---

## Build and Development

### Development Server
```bash
npm run dev
```
Vite starts development server with hot module replacement (HMR)

### Production Build
```bash
npm run build
```
Creates optimized production bundle

### Code Quality
```bash
npm run lint
```
ESLint checks for code quality and React best practices

### Configuration Files
- **vite.config.js**: Build tool configuration
- **eslint.config.js**: Linting rules
- **tailwind.config.js**: Utility class configuration (via @tailwind directives in CSS)
- **postcss.config.js**: CSS processing pipeline
