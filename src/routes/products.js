const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

// Хранилище в оперативной памяти
let products = [];
let nextId = 1;

// Joi-схемы валидации
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other').required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).optional().allow('')
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other').required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().max(500).optional().allow('')
});

const patchProductSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  price: Joi.number().positive(),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other'),
  stock: Joi.number().integer().min(0),
  description: Joi.string().max(500).allow('')
}).min(1);

// GET /api/products — список с фильтрами и пагинацией
router.get('/', (req, res) => {
  let { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.max(1, parseInt(limit, 10) || 10);

  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  if (minPrice !== undefined && !isNaN(Number(minPrice))) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
    filtered = filtered.filter(p => p.price <= Number(maxPrice));
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  res.json({
    data: paginatedData,
    total,
    page,
    limit
  });
});

// GET /api/products/:id — получение одного товара
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.json(product);
});

// POST /api/products — создание товара
router.post('/', validate(createProductSchema), (req, res) => {
  const newProduct = {
    id: nextId++,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock !== undefined ? req.body.stock : 0,
    description: req.body.description || null,
    imageUrl: null,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id — полная замена товара
router.put('/:id', validate(updateProductSchema), (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  const updatedProduct = {
    id,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    description: req.body.description || null,
    imageUrl: products[index].imageUrl,
    createdAt: products[index].createdAt
  };

  products[index] = updatedProduct;
  res.json(updatedProduct);
});

// PATCH /api/products/:id — частичное обновление
router.patch('/:id', validate(patchProductSchema), (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  Object.assign(product, req.body);
  res.json(product);
});

// DELETE /api/products/:id — удаление товара
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  products.splice(index, 1);
  res.json({ message: 'Товар успешно удален' });
});

// POST /api/products/:id/image — загрузка изображения товара
router.post('/:id/image', upload.single('image'), (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Файл изображения не передан' });
  }

  product.imageUrl = `/uploads/products/${req.file.filename}`;
  res.json(product);
});

module.exports = router;