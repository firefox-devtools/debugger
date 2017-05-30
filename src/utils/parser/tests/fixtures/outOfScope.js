// Program Scope

function outer() {
  function inner() {
    const x = 1;
  }

  const arrow = () => {
    const x = 1;
  };

  const declaration = function() {
    const x = 1;
  };

  assignment = (function() {
    const x = 1;
  })();

  const iifeDeclaration = (function() {
    const x = 1;
  })();
}

function exclude() {
  function another() {
    const x = 1;
  }
}

const globalArrow = () => {
  const x = 1;
};

const globalDeclaration = function() {
  const x = 1;
};

globalAssignment = (function() {
  const x = 1;
})();

const globalIifeDeclaration = (function() {
  const x = 1;
})();
