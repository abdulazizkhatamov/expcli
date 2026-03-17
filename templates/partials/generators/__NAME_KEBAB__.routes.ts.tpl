import { Router } from 'express';

// TODO: import and wire up your controller
// import { __NAME_PASCAL__Controller } from './__NAME_KEBAB__.controller.js';
// import { __NAME_PASCAL__Service } from './__NAME_KEBAB__.service.js';

// const __NAME_CAMEL__Service = new __NAME_PASCAL__Service();
// const __NAME_CAMEL__Controller = new __NAME_PASCAL__Controller(__NAME_CAMEL__Service);

export const __NAME_CAMEL__Router = Router();

__NAME_CAMEL__Router.get('/', (_req, res) => {
  res.json({ success: true, data: [] });
});

__NAME_CAMEL__Router.get('/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params['id'] } });
});

__NAME_CAMEL__Router.post('/', (req, res) => {
  res.status(201).json({ success: true, data: req.body });
});

__NAME_CAMEL__Router.patch('/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params['id'], ...req.body } });
});

__NAME_CAMEL__Router.delete('/:id', (req, res) => {
  res.status(204).send();
});
