export async function apiRequest (url, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return await res.json()
  } catch (error) {
    console.error(error);
  }
};

export function addToQuery(router, params) {
  const newQuery = { ...router.query, ...params };

  router.push(
    { pathname: router.pathname, query: newQuery },
    null,
    { shallow: true, scroll: false }
  );
}
