{
  "name": "__PROJECT_NAME__",
  "version": "0.1.0",
  "description": "",
  "type": "module",
  "scripts": {
    "build": "tsup",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "tsup": "^8.2.4",
    "tsx": "^4.16.2",
    "typescript": "^5.5.4"
  }
}
