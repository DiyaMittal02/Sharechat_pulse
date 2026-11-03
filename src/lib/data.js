// Loads the synthetic JSON once and caches it in-module (mirrors Scout's
// "fetch once, reuse everywhere" idea without a backend).
const cache = {};
async function load(name) {
  if (cache[name]) return cache[name];
  const res = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`);
  if (!res.ok) throw new Error(`Failed to load ${name}.json`);
  cache[name] = await res.json();
  return cache[name];
}
export const getPosts = () => load('posts');
export const getBenchmarks = () => load('benchmarks');
export const getCreators = () => load('creators');
export const getFunnel = () => load('funnel');
export const getMeta = () => load('meta');

export async function getAll() {
  const [posts, benchmarks, creators, funnel, meta] = await Promise.all([
    getPosts(), getBenchmarks(), getCreators(), getFunnel(), getMeta(),
  ]);
  return { posts, benchmarks, creators, funnel, meta };
}
