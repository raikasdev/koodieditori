import { useState } from 'react';

const useInit = (initCallback: () => void) => {
  const [initialized, setInitialized] = useState(false);

  if (!initialized) {
    initCallback();
    setInitialized(true);
  }
};

export default useInit;
