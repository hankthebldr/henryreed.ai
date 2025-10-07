export function withRequestMeta(req: any) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();
  return { requestId, timestamp };
}

export function ok(meta: { requestId: string; timestamp: string }, data: any) {
  return { success: true, data, requestId: meta.requestId, timestamp: meta.timestamp };
}

export function err(meta: { requestId: string; timestamp: string }, code: string, message: string, details?: any) {
  return { success: false, error: { code, message, details }, requestId: meta.requestId, timestamp: meta.timestamp };
}
