function markdownMiddleware(req, res, next) {
  const accept = req.headers['accept'] || '';
  if (accept.includes('text/markdown')) {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      res.set('Content-Type', 'text/markdown; charset=utf-8');
      res.send(toMarkdown(data));
    };
  }
  next();
}

function toMarkdown(data, depth = 0) {
  if (data === null || data === undefined) {
    return '';
  }
  if (typeof data !== 'object') {
    return String(data);
  }
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return toMarkdown(item, depth + 1);
        }
        return `- ${item}`;
      })
      .join('\n\n');
  }
  const lines = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const heading = '#'.repeat(Math.min(depth + 2, 6));
      lines.push(`${heading} ${key}\n\n${toMarkdown(value, depth + 1)}`);
    } else if (Array.isArray(value)) {
      lines.push(toMarkdown(value, depth + 1));
    } else {
      lines.push(`**${key}** : ${value}`);
    }
  }
  return lines.join('\n');
}

module.exports = markdownMiddleware;
