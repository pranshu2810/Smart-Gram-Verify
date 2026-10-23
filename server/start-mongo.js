const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function main() {
  const inUse = await isPortInUse(27017);
  if (inUse) {
    console.log('✅ MongoDB is already running on localhost:27017');
    return;
  }

  const dbPath = path.join(__dirname, '..', '.mongo-data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  } else {
    const lock1 = path.join(dbPath, 'mongod.lock');
    const lock2 = path.join(dbPath, 'WiredTiger.lock');
    if (fs.existsSync(lock1)) try { fs.unlinkSync(lock1); } catch (e) {}
    if (fs.existsSync(lock2)) try { fs.unlinkSync(lock2); } catch (e) {}
  }

  const mongodExe = path.join(__dirname, 'node_modules', '.cache', 'mongodb-memory-server', 'mongod-x64-win32-8.2.6.exe');
  console.log('🚀 Starting Native MongoDB daemon on port 27017...');

  const proc = spawn(mongodExe, ['--dbpath', dbPath, '--port', '27017'], {
    stdio: 'inherit'
  });

  proc.on('error', (err) => {
    console.error('❌ Failed to spawn mongod:', err);
  });

  const cleanup = () => {
    console.log('\n🛑 Stopping MongoDB...');
    proc.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch(err => {
  console.error('❌ Failed to start MongoDB:', err);
  process.exit(1);
});
