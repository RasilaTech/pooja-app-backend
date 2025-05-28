import express, { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "../controllers/product.controller";

const router = express.Router();

router.route("/").get(getAllProducts).post(createProduct);

router.route("/:id").get(getProductById).delete(deleteProduct);

export default router;
