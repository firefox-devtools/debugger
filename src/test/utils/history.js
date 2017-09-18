let logs = [];
export function getHistory(query: ?string = null) {
  if (!query) {
    return logs;
  }

  return logs.filter(log => log.type === query);
}

export function clearHistory() {
  logs = [];
}
