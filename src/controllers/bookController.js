const mongoose = require('mongoose');
const Book = require('../models/book');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/books
exports.getAll = async (_req, res, next) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id
exports.getOne = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Id invalide' });
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// POST /api/books
exports.create = async (req, res, next) => {
  try {
    const { title, author, page } = req.body;
    const book = await Book.create({ title, author, page });
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

// PUT /api/books/:id
exports.update = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Id invalide' });
    const { title, author, page } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, page },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/books/:id
exports.remove = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Id invalide' });
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
