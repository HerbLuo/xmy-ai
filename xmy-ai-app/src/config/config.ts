import { useXmy } from "../context/XmyContext";

// export const XmyAppSite = __DEV__ ? "http://127.0.0.1:5173" : "https://xmy-ai.cn";
export const XmyAppSite = "https://xmy-ai.cn";
export const LightTheme = "#004585";
export const DarkTheme = "#3d3d3d";
export const headerHeightBig = 38
export const headerHeightMiddle = 25
export const headerHeightSmall = 15

export function useHeaderHeight(): number {
  const { headerSize } = useXmy();
  return {
    big: headerHeightBig, 
    middle: headerHeightMiddle, 
    small: headerHeightSmall,
  }[headerSize]
}
