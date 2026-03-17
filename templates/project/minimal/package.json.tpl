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
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "tsup": "^8.2.4",
    "tsx": "^4.16.2",
    "typescript": "^5.5.4"
  }
}
