export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        message: errors[0]?.message || 'Validation failed.',
        errors,
      });
    }
    req.validatedBody = result.data;
    return next();
  };
}
