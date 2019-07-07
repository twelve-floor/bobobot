export const eventConverter = rawEvent => ({
  start: new Date(rawEvent.date),
  end: new Date(rawEvent.date),
  title: rawEvent.name,
  id: rawEvent._id,
});
