/**
 * validates req.body against a Joi schema.
 * On success, req.body is replaced with the validated + defaulted value.
 */
const validateData = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const detail = {};
      error.details.forEach((d) => {
        detail[d.path.join(".")] = d.message;
      });

      return next({
        code: 422,
        message: "Validation failed",
        status: "ERR_VALIDATION",
        detail,
      });
    }

    req.body = value;
    next();
  };
};

module.exports = validateData;
