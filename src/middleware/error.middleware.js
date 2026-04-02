module.exports = (err, req, res, next) => {
  console.error('[Error Middleware]', err.message || err);

  // You can extend this to handle specific Postgres errors natively,
  // e.g., error.code === '23505' for Unique Constraint Failures

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists (Conflict)' });
  }

  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
};
