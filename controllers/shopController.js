const { Op } = require('sequelize');
const { Shop } = require('../models');

exports.listShops = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const offset = (page - 1) * limit;
  const where = {};
  if (req.query.category) where.category = req.query.category;
  if (req.query.q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.query.q}%` } },
      { description: { [Op.like]: `%${req.query.q}%` } },
      { sector: { [Op.like]: `%${req.query.q}%` } }
    ];
  }
  const order = req.query.sort === 'rating' ? [['rating','DESC']] :
                req.query.sort === 'recent' ? [['createdAt','DESC']] :
                [['visits','DESC']];
  const { rows, count } = await Shop.findAndCountAll({ where, limit, offset, order });
  res.json({ data: rows, meta: { total: count, page, limit } });
};
