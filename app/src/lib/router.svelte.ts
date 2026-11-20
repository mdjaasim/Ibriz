// Tiny hash router. Routes are screen ids; params go after a colon (#/lesson:basics-1).

export type Route = { id: string; param: string }

function parse(): Route {
  const h = location.hash.replace(/^#\/?/, '') || 'today'
  const [id, param = ''] = h.split(':')
  return { id, param: decodeURIComponent(param) }
}

class Router {
  route = $state<Route>(parse())
  constructor() {
    addEventListener('hashchange', () => (this.route = parse()))
  }
  go(id: string, param = '') {
    location.hash = '/' + id + (param ? ':' + encodeURIComponent(param) : '')
  }
  back(fallback = 'today') {
    if (history.length > 1) history.back()
    else this.go(fallback)
  }
}

export const router = new Router()
export const href = (id: string, param = '') =>
  '#/' + id + (param ? ':' + encodeURIComponent(param) : '')
