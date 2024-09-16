// Middleware for validation
export const joiValidate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
// Middleware for params validation
export const joiParamValidate = (schema) => (req, res, next) => {
    console.log(req.params,'---');
    
    const { error } = schema.validate(req.params);
    if (error) {
        console.log(error);
        
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};