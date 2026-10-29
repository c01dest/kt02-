const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        details
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;