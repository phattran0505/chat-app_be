export const SOCKET_EVENTS = {
  ADDED_CONTACT: "addedContact",
};

export const emitAddedContact = (io, data) => {
  if (!io) return;

  io.emit(SOCKET_EVENTS.ADDED_CONTACT, data);
};
