const loadSoundFromAsset = function (sound) {
  return Promise.resolve(sound);
};

const loadSound = function (sound) {
  return Promise.resolve(sound);
};

module.exports = {
  loadSound,
  loadSoundFromAsset
};
