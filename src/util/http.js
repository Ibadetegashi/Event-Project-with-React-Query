export async function fetchEvents({ signal, search }) {
  let url = "";
  if (search) {
    url += "?search=" + search;
  }
  const response = await fetch("http://localhost:3000/events" + url, {
    signal,
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}
