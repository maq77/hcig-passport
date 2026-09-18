import { useEffect, useState } from 'react';

// Hash routes, so every view and every ticket has a link: #/board, #/task/T-001, #/run/<id>.
export type Route = { view: string; id?: string };

function parse(): Route {
  const [, view = 'home', id] = location.hash.replace(/^#/, '').split('/');
  return { view: view || 'home', id: id ? decodeURIComponent(id) : undefined };
}

export function navigate(path: string) {
  location.hash = path.startsWith('#') ? path : `#${path}`;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}
