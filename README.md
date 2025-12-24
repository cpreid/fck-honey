# Coupon Shield
Tool for eComm merchants to detect, warn and prevent a customer from shopping using a shady coupon browser extension (Honey, Capital One Shopping, Rakuten). 
<br /><br />View the [Demo video here 🎥](https://youtu.be/Em9Fjil8Xds).

<img width="1307" height="561" alt="image" src="https://github.com/user-attachments/assets/33b2554b-fc90-4b4b-b917-4ed088664200" />

## Easy install (no-JS)
This will automatically detect a coupon extension and show a default warning to the user to disable the extension as shown above). Install this at the very top of the `<head>` in your webpage to ensure it runs prior to the extension.
[jsDelivr package page](https://www.jsdelivr.com/package/npm/coupon-shield).
```html
<script src="https://cdn.jsdelivr.net/npm/coupon-shield@latest/dist/auto.min.js"></script>
```

## Custom Usage (Browser Global)

```html
<script src="https://cdn.jsdelivr.net/npm/coupon-shield@latest/dist/couponshield.min.js"></script>
<script>
window.couponShield.listen((warn, el, vendor) => {
    // Decide how you want to handle this. Native warn function allows you to tell the user to disable the extension.
    // vendor is "honey", "Capital One Shopping", or "Rakuten"
    warn("You must disable the Honey extension to continue.");
  });
</script>
```

## Custom Usage (ESM)

```sh
npm install coupon-shield
```

```js
import { listen } from "coupon-shield";

listen((warn, el, vendor) => {
  // Decide how you want to handle this. Native warn function allows you to tell the user to disable the extension.
  // vendor is "honey", "Capital One Shopping", or "Rakuten"
  warn("You must disable the Honey extension to continue.");
});
```

## Advanced Options

```js
window.couponShield.listen((warn, el, vendor) => {
  // removeHoney defaults to true (extension element loaded onto the page is auto-removed).
  // Set removeHoney to false if you want to keep the extension element for some reason.
  // vendor is "honey", "Capital One Shopping", or "Rakuten"
}, { removeHoney: false });
```

```js
window.couponShield.listen((warn) => {
  // Stop observing if nothing is detected within 10 seconds.
}, { unbindAfterSeconds: 10 });
```

## Inspiration
[MegaLag exposed Honey as a scam](https://www.youtube.com/watch?v=wwB3FmbcC88)
