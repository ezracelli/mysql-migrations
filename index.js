var fs = require("fs");

var coreFunctions  = require('./core_functions');
var queryFunctions  = require('./query');

var config = require('./config');
var table = config['table'];
var migrations_types = config['migrations_types'];

function init (command) {
  return function migration(conn, path, cb, args) {
    if(!cb) cb = () => {};
    if (!args) args = [];
  
    queryFunctions.run_query(conn, "CREATE TABLE IF NOT EXISTS `" + table + "` (`timestamp` varchar(254) NOT NULL UNIQUE)", function (res) {
      handle(command, conn, path, cb, args);
    });
  }
}

function handle(command, conn, path, cb, args) {
  if (args && args.length <= 3) {
    if (command == 'add' && (args[0] == 'migration' || args[0] == 'seed')) {
      coreFunctions.add_migration(args, path, cb);
    } else if (command == 'up') {
      var count = null;
      if (args.length) {
        count = parseInt(args[0]);
      } else {
        count = 999999;
      }
      coreFunctions.up_migrations(conn, count, path, cb);
    } else if (command == 'down') {
      var count = null;
      if (args.length) {
        count = parseInt(args[0]);
      } else count = 1;
      coreFunctions.down_migrations(conn, count, path, cb);
    } else if (command == 'refresh') {
      coreFunctions.down_migrations(conn, 999999, path, function () {
        coreFunctions.up_migrations(conn, 999999, path, cb);
      });
    } else if (command == 'run' && migrations_types.indexOf(args[1]) > -1) {
      coreFunctions.run_migration_directly(args[0], args[1], conn, path, cb);
    } else {
      throw new Error('command not found : ' + commands.join(" "));
    }
  }
}

module.exports = {
  init: init,
  up: init('up'),
  add: init('add'),
  down: init('down'),
  refresh: init('refresh'),
  run: init('run'),
};
