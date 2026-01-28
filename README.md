# 💰 Manoply - Monopoly Money Manager

A real-time money transfer app for Monopoly games. No more paper money confusion!

## ✨ Features

- 🏠 **Create Rooms** - Host a game room with a simple 6-character code
- 👥 **Join Rooms** - Up to 8 players can join a single room
- 💸 **Transfer Money** - Instantly send money to other players
- 📨 **Request Money** - Request payments from others (they can accept or decline)
- 📜 **Transaction History** - Track all transfers and requests
- 🎨 **Unique Avatars & Colors** - Each player gets a unique look
- ⚡ **Real-time Updates** - All changes sync instantly via WebSocket

## 🚀 Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### Running Locally

```bash
# Run both frontend and server together
npm run dev:all

# Or run them separately:
# Terminal 1 - Frontend (http://localhost:3000)
npm run dev

# Terminal 2 - Socket Server (http://localhost:3001)
npm run dev:server
```

## 🌐 Deployment

This app requires two deployments:
1. **Frontend** → Vercel (free)
2. **Socket Server** → Railway (free tier)

### Step 1: Deploy Socket Server to Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Important**: Set the root directory to `server`
5. Railway will auto-detect and deploy
6. Go to Settings → Networking → Generate Domain
7. Copy the URL (e.g., `https://manoply-server-production.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project" → Import your repository
3. **Add Environment Variable**:
   - Name: `NEXT_PUBLIC_SOCKET_URL`
   - Value: Your Railway server URL (e.g., `https://manoply-server-production.up.railway.app`)
4. Click "Deploy"

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `https://your-server.up.railway.app` |

## 🎮 How to Use

### Creating a Room

1. Enter your name
2. Give your room a name (e.g., "Family Game Night")
3. Set the starting balance (default: $1,500)
4. Click **Create Room**
5. Share the 6-character room code with friends

### Joining a Room

1. Enter your name
2. Enter the 6-character room code
3. Click **Join Room**

### Transferring Money

1. Find the player you want to send money to
2. Click **Send**
3. Enter the amount (or use quick-select buttons)
4. Click **Send**

### Requesting Money

1. Find the player you want to request money from
2. Click **Request**
3. Enter the amount
4. Click **Request**

The other player will see the request and can either **Pay** or **Decline**.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Express.js with Socket.io
- **Hosting**: Vercel (frontend) + Railway (server)

## 📁 Project Structure

```
manoply/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page (create/join room)
│   │   ├── room/[id]/page.tsx    # Game room page
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── PlayerCard.tsx        # Player display
│   │   ├── TransactionModal.tsx  # Send/Request modal
│   │   ├── RequestNotification.tsx
│   │   └── TransactionHistory.tsx
│   ├── context/
│   │   └── SocketContext.tsx     # Socket.io state
│   └── types/
│       └── index.ts
├── server/                       # Socket.io server (deploy to Railway)
│   ├── index.js
│   ├── package.json
│   └── railway.json
├── package.json
└── vercel.json
```

## 📄 License

MIT License - feel free to use this for your game nights!

---

Made with ❤️ for Monopoly enthusiasts
