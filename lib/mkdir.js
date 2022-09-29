const fs = require('fs');

const mkDirs = {
    data: {
      current: 0,
      total: 0,
      log: '',
    },
    libPath: '',
    type: '',
    init (dbs, path, type) {
      this.libPath = path;
      this.type = type;
      this.total(dbs);
      this.create(dbs, path);
    },
    create (dbs, path) {
      var self = this;
      for (var i = 0; i < dbs.length; i++) {
        var name = dbs[i].name;
        var child = dbs[i].child;
        var path_block = path ? (path + '/' + name) : name;
        if (name.lastIndexOf('.') === -1) {
          (function(path, child, name) {
            fs.mkdir(path, function(err) {
              if (err) {
                return console.error(err);
              }
              self._nodeTree(++self.data.current, path, name);
              if (child) {
                self.create(child, path);
              }
            })
          })(path_block, child, name);
        } else {
          (function(path, val, name) {
            fs.appendFile(path_block, val ? val : '', 'utf8', function(err) {
              if (err) {
                return console.error(err);
              }
              self._nodeTree(++self.data.current, path, name);
            })
          })(path_block, dbs[i].val, name);
        }
      }
    },
    total (arr) {
      var self = this;
      function count (dbs, j) {
        for (var i = 0; i < dbs.length; i++) {
          (function(dbs, i, j){
            var log = log_j(j);
            var name = dbs[i].name.lastIndexOf('.') === -1 ? dbs[i].name : ('\x1B[39m' + dbs[i].name + '\x1B[39m');
            self.data.log += log + '--' + name + '\n';
            if (dbs[i].child) {
              count(dbs[i].child, ++j);
            }
            self.data.total++;
          })(dbs, i, j ? j : 0)
        }
      }
      function log_j (val) {
        var log = '';
        if (val === 0) {
          return '|';
        }
        for (var i = 0; i < val; i++) {
          log += '  ' + '|';
        }
        return '|' + log;
      }
      count(arr);
    },
    _nodeTree (current, path, name) {
      console.log('[' + current + '/' + this.data.total + '] \x1B[90m' + name + '\x1B[39m' + '\x1B[32m' + ' installed ' + '\x1B[39m'  + ' at ' + path);
      if (current === this.data.total) {
        console.log('\x1B[32m' + 'All package installed ' + this.data.total + ' file install from ' + this.libPath + '\x1B[39m');
        console.log('\x1B[35m' + 'Library catalogue: ' + '\x1B[39m');
        console.log(this.data.log + '-------------------------------------');
        console.log('\x1B[36m' + 'Power By: gitguanqi\nGithub：https://github.com/gitguanqi/xqlib-cli' + '\x1B[39m');
        console.log('Library is successfully installed, please run the following command: ');
        console.log(`  cd ${this.libPath}`);
        if (this.type === 'webpack') {
          console.log('  npm install');
          console.log('  webpack');
        } else {
          console.log('  npm run test:node');
          console.log('  npm run test:browser');
        }
        console.log('Thank you very much for using this scaffolding to generate the js standard library!');
      }
    }
}

module.exports = mkDirs;
