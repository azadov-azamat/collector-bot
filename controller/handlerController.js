const AppError = require('../util/AppError');
const catchErrorAsync = require('../util/catchError');
const db = require('./../model/index');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

const responseFunction = (req, res, statusCode, data, count) => {
  let page = req?.query?.page || 1;
  let limit = req.query?.limit * 1 || count;

  let pageCount;

  pageCount = Math.ceil(count / limit);

  if (Array.isArray(data)) {
    res.status(statusCode).json({
      status: 'Success',
      limit: limit,
      currentPage: page,
      pageCount: pageCount,
      totalCount: count,
      data: data,
    });
  } else {
    res.status(statusCode).json({
      status: 'Success',
      data: data,
    });
  }
};

const queryFunction = (req) => {
  let paramQuerySQL = {};
  let sort = req.query?.sort || '';
  let page = req.query?.page || 1;
  let limit = req.query?.limit || null;
  let offset;

  // sorting
  if (sort !== '' && typeof sort !== 'undefined') {
    let query;
    if (sort.charAt(0) !== '-') {
      query = [[sort, 'ASC']];
    } else {
      query = [[sort.replace('-', ''), 'DESC']];
    }
    paramQuerySQL.order = query;
  }

  // pagination
  if (limit) {
    offset = page * limit - limit;
    paramQuerySQL.offset = offset;
    paramQuerySQL.limit = limit * 1;
  }
  return paramQuerySQL;
};

const addOne = (Model, func, options) => {
  return catchErrorAsync(async (req, res, next) => {
    let data = await Model.create(req.body);
    if (func) {
      func(req, res, next);
    }
    responseFunction(req, res, 201, data);
  });
};

const addAll = (Model, func, options) => {
  return catchErrorAsync(async (req, res, next) => {
    let data = await Model.bulkCreate(req.body);
    if (func) {
      func(req, res, next);
    }
    res.status(201).json({
      status: 'Success',
      count: data.length,
      data: data,
    });
    responseFunction(req, res, 201, data);
  });
};
const deleteOne = (Model) => {
  return catchErrorAsync(async (req, res, next) => {
    const data = await Model.destroy({ where: { id: req.params.id } });
    if (!data) {
      return next(new AppError('Data is not found with that ID', 404));
    }
    responseFunction(req, res, 204, data);
  });
};

const updateOne = (Model) => {
  return catchErrorAsync(async (req, res, next) => {
    if (req.body.id) {
      delete req.body['id'];
    }

    let data = await Model.update(req.body, {
      where: { id: req.params.id },
    });
    if (data === 0) {
      return next(new AppError('Not found this ID', 404));
    }
    data = await Model.findOne({
      where: { id: req.params.id },
    });
    responseFunction(req, res, 203, data);
  });
};

const getOne = (Model, options) => {
  return catchErrorAsync(async (req, res, next) => {
    let data;
    // console.log(req.params.id);
    if (options) {
      data = await Model.findOne({
        where: {
          id: req.params.id,
        },
        include: options,
      });
    } else {
      data = await Model.findOne({
        where: {
          id: req.params.id,
        },
      });
    }

    responseFunction(req, res, 200, data);
  });
};

const getByUserId = (Model, options, options2) => {
  return catchErrorAsync(async (req, res, next) => {
    let datas;
    const query = queryFunction(req);
    if (options2) {
      datas = await Model.findAll({
        where: { user_id: req.params.user_id },
        include: options,
        ...query,
      });
    } else if (options) {
      datas = await Model.findAll({
        where: { user_id: req.params.user_id },
        include: options,
        ...query,
      });
    } else {
      datas = await Model.findAll({
        where: {
          user_id: req.params.user_id,
        },

        ...query,
      });
    }
    responseFunction(req, res, 200, datas);
  });
};

const getAll = (Model, options, searchField1, searchField2) => {
  return catchErrorAsync(async (req, res, next) => {
    const queryPage = queryFunction(req);
    let searchOption = {};
    let filterOption = {};
    let betweenOption = {};
    let inOption = {};
    if (req.query.between) {
      req.query.between = JSON.parse(req.query.between);
      betweenOption = {
        [Object.keys(req.query.between)[0]]: {
          [Op.between]: req.query.between[[Object.keys(req.query.between)[0]]],
        },
      };
    }

    if (req.query.search) {
      searchOption = {
        [Op.or]: [
          { [searchField1]: { [Op.like]: '%' + req.query.search + '%' } },
          { [searchField2]: { [Op.like]: '%' + req.query.search + '%' } },
        ],
      };
    }
    if (req.query.in) {
      req.query.in = JSON.parse(req.query.in);

      inOption = {
        [Object.keys(req.query.in)[0]]: {
          [Op.in]: req.query.in[Object.keys(req.query.in)[0]],
        },
      };
    }

    if (req.query.filter) {
      filterOption = JSON.parse(req.query.filter);
    }

    const query = {
      where: {
        ...searchOption,
        ...filterOption,
        ...betweenOption,
        ...inOption,
      },
    };
    if (options) {
      query.include = options;
    }

    const data = await Model.findAll({
      ...query,
      ...queryPage,
    });

    let count;
    if (!options) {
      count = await Model.count(query);
    } else {
      count = await Model.findAll(query);
      count = count.length;
    }
    responseFunction(req, res, 200, data, count);
  });
};
const deleteAll = (Model) => {
  return catchErrorAsync(async (req, res, next) => {
    const data = await Model.destroy({ where: { id: req.body } });
    if (!data) {
      return next(new AppError('Document was not found with that ID', 404));
    }

    responseFunction(req, res, 203, data);
  });
};

module.exports = {
  deleteOne,
  updateOne,
  addOne,
  addAll,
  getOne,
  getAll,
  responseFunction,
  getByUserId,
  deleteAll,
};
