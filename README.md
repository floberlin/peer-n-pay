# Peer'n'Pay

## Description

Experience the future of seamless communication and financial transactions with Peer'n'Pay! This cutting-edge application, designed for crypto enthusiasts and novices alike, is set to revolutionize digital interactions.

Peer'n'Pay harnesses the power of Next.js and Capacitor to deliver a cross-platform experience that transcends traditional boundaries. From web apps to native iOS and Android platforms, our solution is everywhere you need it to be. The core aim of Peer'n'Pay is to marry the convenience of popular chat apps like WhatsApp and Telegram with the ease of crypto transactions associated with services like PayPal or Venmo.

At the heart of our chat functionality is the Push protocol, which enables end-to-end encrypted communication using PGP. This ensures that your messages remain private and secure, no matter where they're sent. Signing up is a breeze with magic.link - simply use your email address or an existing wallet to join.

We understand the importance of personalisation in the crypto world. That's why Peer'n'Pay incorporates ENS name resolution and ENS avatars, enabling you to send messages or make transactions using the recipient's ENS name.

## Build for Web

```bash
yarn
yarn dev
```

## Build for iOS

```bash
yarn
yarn build
yarn export
npx cap add ios
npx cap sync ios
npx cap open ios
```

## Build for Android

```bash
yarn
yarn build
yarn export
npx cap add android
npx cap sync android
npx cap open android
```

Deployed to web: [App]("https://peer-n-pay.vercel.app/")
