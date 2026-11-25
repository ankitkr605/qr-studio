export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Requested resource not found.' });
}

export function errorHandler(err, _req, res, _next) {
  if (err?.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this unique value already exists.' });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  const statusCode = err?.statusCode || 500;
  const message =
    err?.isOperational || statusCode < 500
      ? err.message
      : 'Internal server error. Please try again later.';

  if (statusCode >= 500) {
    console.error('[QR Studio Error]', err);
  }

  return res.status(statusCode).json({ message });
}
