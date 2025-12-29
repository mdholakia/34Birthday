# UI Elements Reference Guide

A comprehensive searchable reference for all UI elements, components, buttons, and interface elements in the Pixel Quilt application.

---

## Quick Search Index

**Top Bar:** Header Bar, Pixel Quilt Title, Chat Button, Preview Toggle Button
**Main Canvas:** QuiltGrid, QuiltSquare, Drag Ghost, Copy Icon
**Editor:** PixelEditor, Tool Toggle, Draw Button, Fill Button, Color Palette, Swatches
**Controls:** Save Button, Cancel Button, Clear Canvas, Rotate Clockwise, Rotate Counter-Clockwise
**Overlays:** Toast Notification, Chat Modal, Hover Scrim, Border Overlay
**Animations:** cornerPulse, cornerGlow, editorSlideUp, editorFadeIn, fadeOut

---

## 1. TOP BAR / HEADER

**File:** [src/App.jsx:125-198](src/App.jsx#L125-L198)

### Header Bar
- **Search Terms:** header, top bar, title bar
- **Background Color:** `#c4a1a1ff` (dusty rose)
- **Contains:** Title + Chat Button + Preview Toggle

### "Pixel Quilt" Title
- **Search Terms:** title, heading, app name
- **Location:** [src/App.jsx:139-146](src/App.jsx#L139-L146)
- **Font:** Georgia, serif
- **Responsive sizes:** 32px → 48px based on screen width

### Chat Button
- **Search Terms:** chat button, 💬 button, message button
- **Location:** [src/App.jsx:149-169](src/App.jsx#L149-L169)
- **Icon:** 💬 emoji
- **Size:** 44x44px
- **Background:** White
- **Border:** `2px solid #6b7280` (gray)
- **Function:** Opens chat modal

### Preview Toggle Button
- **Search Terms:** preview button, toggle preview, exit preview
- **Location:** [src/App.jsx:172-196](src/App.jsx#L172-L196)
- **Labels:** "Preview" / "Exit Preview"
- **States:** Active (blue) / Inactive (white)
- **Active Color:** `#3b82f6` (blue)
- **Border:** `2px solid #3b82f6`
- **Size:** 44px height
- **Visual Indicator:** ✓ checkmark when active

---

## 2. MAIN GRID / QUILT CANVAS

**File:** [src/components/QuiltGrid.jsx](src/components/QuiltGrid.jsx)

### QuiltGrid
- **Search Terms:** quilt grid, main grid, 6x6 grid, canvas
- **Location:** [src/components/QuiltGrid.jsx:104-143](src/components/QuiltGrid.jsx#L104-L143)
- **Structure:** 6 columns × 6 rows = 36 squares
- **CSS Class:** `.quilt-grid`
- **Grid Template:** `repeat(6, 1fr)`
- **Features:** Drag-and-drop, touch gestures

---

## 3. QUILT SQUARES (Individual Cells)

**File:** [src/components/QuiltSquare.jsx](src/components/QuiltSquare.jsx)

### QuiltSquare Component
- **Search Terms:** square, cell, quilt square, pixel square
- **Location:** [src/components/QuiltSquare.jsx:101-272](src/components/QuiltSquare.jsx#L101-L272)
- **Size:** 16x16 pixel grid
- **Background:** White
- **Border:** `1px solid #eee`
- **Data Attribute:** `data-square-index={index}`

### Copy Icon (Drag Indicator)
- **Search Terms:** copy icon, drag corner, ⎘ icon
- **Location:** [src/components/QuiltSquare.jsx:192-269](src/components/QuiltSquare.jsx#L192-L269)
- **Icon:** ⎘ emoji
- **Position:** Lower-left corner
- **Visibility:** Desktop hover only

### Powered-Up Glow Animation
- **Search Terms:** corner glow, pulse animation, edited indicator
- **Location:** [src/components/QuiltSquare.jsx:237-249](src/components/QuiltSquare.jsx#L237-L249)
- **Animation:** `cornerPulse` + `cornerGlow`
- **Duration:** 2.5s infinite
- **Colors:** Blue → Purple → Pink gradient
- **Trigger:** Shown when square has been edited

### Source Border Overlay
- **Search Terms:** drag border, source border, blue border
- **Location:** [src/components/QuiltSquare.jsx:131-143](src/components/QuiltSquare.jsx#L131-L143)
- **Style:** `3px solid #3b82f6` (blue)
- **Visibility:** When square is being dragged

### Hover Scrim
- **Search Terms:** hover overlay, green overlay, drop target
- **Location:** [src/components/QuiltSquare.jsx:146-157](src/components/QuiltSquare.jsx#L146-L157)
- **Color:** `rgba(16, 185, 129, 0.3)` (green)
- **Visibility:** When hovered during drag operation

---

## 4. PIXEL EDITOR - MOBILE LAYOUT

**File:** [src/components/PixelEditor.jsx](src/components/PixelEditor.jsx)

### Mobile Editor Container
- **Search Terms:** pixel editor, mobile editor, edit mode
- **Location:** [src/components/PixelEditor.jsx:385-779](src/components/PixelEditor.jsx#L385-L779)
- **Animation:** `editorSlideUp`
- **Background:** `#F5EFEE` (off-white)

### TOP SECTION (Dark Bar)

#### Tool Toggle Buttons
- **Search Terms:** tool buttons, draw fill toggle, mode buttons
- **Location:** [src/components/PixelEditor.jsx:428-481](src/components/PixelEditor.jsx#L428-L481)
- **Background:** `#121212` (dark)

#### Draw Button
- **Search Terms:** draw button, pencil button, ✏️ button
- **Location:** [src/components/PixelEditor.jsx:436-452](src/components/PixelEditor.jsx#L436-L452)
- **Icon:** ✏️
- **Active Color:** `#a5b4fc` (indigo)
- **Label:** "Draw"

#### Fill/Bucket Button
- **Search Terms:** fill button, bucket button, 🪣 button, flood fill
- **Location:** [src/components/PixelEditor.jsx:453-469](src/components/PixelEditor.jsx#L453-L469)
- **Icon:** 🪣
- **Active Color:** `#a5b4fc` (indigo)
- **Label:** "Fill"

### Color Palette (Mobile)
- **Search Terms:** color palette, swatches, color picker, mobile colors
- **Location:** [src/components/PixelEditor.jsx:484-524](src/components/PixelEditor.jsx#L484-L524)
- **Layout:** Horizontal scroll (short screens) / Grid (normal)
- **Swatch Size:** 48x48px
- **Border Radius:** 6px
- **Selected Border:** `3px solid white`
- **Unselected Border:** `2px solid rgba(255,255,255,0.3)`

### CANVAS AREA (Central)

#### Pixel Grid Display
- **Search Terms:** pixel grid, canvas, drawing area, 16x16 grid
- **Location:** [src/components/PixelEditor.jsx:555-642](src/components/PixelEditor.jsx#L555-L642)
- **Size:** 90vw, max 600px
- **Grid:** 16x16 editable pixels + halo pixels
- **Background:** `#F5EFEE`
- **Pixel Border:** `1px solid #e5e5e5`
- **Cursor:** `crosshair` (bucket) / `pointer` (draw)

#### Border Overlay
- **Search Terms:** editable border, grid border, canvas border
- **Location:** [src/components/PixelEditor.jsx:616-626](src/components/PixelEditor.jsx#L616-L626)
- **Style:** `3px solid #333`
- **Box Shadow:** `0 0 20px rgba(0,0,0,0.2)`
- **Purpose:** Marks editable 16x16 area

#### Fill Preview Overlay
- **Search Terms:** fill preview, flood fill preview
- **Location:** [src/components/PixelEditor.jsx:599-610](src/components/PixelEditor.jsx#L599-L610)
- **Opacity:** 0.6
- **Color:** Selected color
- **Visibility:** During bucket fill hover

#### Flash Animation
- **Search Terms:** fill flash, bucket flash, feedback animation
- **Location:** [src/components/PixelEditor.jsx:628-641](src/components/PixelEditor.jsx#L628-L641)
- **Animation:** `fadeOut` 300ms
- **Trigger:** After bucket fill action

### Control Buttons (Overlay on Canvas)
- **Search Terms:** control buttons, utility buttons
- **Location:** [src/components/PixelEditor.jsx:645-719](src/components/PixelEditor.jsx#L645-L719)
- **Background:** `rgba(245, 239, 238, 0.95)` with blur
- **Position:** Bottom halo area

#### Clear Canvas Button
- **Search Terms:** clear button, reset canvas, erase all
- **Location:** [src/components/PixelEditor.jsx:656-672](src/components/PixelEditor.jsx#L656-L672)
- **Label:** "Clear Canvas"
- **Border:** `1px solid #333`

#### Rotate Counter-Clockwise Button
- **Search Terms:** rotate left, rotate ccw, ↺ button
- **Location:** [src/components/PixelEditor.jsx:673-695](src/components/PixelEditor.jsx#L673-L695)
- **Icon:** ↺
- **Title:** "Rotate Counter-Clockwise"
- **Size:** 24x24px (short) / 32x32px (normal)

#### Rotate Clockwise Button
- **Search Terms:** rotate right, rotate cw, ↻ button
- **Location:** [src/components/PixelEditor.jsx:696-718](src/components/PixelEditor.jsx#L696-L718)
- **Icon:** ↻
- **Title:** "Rotate Clockwise"
- **Size:** 24x24px (short) / 32x32px (normal)

### BOTTOM SECTION (Dark Bar)

#### Cancel Button (Mobile)
- **Search Terms:** cancel button, close editor, discard
- **Location:** [src/components/PixelEditor.jsx:737-756](src/components/PixelEditor.jsx#L737-L756)
- **Background:** Transparent
- **Color:** `#999` (gray)
- **Border:** `2px solid rgba(255,255,255,0.2)`
- **Min Height:** 42px

#### Save Changes Button (Mobile)
- **Search Terms:** save button, confirm changes, apply
- **Location:** [src/components/PixelEditor.jsx:757-773](src/components/PixelEditor.jsx#L757-L773)
- **Background:** `#f5f5f5` (light)
- **Color:** `#121212` (dark)
- **Font Weight:** 600
- **Min Height:** 42px

---

## 5. PIXEL EDITOR - DESKTOP LAYOUT

**File:** [src/components/PixelEditor.jsx:782-1140](src/components/PixelEditor.jsx#L782-L1140)

### Desktop Editor Container
- **Search Terms:** desktop editor, side panel editor
- **Layout:** 60% canvas / 40% controls split
- **Animation:** `editorFadeIn`

### LEFT PANEL (60% - Canvas)
- **Search Terms:** left panel, canvas panel
- **Width:** 60% viewport
- **Size:** `min(100%, 100vh - 80px)`
- **Content:** Large pixel grid (same as mobile)

### RIGHT PANEL (40% - Controls)
- **Search Terms:** right panel, control panel, sidebar
- **Width:** 40% viewport
- **Background:** White

#### Header Section
- **Location:** [src/components/PixelEditor.jsx:938-996](src/components/PixelEditor.jsx#L938-L996)
- **Padding:** 40px
- **Title:** "Edit square" (Georgia, italic, 48px)
- **Subtitle:** "Draw a pattern or a symbol!" (16px, #666)

#### Draw Button (Desktop)
- **Search Terms:** draw button desktop, ✏️ draw
- **Location:** [src/components/PixelEditor.jsx:963-978](src/components/PixelEditor.jsx#L963-L978)
- **Label:** ✏️ Draw
- **Padding:** 12px
- **Active Background:** `#e8e8ff`
- **Border Radius:** `8px 0 0 8px`

#### Fill Button (Desktop)
- **Search Terms:** fill button desktop, 🪣 fill
- **Location:** [src/components/PixelEditor.jsx:979-994](src/components/PixelEditor.jsx#L979-L994)
- **Label:** 🪣 Fill
- **Padding:** 12px
- **Active Background:** `#e8e8ff`
- **Border Radius:** `0 8px 8px 0`

#### Color Palette (Desktop)
- **Search Terms:** color palette desktop, swatches desktop
- **Location:** [src/components/PixelEditor.jsx:999-1030](src/components/PixelEditor.jsx#L999-L1030)
- **Layout:** 4 columns grid
- **Gap:** 8px
- **Max Width:** 200px
- **Swatch Size:** 40x40px
- **Border Radius:** 8px
- **Selected Border:** `3px solid #333`
- **Unselected Border:** `2px solid #ddd`
- **Scrollable:** Yes

#### Footer Section
- **Location:** [src/components/PixelEditor.jsx:1033-1132](src/components/PixelEditor.jsx#L1033-L1132)
- **Padding:** 40px
- **Border Top:** `1px solid #eee`

#### Clear Canvas Button (Desktop)
- **Search Terms:** clear canvas desktop
- **Location:** [src/components/PixelEditor.jsx:1039-1054](src/components/PixelEditor.jsx#L1039-L1054)
- **Flex:** 2
- **Padding:** 12px 16px
- **Border:** `2px solid #ddd`
- **Font:** 14px, weight 500

#### Rotate Clockwise Button (Desktop)
- **Search Terms:** rotate right desktop, R button
- **Location:** [src/components/PixelEditor.jsx:1055-1075](src/components/PixelEditor.jsx#L1055-L1075)
- **Icon:** ↻ + "R" label
- **Flex:** 1
- **Padding:** 12px
- **Border:** `2px solid #ddd`

#### Rotate Counter-Clockwise Button (Desktop)
- **Search Terms:** rotate left desktop, L button
- **Location:** [src/components/PixelEditor.jsx:1076-1097](src/components/PixelEditor.jsx#L1076-L1097)
- **Icon:** ↺ + "L" label
- **Flex:** 1
- **Padding:** 12px
- **Border:** `2px solid #ddd`

#### Save Changes Button (Desktop)
- **Search Terms:** save button desktop, black save button
- **Location:** [src/components/PixelEditor.jsx:1099-1115](src/components/PixelEditor.jsx#L1099-L1115)
- **Background:** Black (`#000`)
- **Color:** White
- **Padding:** 16px
- **Font:** 18px, weight 500
- **Border Radius:** 8px

#### Cancel Button (Desktop)
- **Search Terms:** cancel button desktop
- **Location:** [src/components/PixelEditor.jsx:1116-1131](src/components/PixelEditor.jsx#L1116-L1131)
- **Color:** `#333`
- **Border:** `2px solid #ddd`
- **Padding:** 16px
- **Font:** 18px, weight 500
- **Border Radius:** 8px

---

## 6. DRAG GHOST IMAGE

**File:** [src/components/QuiltGrid.jsx:146-186](src/components/QuiltGrid.jsx#L146-L186)

### Drag Ghost Preview
- **Search Terms:** drag ghost, drag preview, floating square
- **Position:** Fixed, follows cursor
- **Size:** 80x80px (mobile) / 60x60px (desktop)
- **Border:** `2px solid #3b82f6` (blue)
- **Box Shadow:** `0 8px 32px rgba(59, 130, 246, 0.4)`
- **Border Radius:** 6px (mobile) / 4px (desktop)
- **Opacity:** 0.9
- **Z-index:** 1000
- **Content:** 16x16 pixel grid preview
- **Visibility:** Only during drag operation

---

## 7. TOAST NOTIFICATION

**File:** [src/App.jsx:219-234](src/App.jsx#L219-L234)

### Toast Message
- **Search Terms:** toast, notification, success message, undo message
- **Trigger:** Pattern copy success
- **Position:** Fixed bottom-right (20px from edges)
- **Message:** "Pattern copied! Press Cmd+Z to undo"
- **Background:** `#1f2937` (dark gray)
- **Color:** White
- **Padding:** 12px 20px
- **Border Radius:** 8px
- **Box Shadow:** `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Font Size:** 14px
- **Z-index:** 1000
- **Duration:** Auto-dismiss after 3 seconds

---

## 8. CHAT MODAL

**File:** [src/App.jsx:249-303](src/App.jsx#L249-L303)

### Modal Dialog
- **Search Terms:** chat modal, message dialog, popup, modal
- **Trigger:** Chat button click

### Modal Backdrop
- **Search Terms:** modal backdrop, overlay, dimmed background
- **Position:** Fixed full screen
- **Background:** `rgba(0, 0, 0, 0.5)` (semi-transparent)
- **Z-index:** 2000

### Modal Box
- **Search Terms:** modal box, dialog box
- **Background:** White
- **Padding:** 40px
- **Border Radius:** 12px
- **Box Shadow:** `0 10px 25px rgba(0, 0, 0, 0.2)`
- **Max Width:** 500px
- **Width:** 90% (responsive)

### Modal Title
- **Search Terms:** modal title, dialog title
- **Text:** "It's Meg's birthday"
- **Font:** 24px, bold
- **Color:** `#1f2937`

### Close Button (Modal)
- **Search Terms:** close button, dismiss button, modal close
- **Location:** [src/App.jsx:292-301](src/App.jsx#L292-L301)
- **Label:** "Close"
- **Padding:** 10px 24px
- **Background:** `#3b82f6` (blue)
- **Color:** White
- **Border Radius:** 6px
- **Font:** 14px, weight 600

---

## 9. COLOR PALETTE SYSTEM

**File:** [src/components/PixelEditor.jsx:3-15](src/components/PixelEditor.jsx#L3-L15)

### Eight Core Colors
- **Search Terms:** colors, palette, swatches, color scheme

1. **Olive Green** - `#758859`
   - Search: olive, green, dark green

2. **Yellow** - `#E0C877`
   - Search: yellow, gold, warm yellow

3. **Orange** - `#EA6847`
   - Search: orange, coral, red-orange

4. **Light Blue** - `#89B9DA`
   - Search: blue, light blue, sky blue

5. **Sage** - `#C7CBA3`
   - Search: sage, light green, pale green

6. **White/Beige** - `rgb(237, 232, 231)`
   - Search: white, beige, off-white, cream

7. **Pink** - `#E99AA7`
   - Search: pink, rose pink

8. **Dark Blue** - `#484D88`
   - Search: dark blue, navy, purple-blue

---

## 10. BACKGROUND COLORS & THEME

**Search Terms:** colors, theme, backgrounds, branding

### Main Colors
- **App Background:** `#121212` (dark/black)
- **Top Bar:** `#c4a1a1ff` (dusty rose)
- **Mobile Editor Background:** `#F5EFEE` (off-white)
- **Desktop Editor Background:** `#FFFFFF` (white)
- **Control Panels:** `#121212` (dark)

### Border & UI Colors
- **Grid Cell Border:** `#eee` / `#e5e5e5`
- **Main Divider:** `2px solid #e5e7eb`
- **Button Border Gray:** `#6b7280`
- **Light Border:** `#ddd`
- **Button Border Gray Transparent:** `rgba(255,255,255,0.2)`

### Accent Colors
- **Primary Blue:** `#3b82f6`
- **Active Indigo:** `#a5b4fc`
- **Success Green:** `rgba(16, 185, 129, 0.3)`
- **Dark Gray:** `#1f2937`
- **Medium Gray:** `#666`
- **Light Gray:** `#999`
- **Dark Text:** `#333`

---

## 11. ANIMATIONS

**Files:** [src/components/QuiltSquare.jsx](src/components/QuiltSquare.jsx) & [src/components/PixelEditor.jsx](src/components/PixelEditor.jsx)

### cornerPulse
- **Search Terms:** corner pulse, glow animation, gradient pulse
- **Location:** [src/components/QuiltSquare.jsx:195-223](src/components/QuiltSquare.jsx#L195-L223)
- **Duration:** 2.5s infinite
- **Effect:** Radial gradient rotation (blue → purple → pink)
- **Transform:** Scale 1 → 1.1 → 1.05
- **Usage:** Edited square indicator

### cornerGlow
- **Search Terms:** corner glow, shadow pulse
- **Location:** [src/components/QuiltSquare.jsx:225-232](src/components/QuiltSquare.jsx#L225-L232)
- **Duration:** 2.5s infinite
- **Effect:** Drop shadow color pulse (blue to purple)
- **Usage:** Edited square indicator

### editorSlideUp
- **Search Terms:** slide up, mobile editor animation
- **Location:** [src/components/PixelEditor.jsx:389-398](src/components/PixelEditor.jsx#L389-L398)
- **Duration:** 0.25s
- **Effect:** translateY 100% → 0, opacity 0 → 1
- **Usage:** Mobile editor entrance
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### editorFadeIn
- **Search Terms:** fade in, desktop editor animation
- **Location:** [src/components/PixelEditor.jsx:400-407](src/components/PixelEditor.jsx#L400-L407)
- **Duration:** 0.2s
- **Effect:** Opacity 0 → 1
- **Usage:** Desktop editor entrance
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### fadeOut
- **Search Terms:** fade out, flash animation, fill flash
- **Location:** [src/index.css:20-26](src/index.css#L20-L26)
- **Duration:** 300ms
- **Effect:** Opacity 0.3 → 0
- **Usage:** Bucket fill feedback flash

---

## 12. RESPONSIVE BREAKPOINTS

### Mobile Breakpoint
- **Search Terms:** mobile, responsive, 768px
- **Condition:** `window.innerWidth < 768px`
- **Layout:** Stacked editor, slide-up animation

### Small Screen Breakpoint
- **Search Terms:** small screen, 375px
- **Condition:** `window.innerWidth < 375px`
- **Effect:** Header text hidden on Preview button

### Short Viewport Breakpoint
- **Search Terms:** short viewport, 700px height
- **Condition:** `window.innerHeight < 700px`
- **Effect:** Color palette switches to horizontal scroll

---

## 13. CSS CLASSES

### Main Grid Class
- **Class Name:** `.quilt-grid`
- **File:** [src/components/QuiltGrid.jsx](src/components/QuiltGrid.jsx)
- **Usage:** 6x6 quilt grid container

---

## 14. DATA ATTRIBUTES

### Square Index
- **Attribute:** `data-square-index={index}`
- **File:** [src/components/QuiltSquare.jsx](src/components/QuiltSquare.jsx)
- **Values:** 0-35 (for 36 squares)
- **Usage:** Identify individual quilt squares

---

## Component Summary

### Main Components (4)
1. **App** - [src/App.jsx](src/App.jsx) - Root component, header, modals
2. **QuiltGrid** - [src/components/QuiltGrid.jsx](src/components/QuiltGrid.jsx) - 6x6 grid layout
3. **QuiltSquare** - [src/components/QuiltSquare.jsx](src/components/QuiltSquare.jsx) - Individual editable squares
4. **PixelEditor** - [src/components/PixelEditor.jsx](src/components/PixelEditor.jsx) - Pixel art editor (mobile + desktop)

### Statistics
- **Color Swatches:** 8 unique colors
- **Interactive Buttons:** 15+ buttons/controls
- **Grid Squares:** 36 (6×6 layout)
- **Pixel Grid Size:** 16×16 per square
- **Named Animations:** 5
- **Modal Dialogs:** 1
- **Toolbars/Bars:** 2+ (header, editor panels)

---

## Usage Tips

1. Use **Cmd/Ctrl+F** in your editor to search this file
2. Search by **component name** (e.g., "QuiltSquare")
3. Search by **visual description** (e.g., "blue button", "dark bar")
4. Search by **function** (e.g., "rotate", "save", "drag")
5. Click file links to jump directly to code locations
6. Color values include hex codes for easy finding

---

**Last Updated:** 2025-12-28
**Total UI Elements Documented:** 50+
