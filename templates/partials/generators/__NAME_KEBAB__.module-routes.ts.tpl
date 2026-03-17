import { Router } from 'express';
import { __NAME_PASCAL__Service } from './__NAME_KEBAB__.service.js';
import { __NAME_PASCAL__Controller } from './__NAME_KEBAB__.controller.js';

const __NAME_CAMEL__Service = new __NAME_PASCAL__Service();
const __NAME_CAMEL__Controller = new __NAME_PASCAL__Controller(__NAME_CAMEL__Service);

export const __NAME_CAMEL__Router = Router();

__NAME_CAMEL__Router.get('/', (req, res) => __NAME_CAMEL__Controller.findAll(req, res));
__NAME_CAMEL__Router.get('/:id', (req, res, next) => __NAME_CAMEL__Controller.findOne(req, res, next));
__NAME_CAMEL__Router.post('/', (req, res, next) => __NAME_CAMEL__Controller.create(req, res, next));
__NAME_CAMEL__Router.patch('/:id', (req, res, next) => __NAME_CAMEL__Controller.update(req, res, next));
__NAME_CAMEL__Router.delete('/:id', (req, res, next) => __NAME_CAMEL__Controller.remove(req, res, next));
