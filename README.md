# EKS vs ECS Interactive Learning Game

A local Node.js web app that teaches the differences between AWS EKS and ECS, common EKS cluster setup challenges, and pitfalls to avoid. Ideal for interview preparation and developer learning.

## Run locally

1. Open a terminal in `c:\Projects\EKSvECSGame`
2. Run `npm install`
3. Start the app with `npm start`
4. Open `http://localhost:3000` in your browser

## Runtime load demo

- Use the `Generate Load` button to simulate external traffic and increase cluster CPU/memory pressure.
- When autoscaling is enabled, the simulator now adds pods and updates node load immediately.
- The `Cluster event history` panel tracks load changes and scale-up/scale-down decisions.

## Project structure

- `server.js` - Node.js Express server hosting the static game
- `public/index.html` - game page
- `public/style.css` - layout and styling
- `public/game.js` - interactive game logic
