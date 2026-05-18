const Joi = require('joi');

/**
 * Joi validation middleware factory.
 * Wraps a Joi schema and validates req.body against it.
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const message = error.details.map(d => d.message).join(', ');
        res.status(400);
        return next(new Error(message));
    }
    next();
};

// --- Task Schemas ---

const createTaskSchema = Joi.object({
    title:       Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().allow('').max(5000),
    status:      Joi.string().valid('backlog', 'todo', 'in_progress', 'review', 'done'),
    priority:    Joi.string().valid('low', 'medium', 'high', 'urgent'),
    dueDate:     Joi.date().iso().allow(null),
    labels:      Joi.array().items(Joi.object({
        name:  Joi.string().max(50),
        color: Joi.string().max(20)
    })),
    assignees:   Joi.array().items(Joi.string().hex().length(24)), // ObjectId strings
});

const updateTaskSchema = Joi.object({
    title:       Joi.string().trim().min(1).max(200),
    description: Joi.string().allow('').max(5000),
    status:      Joi.string().valid('backlog', 'todo', 'in_progress', 'review', 'done'),
    priority:    Joi.string().valid('low', 'medium', 'high', 'urgent'),
    dueDate:     Joi.date().iso().allow(null),
    labels:      Joi.array().items(Joi.object({
        name:  Joi.string().max(50),
        color: Joi.string().max(20)
    })),
    assignees:   Joi.array().items(Joi.string().hex().length(24)),
}).min(1); // At least one field must be present

const moveTaskSchema = Joi.object({
    status:   Joi.string().valid('backlog', 'todo', 'in_progress', 'review', 'done').required(),
    position: Joi.number().integer().min(0).required(),
});

const commentSchema = Joi.object({
    text: Joi.string().trim().min(1).max(1000).required(),
});

const subtaskSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
});

module.exports = {
    validate,
    createTaskSchema,
    updateTaskSchema,
    moveTaskSchema,
    commentSchema,
    subtaskSchema,
};
