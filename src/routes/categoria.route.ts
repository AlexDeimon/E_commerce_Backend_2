import { Router } from "express";
import CategoriaController from "../controllers/categoria.controller";

const routerCategoria = Router();

routerCategoria.post('/crear', CategoriaController.crearCategoria);

routerCategoria.get('/productos/:categoria', CategoriaController.obtenerProductosPorCategoria);

routerCategoria.get('/', CategoriaController.obtenerCategorias);

routerCategoria.delete('/eliminar/:categoria', CategoriaController.eliminarCategoria);

export default routerCategoria;