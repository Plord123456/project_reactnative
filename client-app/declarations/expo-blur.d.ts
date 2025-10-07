declare module 'expo-blur' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface BlurViewProps extends ViewProps {
    intensity?: number;
    // Accept any string to match runtime values used in the app (e.g. 'systemChromeMaterial')
    tint?: string;
  }

  export class BlurView extends React.Component<BlurViewProps> {}

  export default BlurView;
}
