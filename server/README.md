# Kyna Jewels Backend Server

## Quick Start

### Windows Users

#### Option 1: Use Batch File (Recommended)

```cmd
start-dev.bat
```

#### Option 2: Use PowerShell

```powershell
.\start-dev.ps1
```

#### Option 3: Manual Commands

```cmd
set NODE_OPTIONS=--max-old-space-size=2048
npm run dev
```

### Unix/Linux/Mac Users

```bash
npm run dev:unix
```

## Available Scripts

- `npm run dev` - Start development server (Windows compatible)
- `npm run dev:memory` - Start with increased memory limit (Windows)
- `npm run dev:debug` - Start with debugging enabled (Windows)
- `npm run dev:unix` - Start development server (Unix/Linux/Mac)
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run start:memory` - Start production with memory limit (Windows)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your environment variables
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Start development: `npm run dev`

## Memory Configuration

If you encounter memory issues, use the memory-optimized scripts:

```cmd
npm run dev:memory
```

Or set the environment variable manually:

```cmd
set NODE_OPTIONS=--max-old-space-size=2048
npm run dev
```

## Troubleshooting

### Common Windows Issues

1. **NODE_OPTIONS not recognized**

   - Use `npm run dev:memory` instead
   - Or run `start-dev.bat`

2. **Permission errors**

   - Run PowerShell as Administrator
   - Or use `start-dev.bat`

3. **Port already in use**
   ```cmd
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Cross-Platform Compatibility

For cross-platform development, install cross-env:

```bash
npm install -D cross-env
```

Then use:

```json
"dev": "cross-env NODE_OPTIONS='--max-old-space-size=2048' ts-node src/app.ts"
```

## Quick Commands

```cmd
REM Install and start
npm install && npm run build && npm run dev

REM Clean restart
rmdir /s /q node_modules dist
npm install && npm run build && npm run dev

REM Production build
npm run build && npm start
```
