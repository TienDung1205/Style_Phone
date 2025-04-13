const Race = require('../../models/race.model');
const Registration = require('../../models/registration.model');
const Racer = require('../../models/racer.model');
const Team = require('../../models/team.model');

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

module.exports.index = async (req, res) => {
  let find = {};

  // filterStatus
  const filterStatus = filterStatusHelper(req.query);

  if (req.query.status) {
    find.status = req.query.status;
  }
  // End filterStatus

  // Search
  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  // End Search

  // Pagination
  const count = await Race.countDocuments(find);

  let objectPagination = paginationHelper({
      limitItems: 5,
      currentPage: 1
    },
    req.query,
    count
  )

  // End Pagination

  const races = await Race.find(find)
    .sort({
      position: "desc"
    })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  res.render('admin/pages/races/index.pug', {
    pageTitle: 'Danh sách chặng đua',
    races: races,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
};

module.exports.detail = async (req, res) => {
  const raceId = req.params.id;

  const race = await Race.findById(raceId);
  if (!race) return res.status(404).send("Không tìm thấy chặng đua");

  const registrations = await Registration.find({
      changDuaId: raceId
    })
    .populate({
      path: 'tayDuaId',
      model: 'Racer',
      populate: {
        path: 'doiDuaId'
      }
    });

  // Lọc tay đua hợp lệ (phòng trường hợp populate lỗi null)
  const racers = registrations
    .map(reg => reg.tayDuaId)
    .filter(r => r); // loại undefined/null

  res.render('admin/pages/races/detail.pug', {
    pageTitle: `Chi tiết ${race.tenChang}`,
    race,
    racers
  });
};

exports.showRegisterForm = async (req, res, next) => {
  try {
    const {
      raceId
    } = req.params;
    const {
      teamId
    } = req.query;

    const race = await Race.findById(raceId);
    const teams = await Team.find();

    let racers = [];
    if (teamId) {
      racers = await Racer.find({
        doiDuaId: teamId
      }).populate('doiDuaId');
    }

    // Lấy danh sách tay đua đã đăng ký cho chặng đua
    const registeredRacers = await Registration.find({
      changDuaId: raceId
    }).distinct('tayDuaId');
    

    res.render('admin/pages/races/register', {
      race,
      teams,
      racers,
      selectedTeamId: teamId || '',
      registeredRacers: registeredRacers.map(id => id.toString()), // Chuyển sang string để so sánh dễ dàng
    });
  } catch (err) {
    next(err);
  }
};


exports.handleRegister = async (req, res, next) => {
  try {
    const {
      raceId
    } = req.params;
    const {
      teamId,
      selectedRacers
    } = req.body;

    if (!selectedRacers || selectedRacers.length !== 2) {
      req.flash('error', 'Phải đăng ký đúng 2 tay đua!');
      res.redirect('back');
      return;
    }

    const exists = await Registration.findOne({
      changDuaId: raceId,
      doiDuaId: teamId
    });

    if (exists) {
      await Registration.deleteMany({
        changDuaId: raceId,
        doiDuaId: teamId
      });
    }
    for (const racerId of selectedRacers) {
      const registration = new Registration({
        changDuaId: raceId,
        doiDuaId: teamId,
        tayDuaId: racerId, // Lưu từng racerId riêng biệt
      });
      await registration.save();
    }

    req.flash('success', 'Đăng ký thành công');
    return res.redirect(`back`);
  } catch (err) {
    next(err);
  }
};


exports.getRacersByTeam = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const racers = await Racer.find({
      doiDuaId: teamId
    });
    res.json(racers);
  } catch (err) {
    next(err);
  }
};