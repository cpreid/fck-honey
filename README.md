# fck-honey
Open source lib for Merchants to detect if an end user has Honey browser extension installed

## Inspiration
[MegaLag exposed Honey as a scam](https://www.youtube.com/watch?v=wwB3FmbcC88)

## Usage (Browser Global)

```html
<script src="https://cdn.jsdelivr.net/npm/fck-honey@0.1/dist/honey-detect.min.js"></script>
<script>
  window.fckHoney.listen((el) => {
    // Decide how you want to handle this.
    // Example: pause checkout and notify the user.
    console.log("Honey overlay detected:", el);
  });
</script>
```

## Usage (ESM)

```js
import { listen } from "fck-honey";

listen((el) => {
  // Decide how you want to handle this.
  // Example: pause checkout and notify the user.
  console.log("Honey overlay detected:", el);
});
```

## Local Dev

```sh
npm run build
```

Open `example/index.html` in your browser.
