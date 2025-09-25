import React, {createContext, useContext} from 'react';
import Orientation from 'react-native-orientation-locker';

const OrientationContext = createContext();

export const useOrientation = () => {
  return useContext(OrientationContext);
};

export const OrientationProvider = ({children}) => {
  const lockToPortrait = () => {
    Orientation.lockToPortrait();
  };

  const unlockAllOrientations = () => {
    Orientation.unlockAllOrientations();
  };

  return (
    <OrientationContext.Provider
      value={{lockToPortrait, unlockAllOrientations}}>
      {children}
    </OrientationContext.Provider>
  );
};
