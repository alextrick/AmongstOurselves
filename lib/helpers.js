export const apiRequest = async (url, body, newRoute) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (newRoute) {
      await Router.push(newRoute);
    } else {
      return await res.json()
    }
  } catch (error) {
    console.error(error);
  }
};
