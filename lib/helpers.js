import { clearInterval } from "timers";

const HUE_USERNAME = 'Pjx7sOpZziCGjt2mPLDVCdNbG8BBYjC-fGYEwQlB';
const LOCAL_IP = '192.168.0.30';

export async function apiRequest (url, body, noJSON) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (noJSON) {
      return res;
    }

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


export async function lights() {
  let on = true;

  // TODO - Fetch light IDS from GET request.
  // http://${LOCAL_IP}/api/${HUE_USERNAME}/lights
  const res = await fetch(
    `http://${LOCAL_IP}/api/${HUE_USERNAME}/lights/`,
  )
  const lights = Object.keys(await res.json());

  // const lights = [1, 2];


  const interval = setInterval(() => {
    on = !on;

    for (let light of lights) {  
      fetch(
        `http://${LOCAL_IP}/api/${HUE_USERNAME}/lights/${light}/state`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            on,
            sat: 254,
            bri: 127,
            hue: 0
          }),
        }
      );
    }
  }, 2000);

  function resetLights() {
    clearInterval(interval);

    // TODO - Send request for default light settings.
    // TODO - Test this and move elsewhere.
    // Perhaps lights are always flashing between matches?
    // Random brightness?

    const intervals = [];

    for (let light of lights) {  
      const interval = setInterval(() => {
        fetch(
          `http://${LOCAL_IP}/api/${HUE_USERNAME}/lights/${light}/state`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              on,
              sat: 0,
              bri: (Math.random * 127),
              hue: 0
            }),
          }
        );
      }, (Math.random * 2000) + 1000);

      intervals.push(interval);
    }

    function clearLights() {
      for (let interval of intervals) {
        clearInterval(interval);
      }
    }

    return clearLights;
  }

  return resetLights;
}

export function createArrayOfRandomIndices(totalIndices, arrayLength, unique) {
  const randomIndices = [];

  while (randomIndices.length < totalIndices) {
    const index = Math.floor(Math.random() * arrayLength);

    if (unique) {
      if (randomIndices.indexOf(index) === -1) {
        randomIndices.push(index);
      }
    } else {
      randomIndices.push(index);
    }
  }

  return randomIndices;
}
