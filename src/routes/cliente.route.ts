import { Router } from "express";
import ClienteController  from "../controllers/cliente.controller";

const routerCliente = Router();

routerCliente.post('/agregar', ClienteController.agregarCliente); 

routerCliente.get('/', ClienteController.obtenerClientes);

routerCliente.get('/:id', ClienteController.obtenerCliente);

routerCliente.put('/actualizar/:id', ClienteController.actualizarCliente);

routerCliente.delete('/eliminar/:id', ClienteController.eliminarCliente);

export default routerCliente;