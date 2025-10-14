# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**AI Tools Hub** is a bilingual (Arabic/English) static website that serves as a comprehensive directory of 200+ AI tools, desktop applications, mobile apps, AI models, and educational resources. The site features a modern dark-themed UI with responsive design, smooth animations, and full RTL/LTR support.

## Technology Stack

- **HTML5**: Semantic markup with bilingual data attributes
- **CSS3**: Custom properties, CSS Grid, Flexbox, dark theme with gradient accents
- **Vanilla JavaScript (ES6+)**: Class-based architecture, no frameworks or build tools
- **External Dependencies**:
  - Font Awesome 6.4.0 (icons)
  - Google Fonts: Cairo (Arabic), Poppins (English)

## Development Commands

### Viewing the Site

Since this is a static HTML/CSS/JS website with no build process, simply open in a browser:

**Using a local server (recommended for development):**
```powershell
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if http-server is installed)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

**Direct file access:**
```powershell
# Open directly in default browser
Start-Process "index.html"

# Or specify browser
Start-Process chrome "G:\Designe\HTML\Github\ai-tools\index.html"
```

### Version Control

**View recent changes:**
```powershell
git --no-pager log --oneline -20
git --no-pager diff HEAD~1
```

**Check current status:**
```powershell
git --no-pager status
```

### Code Quality

**No linters/formatters configured** - this project does not use automated linting or formatting tools. Code style is maintained manually.

## Architecture Overview

### File Structure

```
ai-tools/
├── index.html          # Single-page application with all content
├── css/
│   └── style.css      # 1000+ lines of custom CSS with CSS variables
├── js/
│   └── script.js      # 500+ lines of modular JavaScript classes
├── assets/
│   ├── images/        # Image resources
│   └── icons/         # Icon resources
└── README.md          # Project documentation
```

### JavaScript Architecture

The codebase uses a **class-based modular architecture** with separate concerns:

**Core Classes (initialized on DOMContentLoaded):**

1. **LanguageManager** - Handles Arabic ↔ English switching
   - Persists language preference to localStorage
   - Toggles `lang` and `dir` attributes on `<html>` 
   - Updates all elements with `data-ar` and `data-en` attributes
   - Keyboard shortcut: `Ctrl/Cmd + K`

2. **MobileMenu** - Responsive navigation menu
   - Toggles mobile menu visibility
   - Animated hamburger button (transforms to X)
   - Auto-closes on link click or outside click

3. **ScrollEffects** - Scroll-based UI updates
   - Navbar background change on scroll
   - Scroll-to-top button visibility
   - Reveal animations for cards (fade + translateY)

4. **SmoothScroll** - Smooth anchor link scrolling
   - Handles all `href="#..."` links
   - Accounts for fixed navbar offset (80px)

5. **ContactForm** - Form submission handler
   - Prevents default submission
   - Shows success notification (bilingual)
   - Resets form after submission

6. **AnimationUtils** - Animation helpers
   - Injects notification animation keyframes
   - Sets initial state for card reveal animations
   - Adds hover effect transitions to cards

7. **ParallaxEffect** - Subtle parallax scrolling
   - Applies to `.hero-particles` elements

8. **StatsCounter** - Animated number counters
   - Animates hero stats (200+, 50+, 100+) on scroll into view
   - Uses `requestAnimationFrame` for smooth counting

9. **ActiveNavigation** - Highlights current section in nav
   - Updates active nav link based on scroll position

10. **SearchTools** - Optional search functionality
    - Filters tool cards by title/description
    - (Only active if `#searchTools` input exists)

11. **PageLoader** - Initial page load animation
    - Fade-in effect on page load

12. **KeyboardShortcuts** - Keyboard accessibility
    - `Ctrl/Cmd + K`: Toggle language
    - `Esc`: Close mobile menu

### CSS Architecture

**Variables-based theming** using `:root` CSS custom properties:

- **Colors**: Primary (Indigo #6366f1), Secondary (Purple #8b5cf6), Accent (Pink #ec4899)
- **Backgrounds**: Dark blue (#0f172a) → Slate (#1e293b) gradient
- **Transitions**: `--transition-fast` (0.2s), `--transition-normal` (0.3s), `--transition-slow` (0.5s)
- **Border Radius**: `--border-radius-sm` through `--border-radius-xl`

**Key CSS Patterns:**
- Fixed navbar with scroll-triggered background change
- Card-based grid layouts (`.tools-grid` with 3 columns, responsive)
- RTL/LTR directional support via `body[dir="rtl"]` and `body[dir="ltr"]` selectors
- Gradient backgrounds using `linear-gradient()`
- Box shadows with multiple depths (`--shadow-sm` through `--shadow-xl`)

### HTML Architecture

**Bilingual Content System:**
- All translatable elements have `data-ar="..."` and `data-en="..."` attributes
- LanguageManager reads these and updates `.textContent` on language toggle
- Initial render is in Arabic (default `lang="ar"` and `dir="rtl"`)

**Section Structure:**
1. **Navigation** - Fixed navbar with responsive menu
2. **Hero** - Animated hero section with stats (200+ tools, 50+ mobile apps, 100+ desktop apps)
3. **Web Tools** (#web-tools) - Categorized AI tools:
   - Text Generation & Chat (ChatGPT, Claude, Gemini, Perplexity, Jasper, Copy.ai)
   - Image Generation & Editing (Midjourney, DALL-E 3, Stable Diffusion, Leonardo AI, Adobe Firefly, Remove.bg, Cleanup.pictures)
   - Video Generation & Editing (Runway ML, Synthesia, Pictory AI, Descript)
   - Audio & Music (ElevenLabs, Mubert, AIVA, Speechify)
   - Code & Development (GitHub Copilot, Tabnine, Replit AI, Codeium)
   - Productivity & Business (Notion AI, Beautiful.ai, Superhuman, Reclaim AI)
4. **Chrome Extensions** (#chrome-extensions) - Browser extensions (15+ extensions including ChatGPT for Google, Grammarly, Compose AI, LINER AI, Merlin AI, etc.)
5. **Desktop Apps** (#desktop-apps) - Desktop software listings for Windows/Mac/Linux
6. **Mobile Apps** (#mobile-apps) - Android and iOS applications
7. **AI Models** (#ai-models) - Latest AI models (GPT-4, Claude 3, Gemini, Llama 3)
8. **Resources** (#resources) - Educational content (courses, books, YouTube channels, blogs, developer tools, communities)
9. **Footer** - Links, categories, social media, copyright

Each tool/app/model is rendered as a `.tool-card` with:
- Icon container (`.tool-icon` with Font Awesome)
- Title (`<h4>`)
- Description (`<p>` with bilingual data attributes)
- External link (`.tool-link`)

## Common Development Tasks

### Adding a New AI Tool

1. Locate the appropriate category section in `index.html` (e.g., "🤖 Text Generation & Chat")
2. Add a new `.tool-card` div within the `.tools-grid`:

```html
<div class="tool-card">
    <div class="tool-icon"><i class="fas fa-icon-name"></i></div>
    <h4>Tool Name</h4>
    <p data-ar="وصف بالعربية" data-en="English description">وصف بالعربية</p>
    <a href="https://example.com" target="_blank" class="tool-link" 
       data-ar="زيارة الموقع" data-en="Visit Site">
        زيارة الموقع <i class="fas fa-arrow-left"></i>
    </a>
</div>
```

3. No JavaScript changes needed - animations/language switching are automatic

### Adding a New Chrome Extension

1. Navigate to the Chrome Extensions section (#chrome-extensions) in `index.html`
2. Add a new `.tool-card` div within the `.tools-grid`:

```html
<div class="tool-card">
    <div class="tool-icon"><i class="fab fa-chrome"></i></div>
    <h4>Extension Name</h4>
    <p data-ar="وصف الإضافة بالعربية" data-en="Extension description in English">وصف الإضافة بالعربية</p>
    <a href="https://chrome.google.com/webstore/detail/extension-id/" target="_blank" 
       class="tool-link" 
       data-ar="تثبيت الإضافة" data-en="Install Extension">
        تثبيت الإضافة <i class="fas fa-external-link-alt"></i>
    </a>
</div>
```

**Note:** 
- Use `<i class="fab fa-chrome"></i>` for Chrome icon
- Link text should be "تثبيت الإضافة" (Arabic) / "Install Extension" (English)
- Use `fa-external-link-alt` icon for external links instead of `fa-arrow-left`

### Adding a New Category

1. Add a new `.category` section in `index.html` under the appropriate parent section
2. Follow the existing structure:

```html
<div class="category">
    <h3 class="category-title" 
        data-ar="🎯 العنوان بالعربية" 
        data-en="🎯 English Title">
        🎯 العنوان بالعربية
    </h3>
    <div class="tools-grid">
        <!-- Add tool cards here -->
    </div>
</div>
```

3. Style adjustments (if needed) go in `css/style.css` under the `.category` or `.tools-grid` selectors

### Modifying Styles

**Color scheme changes:**
- Edit `:root` variables in `css/style.css` (lines 6-43)
- Primary colors: `--primary-color`, `--secondary-color`, `--accent-color`
- Background colors: `--bg-primary`, `--bg-secondary`, `--bg-card`

**Layout changes:**
- Grid columns: Search for `.tools-grid` and modify `grid-template-columns`
- Breakpoints: Media queries are at the bottom of `style.css`

**Typography:**
- Font families defined in `:root` and `body` selector
- Arabic font: Cairo (loaded from Google Fonts)
- English font: Poppins (loaded from Google Fonts)

### Adding JavaScript Functionality

1. Create a new class in `js/script.js` following the existing pattern:

```javascript
class NewFeature {
    constructor() {
        this.init();
    }
    
    init() {
        // Setup code
    }
}
```

2. Initialize in the `DOMContentLoaded` event listener (bottom of `script.js`):

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initializations
    new NewFeature();
});
```

## Important Implementation Details

### Language System

- **Default language**: Arabic (RTL)
- **Storage**: User preference saved to `localStorage.getItem('language')`
- **Direction switching**: Both `<html>` and `<body>` get `dir` attribute updated
- **Font switching**: CSS selectors `body[dir="ltr"]` apply English font family
- **Arrow icons**: Use Font Awesome directional arrows (automatically flip with RTL)

### Animations

- **Card reveal**: Cards start with `opacity: 0` and `translateY(30px)`, animated on scroll
- **Scroll trigger**: Cards animate when they are 100px from the bottom of viewport
- **Performance**: Uses `requestAnimationFrame` for counter animations
- **One-time animations**: Stats counter uses `hasAnimated` flag to prevent re-triggering

### Mobile Responsiveness

- **Breakpoints** (in `style.css`):
  - Desktop: 1200px+
  - Tablet: 768px - 1199px  
  - Mobile: < 768px
- **Mobile menu**: Hamburger appears < 768px, overlays on toggle
- **Grid columns**: 3 cols (desktop) → 2 cols (tablet) → 1 col (mobile)

### Performance Optimizations

- **Lazy loading**: Image observer setup present but requires `data-src` attributes
- **Passive scroll listeners**: Consider adding `{ passive: true }` to scroll event listeners
- **Debouncing**: Search functionality could benefit from debouncing (currently immediate)
- **Service Worker**: PWA support code present but commented out (line 551-554 in `script.js`)

## Troubleshooting

**Language toggle not working:**
- Check browser localStorage is enabled
- Verify `data-ar` and `data-en` attributes exist on element
- Check console for JavaScript errors

**Mobile menu not closing:**
- Verify `#navMenu` and `#mobileMenuBtn` IDs exist
- Check z-index conflicts in CSS

**Animations not triggering:**
- Ensure elements have `.tool-card`, `.model-card`, or `.resource-card` classes
- Check `ScrollEffects.revealOnScroll()` is being called
- Verify element is within viewport detection range (windowHeight - 100px)

**RTL layout issues:**
- CSS must use logical properties or have both `[dir="rtl"]` and `[dir="ltr"]` selectors
- Flexbox `flex-direction` may need explicit RTL overrides
- Margin/padding: Use `inline-start`/`inline-end` for RTL-safe spacing

## Content Statistics & Organization

### Current Content Overview

**Web Tools Section:**
- Text Generation & Chat: 6 tools (ChatGPT, Claude AI, Google Gemini, Perplexity AI, Jasper AI, Copy.ai)
- Image Generation & Editing: 8 tools (Midjourney, DALL-E 3, Stable Diffusion, Leonardo AI, Adobe Firefly, Upscale.media, Remove.bg, Cleanup.pictures)
- Video Generation & Editing: 4 tools (Runway ML, Synthesia, Pictory AI, Descript)
- Audio & Music: 4 tools (ElevenLabs, Mubert, AIVA, Speechify)
- Code & Development: 4 tools (GitHub Copilot, Tabnine, Replit AI, Codeium)
- Productivity & Business: 4 tools (Notion AI, Beautiful.ai, Superhuman, Reclaim AI)

**Chrome Extensions Section:**
- 15 extensions including ChatGPT for Google, Grammarly, Compose AI, LINER AI, Merlin AI, Scribe AI, Wiseone, Perplexity AI, Fireflies AI, Jasper AI Writer, Monica AI, YouTube Summary AI, Speechify, Otter AI, Tango

**Desktop Apps Section:**
- 6 Windows/Mac/Linux applications (Topaz Photo AI, Adobe Photoshop AI, DaVinci Resolve, Grammarly Desktop, Stable Diffusion Desktop, Krisp AI)

**Mobile Apps Section:**
- Multiple Android & iOS applications

**AI Models Section:**
- 4 major models (GPT-4, Claude 3, Google Gemini, Llama 3)

**Resources Section:**
- 6 categories: Online Courses, Books & References, YouTube Channels, Blogs & Articles, Developer Tools, Communities & Forums

### Link Structure Patterns

**External links use different patterns:**
1. Web tools: `target="_blank"` with `data-ar="زيارة الموقع"` (Visit Site)
2. Chrome extensions: `target="_blank"` with `data-ar="تثبيت الإضافة"` (Install Extension)
3. Desktop apps: `target="_blank"` with `data-ar="تحميل"` (Download)
4. Mobile apps: Dual buttons for Google Play and App Store

### CSS Class Patterns

**Card types:**
- `.tool-card` - Used for web tools, Chrome extensions, desktop apps, mobile apps
- `.model-card` - Used for AI models section
- `.resource-card` - Used for educational resources

**Section alternating:**
- Sections alternate between `.section` and `.section.section-alt` for visual variety
- Hero section has unique `.hero` class with parallax effects

**Grid layouts:**
- `.tools-grid` - 3 columns on desktop, 2 on tablet, 1 on mobile
- `.resources-grid` - Similar responsive grid for resources

## Data Management

### Adding Bulk Content

When adding multiple tools/extensions at once:

1. **Prepare data** in structured format (JSON/CSV) with fields:
   - name (string)
   - description_ar (string)
   - description_en (string)
   - url (string)
   - icon (Font Awesome class)
   - category (string)

2. **Generate HTML** using a template:
```javascript
// Example Node.js script to generate cards
const tools = require('./tools.json');
tools.forEach(tool => {
  console.log(`
    <div class="tool-card">
      <div class="tool-icon"><i class="${tool.icon}"></i></div>
      <h4>${tool.name}</h4>
      <p data-ar="${tool.description_ar}" data-en="${tool.description_en}">${tool.description_ar}</p>
      <a href="${tool.url}" target="_blank" class="tool-link" data-ar="زيارة الموقع" data-en="Visit Site">زيارة الموقع <i class="fas fa-arrow-left"></i></a>
    </div>
  `);
});
```

3. **Copy-paste** generated HTML into appropriate section
4. **Test** language switching and animations

### Content Guidelines

**Tool descriptions should:**
- Be concise (max 60-80 characters in each language)
- Focus on the main feature/benefit
- Use active voice
- Be specific, not generic

**Arabic text guidelines:**
- Use proper diacritics where necessary for clarity
- Ensure RTL text flow is natural
- Test with both short and long text to verify layout

**URL guidelines:**
- Always use HTTPS
- Verify links are active before adding
- Use official/primary domains, not affiliate links
- Include `target="_blank"` for external links

## Development Best Practices

### Performance Considerations

**Current file sizes:**
- `index.html`: ~671 lines (growing with content)
- `style.css`: ~1047 lines
- `script.js`: ~508 lines

**Optimization tips:**
1. **HTML**: Consider lazy loading for images if added
2. **CSS**: CSS is well-organized with variables; no immediate optimization needed
3. **JavaScript**: All classes are initialized once; consider code splitting if file grows beyond 1000 lines

**Loading performance:**
- External resources: Font Awesome CDN, Google Fonts
- No build step means fast development, but consider minification for production
- Current page weight is light (mostly text-based)

### Testing Checklist

When adding new content:
- [ ] Test in Chrome (primary target)
- [ ] Test in Firefox
- [ ] Test in Safari (if on Mac)
- [ ] Test mobile view (Chrome DevTools device mode)
- [ ] Test language toggle (Arabic ↔ English)
- [ ] Verify all links open in new tab
- [ ] Check RTL layout (Arabic mode)
- [ ] Verify animations trigger on scroll
- [ ] Test keyboard shortcuts (Ctrl+K, Esc)

### Git Workflow

**Commit message patterns observed:**
```bash
git commit -m "Add [feature/section name]"
git commit -m "Update [what was updated]"
git commit -m "Fix [what was fixed]"
```

**Common tasks:**
```powershell
# View changes before commit
git --no-pager diff

# Stage all changes
git add .

# Commit and push
git commit -m "Add Chrome Extensions section with 15 tools"
git push origin main

# View recent commits
git --no-pager log --oneline -10
```

## Browser Compatibility

Tested and compatible with:
- Chrome/Edge (Chromium-based)
- Firefox
- Safari
- Opera

**Minimum requirements:**
- ES6 class support
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- IntersectionObserver (for lazy loading, with feature detection)

## External Resources

**CDN Dependencies:**
1. Font Awesome 6.4.0: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
2. Google Fonts: Cairo (Arabic) & Poppins (English)

**No npm dependencies** - This is a pure HTML/CSS/JS project with no build tools or package managers.

## Future Enhancement Ideas

**Potential features to add:**
1. Search/filter functionality (SearchTools class already exists but needs UI)
2. Favorites/bookmarking system (localStorage-based)
3. Tool ratings/reviews
4. "New" badges for recently added tools
5. Filter by category tags
6. Dark/light theme toggle (currently dark-only)
7. Export favorites to JSON/CSV
8. Integration with browser bookmarks API
9. PWA features (service worker code is present but commented)
10. Analytics integration (Google Analytics/Plausible)
