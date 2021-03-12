const { validationResult } = require('../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates create new item request
 */
exports.createItem = [
    check('id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY')
        .trim(),
    check('tax')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY')
        .trim(),
    check('modifiedOn')
        .exists(),
    check('amount')
        .exists(),
    check('createdOn')
        .exists(),
    check('custom_data')
        .exists(),
    (req, res, next) => {
        validationResult(req, res, next)
    }
]
/**
 * Validates update item request
 */
exports.updateItem = [
    check('tax')
        .optional(),
    check('modifiedOn')
        .optional(),
    check('amount')
        .optional(),
    check('createdOn')
        .optional(),
    check('custom_data')
        .optional(),
    check('id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next)
    }
]

/**
 * Validates get item request
 */
exports.getItem = [
    check('id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next)
    }
]

/**
 * Validates delete item request
 */
exports.deleteItem = [
    check('id')
        .exists()
        .withMessage('MISSING')
        .not()
        .isEmpty()
        .withMessage('IS_EMPTY'),
    (req, res, next) => {
        validationResult(req, res, next)
    }
]
