### Upgrade tailwindcss

```
postcss.config.mjs

export default {
  plugins: {
    // Tailwind CSS v4 requires @tailwindcss/postcss plugin
    '@tailwindcss/postcss': {},
  },
}
```

install `bun add -D @tailwindcss/vite`

```
vite.config.ts

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
});
```

#### Implementation

Removed @tailwind directives

```
root.css

@import 'tailwindcss';
```

in other css file place this into beginning file

```
@reference "./root.css";
```
