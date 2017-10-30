import { zip } from "lodash";

export function asyncTimes(name) {
  return zip(
    window.performance.getEntriesByName(`${name}_start`),
    window.performance.getEntriesByName(`${name}_end`)
  ).map(([start, end]) => +(end.startTime - start.startTime).toPrecision(2));
}

function times(name) {
  return window.performance
    .getEntriesByName(name)
    .map(time => +time.duration.toPrecision(2));
}

function stats(times) {
  if (times.length == 0) {
    return { times: [], avg: null, median: null };
  }
  const avg = times.reduce((sum, time) => time + sum, 0) / times.length;
  const sortedtimings = [...times].sort((a, b) => a - b);
  const median = sortedtimings[times.length / 2];
  return {
    times,
    avg: +avg.toPrecision(2),
    median: +median.toPrecision(2)
  };
}

export function steppingTimings() {
  const commands = asyncTimes("COMMAND");
  const paused = times("PAUSED");

  return {
    commands: stats(commands),
    paused: stats(paused)
  };
}

// console.log("..", asyncTimes("COMMAND"));
