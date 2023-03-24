export function pathBuilder(path: string) {
  const getRoutParamRegex = /:([a-zA-z]+)/g;

  const pathWithParms = path.replace(getRoutParamRegex, '(?<$1>[a-zA-Z0-9\-_]+)');

  const pathRegex = new RegExp(`^${pathWithParms}$`);

  return pathRegex;
}