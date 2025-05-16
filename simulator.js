function simulateFIFO(refs, frames) {
  let memory = [];
  let frameStates = [];
  let faults = 0;
  let pageFaultsPerStep = [];

  refs.forEach(ref => {
    let fault = 0;
    if (!memory.includes(ref)) {
      if (memory.length < frames) {
        memory.push(ref);
      } else {
        memory.shift();
        memory.push(ref);
      }
      faults++;
      fault = 1;
    }
    frameStates.push([...memory].concat(Array(frames - memory.length).fill(null)));
    pageFaultsPerStep.push(fault);
  });

  return {
    algorithm: "FIFO",
    totalReferences: refs.length,
    pageFaults: faults,
    faultRate: (faults / refs.length).toFixed(2),
    frameStates,
    pageFaultsPerStep,
    frames
  };
}

function simulateLRU(refs, frames) {
  let memory = [];
  let recent = [];
  let frameStates = [];
  let faults = 0;
  let pageFaultsPerStep = [];

  refs.forEach(ref => {
    let fault = 0;
    if (!memory.includes(ref)) {
      if (memory.length < frames) {
        memory.push(ref);
      } else {
        // remove least recently used
        let lru = recent.shift();
        let index = memory.indexOf(lru);
        memory[index] = ref;
      }
      faults++;
      fault = 1;
    } else {
      // remove and re-add to make most recent
      recent.splice(recent.indexOf(ref), 1);
    }
    recent.push(ref);
    frameStates.push([...memory].concat(Array(frames - memory.length).fill(null)));
    pageFaultsPerStep.push(fault);
  });

  return {
    algorithm: "LRU",
    totalReferences: refs.length,
    pageFaults: faults,
    faultRate: (faults / refs.length).toFixed(2),
    frameStates,
    pageFaultsPerStep,
    frames
  };
}

function simulateOptimal(refs, frames) {
  let memory = [];
  let frameStates = [];
  let faults = 0;
  let pageFaultsPerStep = [];

  refs.forEach((ref, i) => {
    let fault = 0;
    if (!memory.includes(ref)) {
      if (memory.length < frames) {
        memory.push(ref);
      } else {
        let future = refs.slice(i + 1);
        let indexes = memory.map(m => future.indexOf(m));
        let replaceIndex = indexes.indexOf(-1) !== -1
          ? indexes.indexOf(-1)
          : indexes.indexOf(Math.max(...indexes));
        memory[replaceIndex] = ref;
      }
      faults++;
      fault = 1;
    }
    frameStates.push([...memory].concat(Array(frames - memory.length).fill(null)));
    pageFaultsPerStep.push(fault);
  });

  return {
    algorithm: "Optimal",
    totalReferences: refs.length,
    pageFaults: faults,
    faultRate: (faults / refs.length).toFixed(2),
    frameStates,
    pageFaultsPerStep,
    frames
  };
}

module.exports = {
  simulateFIFO,
  simulateLRU,
  simulateOptimal
};
