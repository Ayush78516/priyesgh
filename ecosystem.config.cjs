module.exports = {
  apps: [
    {
      name: "covforum",
      script: "./app.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      time: true,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      },
      ignore_watch: [
        "node_modules",
        ".git",
        "front/dist",
        "uploads",
        "Internship-project/uploads"
      ]
    }
  ]
};
