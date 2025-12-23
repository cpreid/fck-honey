# fck-honey
Open source lib for Merchants to detect if a customer has Honey browser extension installed

<img width="968" height="532" alt="image" src="https://github.com/user-attachments/assets/b0bcccd6-d922-436d-8b0d-dcd4334a9219" />

## Inspiration
[MegaLag exposed Honey as a scam](https://www.youtube.com/watch?v=wwB3FmbcC88)

## Usage (Browser Global)

```html
<script src="https://cdn.jsdelivr.net/npm/fck-honey@0/dist/honey-detect.js"></script>
<script>
window.fckHoney.listen((warn) => {
    // Decide how you want to handle this. Native warn function allows you to tell the user to disable Honey.
    warn("You must disable the Honey extension to continue.");
  });
</script>
```

## Usage (ESM)

```sh
npm install fck-honey
```

```js
import { listen } from "fck-honey";

listen((warn) => {
  // Decide how you want to handle this. Native warn function allows you to tell the user to disable Honey.
  warn("You must disable the Honey extension to continue.");
});
```

## Advanced Options

```js
window.fckHoney.listen((warn, el) => {
  // removeHoney defaults to true (element is auto-removed).
  // Set removeHoney to false if you want to keep the Honey element for some reason.
}, { removeHoney: false });
```

```js
window.fckHoney.listen((warn) => {
  // Stop observing if nothing is detected within 10 seconds.
}, { unbindAfterSeconds: 10 });
```
