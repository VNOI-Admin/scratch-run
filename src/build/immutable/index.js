// scratch-vm uses immutable to implement "monitor", i.e. tracking values of variables.
// We don't need this functionality, so we can replace it with a dummy module.

class _Record {
  get() {
    return null;
  }

  set() {
    return this;
  }
}

class _Map {
  get() {
    return null;
  }

  set() {
    return this;
  }
}

class _OrderedMap {
  get size() {
    return 0;
  }

  valueSeq() {
    return [];
  }

  equals() {
    return true;
  }

  has() {
    return false;
  }

  get() {
    return null;
  }

  set() {
    return this;
  }

  delete() {
    return this;
  }

  filterNot() {
    return this;
  }
}

module.exports = {
  Record: () => () => new _Record(),
  Map: () => new _Map(),
  OrderedMap: () => new _OrderedMap()
};
