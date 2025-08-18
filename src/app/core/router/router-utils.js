// Convertit un chemin en regex avec gestion des paramètres
export function pathToRegex(path, { strict = false, sensitive = false } = {}) {
  const segments = path
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith(":")) {
        const paramName = segment.slice(1);
        return paramName.endsWith("?") ? "(?:/([^/]+))?" : "([^/]+)";
      }
      return sensitive ? segment : segment.toLowerCase();
    });

  const regexStr = `^/${segments.join("/")}${strict ? "" : "/?$"}$`;
  return new RegExp(regexStr, sensitive ? "" : "i");
}

// Trouve la route correspondante avec extraction des paramètres
export function matchRoute(path, routes) {
  const normalizedPath = normalizePath(path);
  console.log(normalizedPath);
  

  for (const route of routes) {
    const match = normalizedPath.match(route.regex);
    if (match) {
      const params = extractParams(route, match);
      return { route, params };
    }
  }
  return null;
}

// Normalise les chemins (suppression doubles slashes, etc.)
function normalizePath(path) {
  // supprime les doublons de slash
  let normalized = path.replace(/\/+/g, "/");

  // si ce n'est pas la racine, on enlève le slash final
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}


// Extrait les paramètres des matches
function extractParams(route, match) {
  return route.params.reduce((acc, param, index) => {
    if (match[index + 1] !== undefined) {
      acc[param] = match[index + 1];
    }
    return acc;
  }, {});
}

// ... (code existant)

export function extractQueryParams(fullPath) {
  const [path, queryHash] = fullPath.split('?');
  const [query, hash] = queryHash?.split('#') || [];
  
  const params = new URLSearchParams(query);
  const queryParams = {};
  
  for (const [key, value] of params.entries()) {
    queryParams[key] = value;
  }

  return {
    path,
    queryParams,
    hash: hash ? `#${hash}` : ''
  };
}

// Nouveau matcher pour routes imbriquées
export function matchNestedRoute(path, routes) {
  const segments = path.split('/').filter(Boolean);
  
  for (let i = segments.length; i > 0; i--) {
    const testPath = '/' + segments.slice(0, i).join('/');
    const parentMatch = matchRoute(testPath, routes);
    
    if (parentMatch) {
      const childPath = '/' + segments.slice(i).join('/');
      const childMatch = matchRoute(childPath, routes);
      
      if (childMatch) {
        return {
          parent: parentMatch,
          child: childMatch
        };
      }
      return parentMatch;
    }
  }
  return null;
}