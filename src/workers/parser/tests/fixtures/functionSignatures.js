/* eslint-disable */
const a = {
    sameName: () => {
        return 1;
    }
}
const b = {
    sameName: () => {
        return 42;
    }
}

const e = {
  c: {
    sameName: () => {
        return 42;
    }
  }
}

const f =  {}
f.sameName = function() {
  return 5;
}

class d {
	sameName(){
    	return 3;
    }
}

function sameName() {
  return 2;
}
