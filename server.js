import { createServer } from 'http';
import app from './src/app.js';
import { initSocketServer } from './src/socket/index.js';
import { PORT } from './src/config.js';


const server = createServer(app);
initSocketServer(server);


server.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});