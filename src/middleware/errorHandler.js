export default function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).send(err.message || 'Internal Server Error');
}
