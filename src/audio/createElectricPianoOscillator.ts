import organWave from '/audio/waves/piano.wave.json';

const audioContext = new AudioContext();

const setValueCurveAtTimeForOneMinute = (
  param: AudioParam,
  values: Float32Array,
  startTime: number,
  periodS: number,
) => {
  const SECONDS_IN_MINUTE = 60;
  const repeatTimes = Math.ceil(SECONDS_IN_MINUTE / periodS);
  const valuesLengthForAMinute = repeatTimes * values.length;
  const valuesForAMinute = Float32Array.from({ length: valuesLengthForAMinute }, (_, i) => {
    return values[i % values.length];
  });
  param.setValueCurveAtTime(valuesForAMinute, startTime, SECONDS_IN_MINUTE);
};

const createTremoloNode = (min = 0.2, max = 0.2125, periodMs = 350) => {
  const gainNode = audioContext.createGain();
  setValueCurveAtTimeForOneMinute(
    gainNode.gain,
    new Float32Array([min, max, min]),
    audioContext.currentTime,
    periodMs / 1000,
  );
  return gainNode;
};

export const createElectricPianoOscillator = (frequency: number) => {
  const compressor = audioContext.createDynamicsCompressor();
  compressor.connect(audioContext.destination);
  compressor.threshold.value = -20;
  compressor.knee.value = 40;
  compressor.ratio.value = 2;
  compressor.attack.value = 0.015;
  compressor.release.value = 0.051;

  const tremoloNode = createTremoloNode();
  tremoloNode.connect(compressor);

  const oscillator = audioContext.createOscillator();
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.setPeriodicWave(audioContext.createPeriodicWave(organWave.real, organWave.imag));
  oscillator.connect(tremoloNode);

  return oscillator;
};
