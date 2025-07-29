# Custom Color Palette for Tailwind CSS

This guide shows you how to add your custom color palette to a Tailwind CSS project.

## 1. Update your `tailwind.config.js` file

Add the following custom colors to your Tailwind configuration:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add your content paths here
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy Blue
        navy: {
          50: '#f5f7f9',
          100: '#e8eef2',
          200: '#c7d7e2',
          300: '#94b5c9',
          400: '#5a8dad',
          500: '#1c3547', // Base color
          600: '#182e3e',
          700: '#132333',
          800: '#0e1a28',
          900: '#09111d',
          950: '#050a12'
        },
        // Cool Gray
        gray: {
          50: '#f7f8f8',
          100: '#eeeff0',
          200: '#d3d6d7',
          300: '#a8afb1',
          400: '#737f82',
          500: '#3e5152', // Base color
          600: '#354546',
          700: '#2a3839',
          800: '#1f2a2b',
          900: '#141d1e',
          950: '#0a1011'
        },
        // Golden Yellow
        yellow: {
          50: '#fefdf5',
          100: '#fdfae8',
          200: '#faf2c7',
          300: '#f5e394',
          400: '#eece5a',
          500: '#dc991b', // Base color
          600: '#bb8217',
          700: '#976612',
          800: '#734f0e',
          900: '#4f3709',
          950: '#2a1e05'
        },
        // Base Orange
        orange: {
          50: '#fef8f5',
          100: '#fef0e8',
          200: '#fddcc7',
          300: '#fbc194',
          400: '#f7995a',
          500: '#ea870a', // Base color
          600: '#c77309',
          700: '#a15c07',
          800: '#7a4605',
          900: '#532f03',
          950: '#2c1902'
        },
        // Vibrant Orange-Red
        red: {
          50: '#fef6f5',
          100: '#fdece8',
          200: '#fad4cc',
          300: '#f5b39f',
          400: '#ed8a6b',
          500: '#df553f', // Base color
          600: '#bd4835',
          700: '#963a2a',
          800: '#712c20',
          900: '#4c1e15',
          950: '#26100b'
        }
      }
    },
  },
  plugins: [],
}
```

## 2. Usage Examples

Once configured, you can use these colors throughout your project:

### Background Colors
```html
<!-- Navy variants -->
<div class="bg-navy-50">Very light navy</div>
<div class="bg-navy-500">Base navy</div>
<div class="bg-navy-950">Very dark navy</div>

<!-- Gray variants -->
<div class="bg-gray-200">Light gray</div>
<div class="bg-gray-500">Base gray</div>
<div class="bg-gray-800">Dark gray</div>

<!-- Yellow variants -->
<div class="bg-yellow-100">Light yellow</div>
<div class="bg-yellow-500">Base golden yellow</div>
<div class="bg-yellow-900">Dark yellow</div>

<!-- Orange variants -->
<div class="bg-orange-300">Light orange</div>
<div class="bg-orange-500">Base orange</div>
<div class="bg-orange-700">Dark orange</div>

<!-- Red variants -->
<div class="bg-red-400">Light red</div>
<div class="bg-red-500">Base orange-red</div>
<div class="bg-red-600">Dark red</div>
```

### Text Colors
```html
<p class="text-navy-700">Dark navy text</p>
<p class="text-gray-600">Medium gray text</p>
<p class="text-yellow-500">Golden yellow text</p>
<p class="text-orange-500">Orange text</p>
<p class="text-red-500">Orange-red text</p>
```

### Border Colors
```html
<div class="border border-navy-300">Navy border</div>
<div class="border-2 border-yellow-500">Golden border</div>
<div class="border-l-4 border-red-500">Left red border</div>
```

### Hover States
```html
<button class="bg-navy-500 hover:bg-navy-600 text-white">
  Navy Button
</button>

<button class="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
  Golden Button
</button>

<button class="bg-red-500 hover:bg-red-600 text-white">
  Accent Button
</button>
```

## 3. Color Palette Reference

| Color | Weight | Hex Code | Usage |
|-------|--------|----------|--------|
| **Navy** | 50-950 | #f5f7f9 - #050a12 | Primary, headers, navigation |
| **Gray** | 50-950 | #f7f8f8 - #0a1011 | Text, backgrounds, borders |
| **Yellow** | 50-950 | #fefdf5 - #2a1e05 | Highlights, CTAs, emphasis |
| **Orange** | 50-950 | #fef8f5 - #2c1902 | Secondary actions, warm accents |
| **Red** | 50-950 | #fef6f5 - #26100b | Alerts, important actions |

## 4. Design System Recommendations

### Primary Combinations
- **Navy 500** + **Yellow 500** + **Gray 600** (main brand colors)
- **Navy 700** + **Orange 500** + **Gray 400** (warm variant)
- **Navy 600** + **Red 500** + **Gray 500** (high contrast)

### Accessibility Tips
- Use **Navy 700+** or **Gray 700+** for text on light backgrounds
- Use **Navy 50-200** or **Gray 50-200** for text on dark backgrounds
- **Yellow 500** and **Orange 500** work well for highlights but check contrast
- **Red 500** is perfect for error states and important CTAs

### Background Combinations
- Light theme: **Gray 50** background with **Navy 700** text
- Dark theme: **Navy 900** background with **Gray 100** text
- Cards: **White** or **Gray 50** with **Gray 200** borders

## 5. After Configuration

1. Restart your development server
2. Your custom colors will be available as `navy-*`, `gray-*`, `yellow-*`, `orange-*`, and `red-*`
3. All Tailwind utilities (bg-, text-, border-, etc.) will work with your custom colors
4. Use the base colors (500 weight) as your primary brand colors