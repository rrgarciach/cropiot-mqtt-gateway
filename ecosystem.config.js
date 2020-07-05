const config = {
  production: {
    apps: [
      {
        name: 'mqtt-gateway',
        script: './index.js',
        exec_mode: 'fork',
        merge_logs: true,
        time: true,
      },
    ]
  },
  development: {
    apps: [
      {
        name: 'mqtt-gateway',
        script: './index.js',
        exec_mode: 'fork',
        watch: true,
        ignore_watch: ['.git/', '.idea', '.pm2', 'migrations', 'db'],
        time: true,
      },
    ]
  },
};

module.exports = config[process.env.NODE_ENV || 'development'];
