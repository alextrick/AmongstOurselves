import { clearInterval } from "timers";

export const HUE_USERNAME = 'Pjx7sOpZziCGjt2mPLDVCdNbG8BBYjC-fGYEwQlB';
export const LOCAL_IP = '192.168.0.30';

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

function createRandomNumber() {
  return Math.random * 127 + 33;
}

export function lightsControl(lights, colour, flash, randomBrightness, randomColour) {
  const bsl = {
    bri: randomBrightness ? (Math.random * 127 + 33) : 127,
    sat: randomColour && createRandomNumber(),
    hue: randomColour && createRandomNumber(),
    ...colour
  }

  
  if (flash) {
    let on = true;

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
              ...bsl
            }),
          }
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }

  // function resetLights() {
  //   clearInterval(interval);

  //   // TODO - Send request for default light settings.
  //   // TODO - Test this and move elsewhere.
  //   // Perhaps lights are always flashing between matches?
  //   // Random brightness?

  //   const intervals = [];

  //   for (let light of lights) {  
  //     const interval = setInterval(() => {
  //       fetch(
  //         `http://${LOCAL_IP}/api/${HUE_USERNAME}/lights/${light}/state`,
  //         {
  //           method: 'PUT',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({
  //             on,
  //             sat: 0,
  //             bri: (Math.random * 127),
  //             hue: 0
  //           }),
  //         }
  //       );
  //     }, (Math.random * 2000) + 1000);

  //     intervals.push(interval);
  //   }

  //   function clearLights() {
  //     for (let interval of intervals) {
  //       clearInterval(interval);
  //     }
  //   }

  //   return clearLights;
  // }
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
