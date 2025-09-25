import {parse} from 'react-native-redash';
export const getPathXCenter = currentPath => {
  const curves = parse(currentPath).curves;
  const startPoint = curves[0].to;
  const endPoint = curves[curves.length - 1].to;
  const centerX = (startPoint.x + endPoint.x) / 2;
  return centerX;
};
export const getPathXCenterByIndex = (tabPaths, index) => {
  const curves = tabPaths[index].curves;
  const startPoint = curves[0].to;
  const endPoint = curves[curves.length - 1].to;
  const centerX = (startPoint.x + endPoint.x) / 2;
  return centerX;
};
