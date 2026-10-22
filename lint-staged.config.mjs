// 项目未安装 ESLint / Biome / oxlint，pre-commit 先用 Node 内置语法检查兜底。
// 后续接入 linter 后，把下面的规则替换为该 linter 的 --fix 命令即可。
export default {
  '*.js': 'node --check',
};
