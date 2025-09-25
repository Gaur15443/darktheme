import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useSharedValue, withTiming } from 'react-native-reanimated';

interface SegmentedCircularProgressProps {
    /** dimensions of the progress bar */
    size?: number;
    /** determines how many segments will be displayed.*/
    progress?: number;
    /** number of segments to display. */
    segments?: number;
    /** Radius of the progress bar */
    radiusOuter?: number;
    /** Radius of the hollow part of the progress bar */
    radiusInner?: number;
    /** Colors to display per segment, if not provided defaults will be shown. */
    segmentColors?: string[];
}

const SegmentedCircularProgress = ({
    size = 100,
    progress = 0,
    segments = 7,
    radiusOuter = 50,
    radiusInner = 30,
    segmentColors = ['#464459', '#5D5B6D', '#747382', '#8B8A97', '#A3A1AC', '#BAB9C1', '#FFF',]
}: SegmentedCircularProgressProps) => {
    const animatedProgress = useSharedValue(progress);

    React.useEffect(() => {
        animatedProgress.value = withTiming(progress, { duration: 500 });
    }, [progress]);

    const centerX = size / 2;
    const centerY = size / 2;
    const angleStep = (2 * Math.PI) / segments;

    const createSegmentPath = (startAngle: number, endAngle: number) => {
        const startOuterX = centerX + radiusOuter * Math.cos(startAngle);
        const startOuterY = centerY + radiusOuter * Math.sin(startAngle);
        const endOuterX = centerX + radiusOuter * Math.cos(endAngle);
        const endOuterY = centerY + radiusOuter * Math.sin(endAngle);

        const startInnerX = centerX + radiusInner * Math.cos(endAngle);
        const startInnerY = centerY + radiusInner * Math.sin(endAngle);
        const endInnerX = centerX + radiusInner * Math.cos(startAngle);
        const endInnerY = centerY + radiusInner * Math.sin(startAngle);

        return `M${startOuterX},${startOuterY} 
            A${radiusOuter},${radiusOuter} 0 0,1 ${endOuterX},${endOuterY} 
            L${startInnerX},${startInnerY} 
            A${radiusInner},${radiusInner} 0 0,0 ${endInnerX},${endInnerY} Z`;
    };

    return (
        <View>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G>
                    {Array.from({ length: segments }).map((_, index) => {
                        const startAngle = index * angleStep - Math.PI / 2;
                        const endAngle = (index + 1) * angleStep - Math.PI / 2;
                        const path = createSegmentPath(startAngle, endAngle);
                        const fillColor =
                            index < animatedProgress.value / (100 / segments)
                                ? segmentColors[index] || "#FFFFFF"
                                : 'transparent';

                        return <Path key={index} d={path} fill={fillColor} />;
                    })}
                </G>
            </Svg>
        </View>
    );
};

export default SegmentedCircularProgress;
