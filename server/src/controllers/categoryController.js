import Category from '../models/Category.js';
import { deleteImage } from '../config/cloudinary.js';

export const getCategories = async (req, res, next) => {
  try {
    const { status = 'active', all, parent } = req.query;
    const filter = status === 'all' ? {} : { status };
    if (parent) {
      filter.parent = parent; // fetch subcategories of a specific parent ID
    } else if (!all) {
      filter.parent = null; // root categories only (default for client)
    }
    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) { next(err); }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (err) { next(err); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category updated', category });
  } catch (err) { next(err); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (category.image?.publicId) await deleteImage(category.image.publicId).catch(() => {});
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};
