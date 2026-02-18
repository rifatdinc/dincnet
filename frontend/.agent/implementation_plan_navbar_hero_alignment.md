# Navbar Alignment Fix

## Objective
Align the Navbar content with the Hero section and other page content. The issue was that the Navbar components were spanning the full width of the viewport, while the main content (Hero) was improved in a centered container with a maximum width.

## Changes
1.  **Modified `src/components/cells/Navbar/Navbar.tsx`**:
    *   Updated the internal structure of the desktop navbar to use the `.container` class.
    *   Wrapped the top row content (Logo, Search, Actions) in a `.container` div.
    *   Wrapped the bottom row content (Links) in a `.container` div.
    *   Ensured that the border elements (`border-b`, `border-t`) remain on the full-width wrapper divs so that the visual lines extend to the edges of the screen, while the content remains centered.

## Rationale
*   The `Hero` and `HomeShowcase` components use the `.container` class (defined in `globals.css` as `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`).
*   By applying the same `.container` class to the Navbar's content wrappers, we ensure that the left and right edges of the content align perfectly across the header and the body of the page.
*   Keeping the borders on the outer wrappers ensures the "premium" full-width look is maintained for the structural lines.
