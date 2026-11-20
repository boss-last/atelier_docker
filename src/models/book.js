const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Le titre est obligatoire'], trim: true },
    author: { type: String, required: [true, "L'auteur est obligatoire"], trim: true },
    page: {
      type: Number,
      required: [true, 'Le nombre de pages est obligatoire'],
      min: [1, 'Le nombre de pages doit être supérieur à 0'],
    },
  },
  {
    versionKey: false,
    toJSON: {
      // Expose "id" au lieu de "_id"
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return { id: ret.id, title: ret.title, author: ret.author, page: ret.page };
      },
    },
  }
);

module.exports = mongoose.model('Book', bookSchema);
