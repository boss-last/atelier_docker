const { Router } = require('express');
const ctrl = require('../controllers/bookController');

const router = Router();

router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);

module.exports = router;
