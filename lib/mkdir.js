const fs = require('fs');
const fsp = fs.promises;

/**
 * 串行写入模板树：顺序确定、进度可对应、重跑不会追加内容
 */
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
      // 每次调用都重置统计，避免同一进程内多次生成时累积
      this.data = { current: 0, total: 0, log: '' };
      this.total(dbs);
      return this.create(dbs, path);
    },
    async create (dbs, path) {
      for (const item of dbs) {
        const name = item.name;
        const child = item.child;
        const pathBlock = path ? (path + '/' + name) : name;
        if (this._isDir(name)) {
          await fsp.mkdir(pathBlock, { recursive: true });
          this._nodeTree(++this.data.current, pathBlock, name);
          if (child) {
            await this.create(child, pathBlock);
          }
        } else {
          await fsp.writeFile(pathBlock, item.val ? item.val : '', 'utf8');
          this._nodeTree(++this.data.current, pathBlock, name);
        }
      }
    },
    // 模板数据里用「名字是否带扩展名」区分目录与文件，保持既有约定
    _isDir (name) {
      return name.lastIndexOf('.') === -1;
    },
    total (arr) {
      var self = this;
      function count (dbs, depth) {
        dbs.forEach(function (item) {
          var name = self._isDir(item.name) ? item.name : ('\x1B[39m' + item.name + '\x1B[39m');
          self.data.log += log_j(depth) + '--' + name + '\n';
          self.data.total++;
          if (item.child) {
            count(item.child, depth + 1);
          }
        });
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
      count(arr, 0);
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
          console.log('  npm run build');
          console.log('  npm test');
        } else {
          console.log('  npm test');
          console.log('  npm run test:browser');
        }
        console.log('Thank you very much for using this scaffolding to generate the js standard library!');
      }
    }
}

module.exports = mkDirs;
