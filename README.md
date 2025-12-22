# fck-honey

Detects Honey browser extension overlays so merchants can respond in real time.

## Install (jsDelivr)

```html
<script src="https://cdn.jsdelivr.net/npm/fck-honey@0.1/dist/honey-detect.min.js"></script>
```

## Use

```html
<script>
  window.fckHoney.listen((el) => {
    // Decide how you want to handle this.
    // Example: pause checkout and notify the user.
    console.log("Honey overlay detected:", el);
  });
</script>
```

## Options

```js
window.fckHoney.listen(
  (el) => {
    console.log("Detected:", el);
  },
  {
    uuidGate: true,
    zNearMax: 2147480000
  }
);
```

## Local Dev

```sh
npm run build
```

Open `example/index.html` in your browser.
