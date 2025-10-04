export const safeEmit = (socket, event, payload) => {
try { socket.emit(event, payload); } catch (e) { console.warn('Emit failed', e); }
};