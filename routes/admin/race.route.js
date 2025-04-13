const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/race.controller');

router.get('/', controller.index);

router.get('/detail/:id', controller.detail);

// Hiển thị form đăng ký
router.get('/register/:raceId', controller.showRegisterForm);

// API lấy danh sách tay đua theo đội đua
router.get('/api/racers-by-team/:teamId', controller.getRacersByTeam);

// Xử lý đăng ký
router.post('/register/:raceId', controller.handleRegister);

module.exports = router;