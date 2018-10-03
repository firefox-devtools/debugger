/* eslint-disable */
const a = {
    sameName: () => {
        return 1; /* After refresh breakpoint is now set on this line instead. */
    }
}
const b = {
    sameName: () => {
        return 42; /* Set breakpoint here and refresh.*/
    }
}

const e = {
  c: {
    sameName: () => {
        return 42; /* Set breakpoint here and refresh.*/
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
