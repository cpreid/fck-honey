# Coupon Shield
Tool for eComm merchants to detect, warn and prevent a customer from shopping using a shady coupon browser extension (Honey, Capital One Shopping, Rakuten). 
<br /><br />View the [Demo video here 🎥](https://youtu.be/Em9Fjil8Xds).

<img width="1307" height="561" alt="image" src="https://github.com/user-attachments/assets/33b2554b-fc90-4b4b-b917-4ed088664200" />

## Easy install (no-JS)
This will automatically listen for Honey and show a default warning to the user to disable the extension as shown above).

Install this at the very top of the `<head>` in your webpage to ensure it runs prior to Honey.
```html
<script src="https://cdn.jsdelivr.net/npm/fck-honey@latest/dist/auto.min.js"></script>
```

## Custom Usage (Browser Global)

```html
<script src="https://cdn.jsdelivr.net/npm/fck-honey@latest/dist/honey-detect.min.js"></script>
<script>
window.fckHoney.listen((warn, el, vendor) => {
    // Decide how you want to handle this. Native warn function allows you to tell the user to disable Honey.
    // vendor is "honey", "Capital One Shopping", or "Rakuten"
    warn("You must disable the Honey extension to continue.");
  });
</script>
```

## Custom Usage (ESM)

```sh
npm install fck-honey
```

```js
import { listen } from "fck-honey";

listen((warn, el, vendor) => {
  // Decide how you want to handle this. Native warn function allows you to tell the user to disable Honey.
  // vendor is "honey", "Capital One Shopping", or "Rakuten"
  warn("You must disable the Honey extension to continue.");
});
```

## Advanced Options

```js
window.fckHoney.listen((warn, el, vendor) => {
  // removeHoney defaults to true (element is auto-removed).
  // Set removeHoney to false if you want to keep the Honey element for some reason.
  // vendor is "honey", "Capital One Shopping", or "Rakuten"
}, { removeHoney: false });
```

```js
window.fckHoney.listen((warn) => {
  // Stop observing if nothing is detected within 10 seconds.
}, { unbindAfterSeconds: 10 });
```

## Inspiration
[MegaLag exposed Honey as a scam](https://www.youtube.com/watch?v=wwB3FmbcC88)
