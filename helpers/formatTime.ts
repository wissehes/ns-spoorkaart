const formatTime = (date?: string) => {
  if (date) {
    return new Date(date).toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return "--:--";
  }
};

export default formatTime;
